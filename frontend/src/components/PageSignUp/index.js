import { getAnalytics, logEvent } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { collectionGroup, getFirestore, query, where, getDoc, getDocs, setDoc, doc } from "firebase/firestore";  
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { styled as styledMUI } from '@mui/material/styles';

import * as ROUTES from '../../constants/routes';


const StyledHeader = styled.h1`
  fontSize: 36px;
  text-align: center;
  margin-bottom: 30px;
`;
const StyledTextField = styled.div`
  justify-content: center;
  align-items: center;
  margin: 15px auto 0px;
  max-width: 600px;
`;
const StyledUsernameTaken = styled.p`
  font-size: 14px;
  font-style: italic;
  margin-top: 0px;
`;
const StyledCheckbox = styled.div`
  display: flex;
  justify-content: left;
  align-items: left;
  margin: 15px auto 0px;
  max-width: 600px;
`;
const CheckboxTerms = withStyles({
  root: {
    color: "rgba(0, 44, 25, 0.98)",
    '&$checked': {color: "rgba(0, 44, 25, 0.98)"},
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);
const StyledButton = styled.div`
  margin: 15px auto 50px;
  max-width: 600px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const StyledButtonSignUp = styledMUI(Button)({
  width: '100%',
  backgroundColor: 'var(--button-background-color)',
  border: '1px solid var(--button-border-color)',
  color: 'black',
  '&:hover': {
    backgroundColor: 'var(--button-background-color-hover)',
    borderColor: 'var(--button-border-color-hover)',
  },
  '&:disabled': {
    border: '1px solid rgba(1, 148, 154, 0)',
  }
});
const CssTextField = withStyles({
  root: {
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: '1px solid rgba(0, 0, 0, 0.2)',
      },
      '&:hover fieldset': {
        border: '1px solid rgba(0, 0, 0, 0.3)',
      },
      '&.Mui-focused fieldset': {
        border: '1px solid rgba(0, 0, 0, 0.5)',
      },
    },
  },
})(TextField);


export default function PageSignUp({usernames, username, getUsername}) {

  const db = getFirestore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const getEmail = (event) => {setEmail(event.target.value)};
  const [password, setPassword] = useState('')
  const getPassword = (event) => {setPassword(event.target.value)};
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const getPasswordConfirm = (event) => {setPasswordConfirm(event.target.value)};
  const [terms, setTerms] = useState(false)
  const getTerms = (event) => {
    if (event.target.checked) {
      setTerms(true)
    }
    else {
      setTerms(false)
    }
  };
  const [error, setError] = useState(null)

  let isInvalid = (
    username === '' ||
    (usernames.some((user) => user.label === username)) ||
    email === '' ||
    password === '' ||
    password !== passwordConfirm ||
    !terms
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null)

    const analytics = getAnalytics();
    logEvent(analytics, "new_account");

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;

        sendEmailVerification(user)
          .then(() => {
            // Email sent successfully
          })
          .catch(error => {
            // An error happened while sending the email verification
          });

        // Create a user in the Firebase Firestore database        
        const db = getFirestore()
        setDoc(doc(db, 'users', user.uid), { email })
          .then(() => {
            // Document successfully written
          })
          .catch(error => {
            // An error happened while writing the document
          });
        setDoc(doc(db, 'usernames', user.uid), {
          username: username,
        });
        setDoc(doc(db, 'usernames', 'all_usernames'), {
          // Add username to all_usernames
          usernames: usernames.map(u => u.label).concat(username),
        });
        navigate(ROUTES.HOME)
      })
      .catch((error) => {
        setError(error)
      });
  }  

  return (
    <div>
      <StyledHeader>Sign Up.</StyledHeader>
      <StyledTextField>
        <CssTextField
          label="Username"
          autoComplete='username'
          onChange={(event) => getUsername(event.target.value.toLowerCase())}
          value={username === 'default' ? '' : username}
          variant="outlined"
          style={{width: '100%'}}
        />
        {usernames.some((user) => user.label === username) && <StyledUsernameTaken>Username is taken</StyledUsernameTaken>}
      </StyledTextField>
      <StyledTextField>
        <CssTextField
          label="Email Address"
          autoComplete='email'
          onChange={getEmail}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledTextField>
        <CssTextField
          label="Password"
          autoComplete='password'
          type="password"
          onChange={getPassword}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledTextField>
        <CssTextField
          label="Confirm Password"
          autoComplete='password'
          type="password"
          onChange={getPasswordConfirm}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledCheckbox>
        <FormControlLabel control={<CheckboxTerms checked={terms} onChange={getTerms} />}/>
          <p>I agree to My Recommendations' <Link to={{pathname: "/terms"}}>Terms of Use</Link></p>
      </StyledCheckbox>
      <StyledButton>
        <StyledButtonSignUp
          disabled={isInvalid}
          variant="outlined"
          size="large"
          onClick={onSubmit}
        >
          Sign Up
        </StyledButtonSignUp>
      </StyledButton>
      <StyledTextField>
        {(error && error.message === "Firebase: Error (auth/email-already-in-use).") && 
          <p style={{margin: '-15px auto 50px'}}>Email already in use</p>
        }
      </StyledTextField>
    </div>
  )
}
