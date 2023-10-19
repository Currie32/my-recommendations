import { useContext, useState } from "react";
import { Link } from 'react-router-dom';
import styled from "styled-components";
import MenuIcon from '@mui/icons-material/Menu';

import { AuthContext } from "../../contexts/AuthContext";
import { useLogout } from "../../hooks/useLogout";
import * as ROUTES from '../../constants/routes';
import '../../App.css';


const Navbar = styled.div`
  background-color: var(--primary-color);
  height: 50px;
  left: 0;
  padding: 0px 0px 20px;
  position: fixed;
  width: 100%;
  z-index: 3;
`;
const StyledMenuIcon = styled.div`
  background-color: var(--primary-color);
  margin: 20px 0px 0px 20px;
  padding: 4px 5px 0px;
  width: fit-content;
`;
const StyledHomeLink = styled.div`
  background-color: var(--primary-color);
  padding: 2px 20px 5px;
  width: fit-content;
  margin: -35px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 1050px) {
    margin: -35px auto;
    padding: 0px 20px 7px;
  };
`;
const ListOrdered = styled.div`
  padding-top: 70px;
  left: 0;
  position: fixed;
  width: 100%;
  z-index: 2;
`;
const List = styled.ul`
  background-color: var(--primary-color);
  overflow-x: auto;
  display: flex;
  justify-content: left;
  align-items: left;
  width: fit-content;
  padding-bottom: 5px;
`;
const ListItemVertical = styled.div`
  background-color: var(--primary-color);
  padding: 0px 15px 0px;
  width: 100%;
  z-index: 3;
  &:hover {
    text-decoration: underline;
    color: white;
  }
`;
const StyledListItemVerticalShadow = styled.div`
  background-color: var(--primary-color);
  width: 80px;
  padding: 2px 25px 5px;
`;
const ListItem = styled.li`
  color: var(--text-color-main);
  display: inline-flex;
  margin: 0px 30px 0px 0px;
  text-align: center;
`;
const StyledLink = styled(Link)`
  font-size: 22px;
  color: var(--text-color-main);
  text-decoration: none;
  white-space: nowrap;
  margin-top: 5px;
`;
const HomeLink = styled(Link)`
  font-size: 28px;
  color: var(--text-color-main);
  text-decoration: none;
  margin-top: 0px;
  text-align: center;
`;
const ButtonSignOut = styled.div`
  font-size: 22px;
  font-family: var(--font-family);
  text-decoration: none;
  cursor: pointer;
  color: var(--text-color-main);
`;


function removeElement() {
    var elem = document.getElementById("chartjs-tooltip");
    if (elem) {
      return elem.parentNode.removeChild(elem);
    }
}


function NavigationAuth({username, usernamePage}) {

  const [menuDisplay, setMenuDisplay] = useState(false)
  const { logout } = useLogout();

  return (
    <div onMouseEnter={() => removeElement()}>
    {window.innerWidth < 1050 && <div>
      <Navbar>
        <StyledMenuIcon><MenuIcon style={{color: 'rgba(255, 255, 255, 1)'}} onClick={() => setMenuDisplay(!menuDisplay)} /></StyledMenuIcon>
        <StyledHomeLink><HomeLink to={ROUTES.HOME}>My Recommendations</HomeLink></StyledHomeLink>
      </Navbar>
      {menuDisplay && <ListOrdered>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.HOME} onClick={() => setMenuDisplay(false)}>Home</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={username} onClick={() => {
          if (usernamePage && (username !== usernamePage)) {
            window.location.href=`/${username}`;
          }
          else {
            setMenuDisplay(false)
          }}}>Account</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow style={{paddingBottom: '15px'}}><ButtonSignOut onClick={() => {setMenuDisplay(false); logout()}}>Sign out</ButtonSignOut></StyledListItemVerticalShadow></ListItemVertical>
      </ListOrdered>}
    </div>}
    {window.innerWidth >= 1050 && <Navbar>
      <List>
        <ListItem><HomeLink to={ROUTES.HOME}>My Recommendations</HomeLink></ListItem>
        <ListItem></ListItem>
        <ListItem><StyledLink to={username} onClick={() => {
          if (usernamePage & (username !== usernamePage)) {
            window.location.href=`/${username}`;
          }
        }}>Account</StyledLink></ListItem>
        <ListItem style={{marginTop: '5px'}}><ButtonSignOut onClick={logout}>Sign out</ButtonSignOut></ListItem>
      </List>
    </Navbar>}
    </div>
  )
}

function NavigationNonAuth() {

  const [menuDisplay, setMenuDisplay] = useState(false)

  return (
    <div onMouseEnter={() => removeElement()}>
    {window.innerWidth < 1050 && <div>
      <Navbar>
        <StyledMenuIcon><MenuIcon style={{color: 'rgba(255, 255, 255, 1)'}} onClick={() => setMenuDisplay(!menuDisplay)} /></StyledMenuIcon>
        <StyledHomeLink><HomeLink to={ROUTES.HOME}>My Recommendations</HomeLink></StyledHomeLink>
      </Navbar>
      {menuDisplay && <ListOrdered>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.HOME} onClick={() => setMenuDisplay(false)}>Home</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.LOG_IN} onClick={() => setMenuDisplay(false)}>Log In</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow style={{paddingBottom: '15px'}}><StyledLink to={ROUTES.SIGN_UP} onClick={() => setMenuDisplay(false)}>Sign Up</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
      </ListOrdered>}
    </div>}
    {window.innerWidth >= 1050 && <Navbar>
      <List>
        <ListItem><HomeLink to={ROUTES.HOME}>My Recommendations</HomeLink></ListItem>
        <ListItem></ListItem>
        <ListItem><StyledLink to={ROUTES.LOG_IN}>Log In</StyledLink></ListItem>
        <ListItem><StyledLink to={ROUTES.SIGN_UP}>Sign Up</StyledLink></ListItem>
      </List>
    </Navbar>}
    </div>
  )
}


export default function Navigation({username, usernamePage}) {

  const { user, authIsReady } = useContext(AuthContext);

  if (!authIsReady) {
    return null
  }
  else {
   return user ? <NavigationAuth username={username} usernamePage={usernamePage} /> : <NavigationNonAuth username={username} />
  }
}
