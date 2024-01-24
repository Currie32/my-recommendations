
import { getAnalytics, logEvent } from "firebase/analytics";
import Grid from '@material-ui/core/Grid';
import styled from "styled-components";

import buyMeACoffee from './buyMeACoffee.png';


const FooterSection = styled.div`
  overflow: hidden;
  color: rgba(0, 0, 0, 0.8);
  font-size: 18px;
  bottom: 0;
  z-index: 3;
`;
const StyledList = styled.div`
  display: block;

`;
const List = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px 0px;
  @media (max-width: 683px) {
    display: block;
    justify-content: left;
    align-items: left;
  }
`;
const ListItem = styled.li`
  display: inline-block;
  padding: 3px 20px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
`;
const ListItemLast = styled.li`
  display: inline-block;
  padding: 3px 20px;
`;
const StyledBuyMeACoffee = styled.img`
  width: 150px;
  @media (max-width: 683px) {
    margin: 10px 0px -15px;
  }
`;

export default function Footer() {

  const analytics = getAnalytics()

  function removeElement() {
      var elem = document.getElementById("chartjs-tooltip");
      if (elem) {
        return elem.parentNode.removeChild(elem);
      }
  }

  return (
    <Grid container spacing={3} onMouseEnter={() => removeElement()}>
      <Grid item xs={12}>
        <FooterSection>
          <hr style={{
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
            margin: '15px 3.5% 0px 2%'
          }}/>
          <StyledList>
            <List>
              <ListItem>My Recommendations. All rights reserved.</ListItem>
              <ListItem>
                <a target="_blank" rel="noreferrer" href="https://github.com/Currie32/my-recommendations" onClick={() => {logEvent(analytics, 'Github repo')}}>
                  We're open source!
                </a>
              </ListItem>
              <ListItem>
                <a target="_blank" rel="noreferrer" href="https://techwithdave.xyz" onClick={() => {logEvent(analytics, 'Tech with Dave')}}>
                  Tech with Dave
                </a>
              </ListItem>
              <ListItemLast>
                <a target="_blank" rel="noreferrer" href="https://www.buymeacoffee.com/Currie32" onClick={() => {logEvent(analytics, 'Buy Me a Coffee, Maybe?')}}>
                  <StyledBuyMeACoffee src={buyMeACoffee} />
                </a>
              </ListItemLast>
            </List>
          </StyledList>
        </FooterSection>
      </Grid>
    </Grid>
  )
};
