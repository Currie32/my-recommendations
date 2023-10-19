import { collection, collectionGroup, doc, getDoc, getDocs, query, setDoc, where, updateDoc } from "firebase/firestore";
import CheckIcon from '@mui/icons-material/Check';

const { dictionaryMatcher, generateSubstrings } = require('./utils');


async function fetchFollowing(db, usernamePage, getUsernamePageUID, getFollowing) {
  try {  
    const querySnapshot = await getDocs(collection(db, "usernames"));
    let usernamePageUID = null; // Initialize the usernamePageUID variable
    const promises = [];

    querySnapshot.forEach((document) => {
      if (document.data().username === usernamePage) {
        // If the username matches the usernamePage, set the usernamePageUID
        usernamePageUID = document.id;
        getUsernamePageUID(usernamePageUID);

        const docRef = doc(db, "userFollowing", usernamePageUID);              
        // Create a promise to get the document data
        const promise = getDoc(docRef);
        promises.push(promise);
      }
    });  
    const results = await Promise.all(promises);
    const followingList = results.filter((result) => result.exists()).flatMap((result) => result.data().following);
    getFollowing(followingList);
  } catch (error) {
    console.error('Error fetching tags:', error);
  }
}


async function fetchRecommendations(db, uid, usernamePageUID) {
  try {
    // Set the document reference to the logged in user
    // Unless they are on the account page of another user
    let userRecommendationsDocRef = doc(db, "userRecommendations", uid);
    if (usernamePageUID && (uid !== usernamePageUID)) {
      userRecommendationsDocRef = doc(db, "userRecommendations", usernamePageUID);
    }
    
    const userRecommendationsDocSnap = await getDoc(userRecommendationsDocRef);
    let recommendationIDs = [];
    let recommendationNotes = [];

    // Get the recommendation IDs and notes from the userRecommendations document
    if (userRecommendationsDocSnap.exists()) {
      const userRecommendationsData = userRecommendationsDocSnap.data().recommendations;
      userRecommendationsData.forEach((userRecommendation) => {
        const userRecommendationID = Object.keys(userRecommendation);
        recommendationIDs.push(...userRecommendationID);

        const userRecommendationsNote = Object.values(userRecommendation);
        recommendationNotes.push(...userRecommendationsNote);
      });
    }

    // Query the Firestore collection for recommendations
    const recommendationsCollection = collectionGroup(db, 'recommendations');
    const batchSize = 30;
    let recommendations = [];

    // Split the recommendationIDs into batches since Firebase's limit is 30 per query
    for (let i = 0; i < recommendationIDs.length; i += batchSize) {
      const batch = recommendationIDs.slice(i, i + batchSize);
      
      // Write the query to fetch the recommendations with the given recommendation IDs
      const queryRecommendations = query(recommendationsCollection, where('id', 'in', batch));
      const queryRecommendationsSnapshot = await getDocs(queryRecommendations);

      // Iterate through the query results and store them in recommendations
      queryRecommendationsSnapshot.forEach((document) => {
        const recommendation = document.data();
        recommendation['tags'] = recommendation.tags.map(tag => ({ label: tag.replaceAll('_', ' ') }));
        recommendations.push(recommendation);
      });
    }

    // Reorder recommendations based on recommendationIDs
    let reorderedRecommendations = recommendationIDs
      .map(id => recommendations.find(recommendation => recommendation.id === id))
      .filter(recommendation => recommendation !== undefined);

    // Add notes to recommendations
    reorderedRecommendations.forEach((recommendation, index) => {
      recommendation['note'] = recommendationNotes[index];
    });

    return reorderedRecommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}


function removeUsernameFromRecommenders(db, recommendationsOriginal, recommendations, username) {
  try {
    recommendationsOriginal.forEach(recommendation => {
      // Check if the recommendation is not in recommendations
      if (!recommendations.some(r => r.id === recommendation.id)) {
        // Remove username from recommenders
        recommendation.recommenders = recommendation.recommenders.filter(r => r !== username);
        setDoc(doc(db, 'recommendations', recommendation.id), recommendation);
      }
    })
  } catch (error) {
    console.error('Error removing username from recommenders:', error);
  }
}


async function saveFollowing(
  db, uid,
  following, followingOriginal, getFollowingOriginal,
  username, usernamePage
) {
  if (
    following !== followingOriginal
    && (following.length > 0 || followingOriginal.length > 0)
    && (username === usernamePage)
  ) {
    try {
      await setDoc(doc(db, 'userFollowing', uid), {
        following: following
      })
      getFollowingOriginal(following)
    } catch (error) {
      console.error('Error saving following:', error);
    }
  }
}


async function saveRecommendations(db, recommendations, recommendationsOriginal, username, getSaveRecommendationsButtonText) {
  try {
    // Loop through recommendations to save the updated / new recommendations
    for (let recommendation of recommendations) {
      // Create a copy of the recommendation object
      let recommendationToSave = { ...recommendation };

      // If recommendation doesn't have a title and tags
      if (!recommendationToSave.title || !recommendationToSave.tags) {
        continue;
      }
    
      // Map tags to label property
      recommendationToSave.tags = recommendationToSave.tags.map(tag => tag.label.trim());
    
      // Check if recommendation already exists
      if (!dictionaryMatcher(recommendationsOriginal, recommendationToSave)) {
        // Add UID to recommenders if not already present
        if (!recommendationToSave['recommenders'].includes(username)) {
          recommendationToSave['recommenders'] = [...recommendationToSave['recommenders'], username];
        }
    
        // Rename the ID of a new recommendation to its title
        if (recommendationToSave.id.startsWith("new_recommendation_")) {
          recommendationToSave.id = recommendationToSave.title.trim();
        }

        // Generate substrings of title for autocomplete search
        const titleSubstrings = generateSubstrings(recommendationToSave.title);
    
        recommendationToSave = {
          id: recommendationToSave.id.trim(),
          location: recommendationToSave.location.trim(),
          recommenders: recommendationToSave.recommenders,
          tags: recommendationToSave.tags.map(tag => tag.replace(/\s+/g, '_')),
          title: recommendationToSave.title.trim(),
          url: recommendationToSave.url.trim(),
          // Create key for each tag in the recommendation and set its value as true
          ...recommendationToSave.tags.reduce((obj, tag) => ({ ...obj, [tag.replace(/\s+/g, '_')]: true }), {}),
          // Create a key for each substring in the title and set its value as true
          ...titleSubstrings.reduce((obj, substring) => ({ ...obj, [substring]: true }), {}),
        };
    
        await setDoc(doc(db, 'recommendations', recommendationToSave.id), recommendationToSave);
    
        // Revert alteration of recommendation tags
        recommendationToSave.tags = recommendationToSave.tags.map(tag => ({ label: tag }));
      }
    }      
    getSaveRecommendationsButtonText(<CheckIcon/>);

    setTimeout(() => {
      getSaveRecommendationsButtonText("Save");
    }, 2000);

  } catch (error) {
    console.error('Error saving recommendations:', error);
    getSaveRecommendationsButtonText("Save");
  }
}


async function saveTags(db, tagsAll, recommendations, getTagsAll) {
  try {
    let tagsToSave = [...tagsAll.map(tag => tag.label)]
    recommendations.forEach(recommendation => {
      recommendation.tags.forEach(tag => {
        if (!tagsToSave.includes(tag.label.trim())) {
          tagsToSave.push(tag.label.trim());
        }
      })
    });

    await setDoc(doc(db, 'tags', 'tags'), {
      tags: tagsToSave,
    });
    getTagsAll(tagsToSave.map(tag => ({ label: tag, group: 'tag' })));
  }
  catch (error) {
    console.error('Error saving tags:', error);
  }
}


async function saveUserRecommendations(db, uid, userRecommendationsToSave) {
  try {
    await setDoc(doc(db, 'userRecommendations', uid), {
      recommendations: userRecommendationsToSave
    })
  } catch (error) {
    console.error('Error saving userRecommendations:', error);
  }
}


async function saveUsername(db, uid, usernameNew, usernames, username, recommendations, getSaveUsernameButtonText, getUsername) {
  try {
    await setDoc(doc(db, 'usernames', uid), {
      username: usernameNew,
    });

    const updatedUsernames = usernames.map(name => {
      if (name.label === username) {return usernameNew}
      else {return name.label}
    });
    await setDoc(doc(db, 'usernames', 'all_usernames'), {
      usernames: updatedUsernames,
    });
    
    for (let recommendation of recommendations) {
      const updatedRecommenders = recommendation.recommenders.map(name => {
        if (name === username) {return usernameNew}
        else {return name}
      });
      await updateDoc(doc(db, "recommendations", recommendation.id), {
        recommenders: updatedRecommenders
      })
    }
  } catch (error) {
    console.error('Error saving username:', error);
  }
  getSaveUsernameButtonText(<CheckIcon/>);
  getUsername(usernameNew)
  
  // Go to the page of usernameNew
  window.location.href = `/${usernameNew}`

  setTimeout(() => {
    getSaveUsernameButtonText("Save");
  }, 3000);
}


async function searchName(db, name, getResults) {
  if (name) {
    try {
      const q = query(collection(db, "recommendations"), where(name.toLowerCase(), "==", true));
      const querySnapshot = await getDocs(q);

      var data = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.data().id,
          location: doc.data().location,
          recommenders: doc.data().recommenders,
          tags: doc.data().tags,
          title: doc.data().title,
          url: doc.data().url,
        })
        if (data.length === 3) {
          return;
        }
      });
      getResults(data);
  } catch (error) {
      console.error('Firebase Firestore search failed:', error);
      getResults([]);
    }
  }
};


export {
  fetchFollowing,
  fetchRecommendations,
  removeUsernameFromRecommenders,
  saveFollowing,
  saveRecommendations,
  saveTags,
  saveUserRecommendations,
  saveUsername,
  searchName
};