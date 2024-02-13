import json
import logging

from firebase_admin import credentials, firestore, initialize_app

from google.cloud.firestore_v1.base_query import FieldFilter


# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


def get_recommendations(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    request_parsed = request.get_json()
    logger.info(request_parsed)
    tags = request_parsed['data']['tags']
    uid = request_parsed['data']['uid']

    following = db.collection('userFollowing').document(uid).get()
    if following.exists:
        following = following.to_dict()['following']
    else:
        following = []

    query = build_query(db, tags)
    docs = query.stream()

    results = []
    for doc in docs:
        doc = doc.to_dict()
        results.append({
            "location": doc['location'],
            "latitude": doc.get('latitude'),
            "longitude": doc.get('longitude'),
            "recommenders": doc['recommenders'],
            "tags": doc['tags'],
            "title": doc['title'],
            "url": doc['url'],
        })
    # Sort results by number of recommenders
    results = sorted(
        results,
        key=lambda result: len(result['recommenders']),
        reverse=True
    )

    # Then sort by number of recommenders that user is following
    results_sorted = sorted(
        results,
        key=lambda x: len(set(x['recommenders']).intersection(set(following))),
        reverse=True
    )
    # Put the recommenders that the user is following to the start
    for result in results_sorted:
        result['recommenders'] = (
            [r for r in result['recommenders'] if r in following]
            + [r for r in result['recommenders'] if r not in following]
        )

    response = {'results': results_sorted}

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def build_query(db, tags):

    collection_ref = db.collection("recommendations")
    tag = tags.pop()
    query = collection_ref.where(filter=FieldFilter(tag, "==", True))
    while len(tags) > 0:
        tag = tags.pop()        
        query = query.where(filter=FieldFilter(tag, "==", True))

    return query