import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 15px auto 0px;
  max-width: 600px;
`;
const StyledButton = styled.div`
  margin: 15px auto 30px;
  max-width: 600px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const StyledButtonLogIn = styledMUI(Button)({
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
const StyledTextPasswordForget = styled.p`
  color: black;
  text-decoration: none;
  text-align: center;
`;
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


export default function PageLogIn() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const getEmail = (event) => {setEmail(event.target.value)};
  const [password, setPassword] = useState('')
  const getPassword = (event) => {setPassword(event.target.value)};
  const [error, setError] = useState(null)

  const isInvalid = email === '' || password === '';

  const onSubmit = async (e) => {
    e.preventDefault();
  
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Signed in 
        navigate(ROUTES.HOME)
      })
      .catch((error) => {
        setError(error)
      });
  }

  return (
    <div>
      <StyledHeader>Log In.</StyledHeader>
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
          label='Password'
          type="password"
          autoComplete='password'
          onChange={getPassword}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledButton>
        <StyledButtonLogIn
          disabled={isInvalid}
          variant="outlined"
          size="large"
          style={{width: '100%', height: '55px'}}
          onClick={onSubmit}
        >
          Log In
        </StyledButtonLogIn>
      </StyledButton>
      <StyledTextField>
        {error && <p>{error.message}</p>}
      </StyledTextField>
    <StyledTextPasswordForget>
      <Link to={ROUTES.PASSWORD_FORGET} style={{color: '#0000EE'}}>Forgot Password?</Link>
    </StyledTextPasswordForget>
  </div>
  )
};
