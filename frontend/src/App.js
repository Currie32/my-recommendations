import { getDoc, getFirestore, doc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

import './App.css';
import { AuthContext } from "./contexts/AuthContext";
import * as ROUTES from './constants/routes';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import PageAccount from './components/PageAccount';
import PageHome from './components/PageHome';
import PageLogIn from './components/PageLogIn';
import PagePasswordForgot from './components/PagePasswordForgot';
import PageSignUp from './components/PageSignUp';
import PageTermsOfUse from './components/Footer/termsOfUse';


const StyledPage = styled.div`
  margin-top: 100px;
  min-height: 410px;  
  padding: 0px 25px;
`;


async function fetchUsername(db, uid) {
  try {
    const docRef = doc(db, "usernames", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.data().username;
  } catch (error) {
    console.error("Error fetching username:", error);
    throw new Error("Failed to fetch username");
  }
}


export default function App() {

  const db = getFirestore();
  const { user } = useContext(AuthContext);
  
  const [following, setFollowing] = useState([])
  const [followingOriginal, setFollowingOriginal] = useState([])
  const [redirectToHome, setRedirectToHome] = useState(false)
  const [tagsAll, setTagsAll] = useState([])
  const [uid, setUid] = useState(false);
  const [username, setUsername] = useState(false);
  const [usernames, setUsernames] = useState([])

  const getFollowing = (f) => {setFollowing(f)}
  const getFollowingOriginal = (f) => {setFollowingOriginal(f)}
  const getTagsAll = (tags) => {setTagsAll(tags)}
  const getUsername = (name) => {setUsername(name)}
  
  // Fetch the username and set it in the 'username' state
  useEffect(() => {
    if (user?.uid) {
      setUid(user.uid);
      fetchUsername(db, user.uid).then((name) => {
        setUsername(name);
      });
    } else {
      setUid('default');
      setUsername('default');
    }
  }, [user]);

  // Fetch the tags and set them in the 'tagsAll' state
  useEffect(() => {
    async function fetchTags(db) {
      try {  
        const tagsDocRef = doc(db, "tags", "tags");
        const tagsDocSnap = await getDoc(tagsDocRef);
        let results = tagsDocSnap.data().tags
        results = results.map(tag => ({
          label: tag,
          group: 'tag'
        }));
        setTagsAll(results);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }
    fetchTags(db);
  }, [])

  // Fetch the usernames and set them in the 'usernames' state
  useEffect(() => {
    async function fetchUsernames(db) {
      try {  
        const tagsDocRef = doc(db, "usernames", "all_usernames");
        const tagsDocSnap = await getDoc(tagsDocRef);
        let results = tagsDocSnap.data().usernames
        setUsernames(results.map(name => ({ label: name, group: 'username' })));
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    }
    fetchUsernames(db);
  }, [])

  // Fetch the following users and set them in the 'following' and 'followingOriginal' states
  useEffect(() => {
    if (uid && uid !== 'default') {
      async function fetchFollowing(db) {
        try {  
          const docRef = doc(db, "userFollowing", uid);
          const docSnap = await getDoc(docRef);
          let results = docSnap.data().following
          setFollowingOriginal(results);
          setFollowing(results);
        } catch (error) {
          console.error('Error fetching tags:', error);
        }
      }
      fetchFollowing(db);
    }
  }, [uid])

  // Redirect to home when a user adds an invalid extension
  // e.g. https://my-recommendations.com/InVa1id
  useEffect(() => {
    if (usernames.length > 0) {
      const currentURL = window.location.href;
      const urlParts = currentURL.split('/');
      const extension = urlParts[urlParts.length - 1];
      const notUsername = !usernames.some(
        name => name.label === extension
      );
      const notOtherOptions = ![
        "log-in",
        "password-forgot",
        "sign-up",
        "terms"
      ].includes(extension);

      if (extension && notUsername && notOtherOptions) {
        setRedirectToHome(true)
      } 
    }
  }, [usernames]);

  const [usernamePage, setUsernamePage] = useState(null);
  const getUsernamePage = (name) => {setUsernamePage(name)}

  
  return (
    <Router>
      <Navigation username={username} usernamePage={usernamePage} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPage>
            <Routes>
            <Route
              path="/:username"
              element={
                redirectToHome ? (
                  <Navigate replace to="/" />
                ) : (
                  <PageAccount
                    uid={uid} tagsAll={tagsAll} getTagsAll={getTagsAll}
                    username={username} getUsername={getUsername} usernames={usernames}
                    usernamePage={usernamePage} getUsernamePage={getUsernamePage}
                    following={following} getFollowing={getFollowing}
                    followingOriginal={followingOriginal} getFollowingOriginal={getFollowingOriginal}
                  />
                )
              }
            />
              <Route path={ROUTES.HOME} element={<PageHome uid={uid} tagsAll={tagsAll} usernames={usernames} />}/>
              <Route path={ROUTES.LOG_IN} element={<PageLogIn />} />
              <Route path={ROUTES.PASSWORD_FORGET} element={<PagePasswordForgot />} />
              <Route path={ROUTES.SIGN_UP} element={<PageSignUp usernames={usernames} username={username} getUsername={getUsername} />} />
              <Route path={ROUTES.TERMS_OF_USE} element={<PageTermsOfUse />} />
            </Routes>
          </StyledPage>
        </Grid>
      </Grid>
      <Footer />
    </Router>
  );
}
