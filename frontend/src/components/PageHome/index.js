
import { getFunctions, httpsCallable } from 'firebase/functions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import PlaceIcon from '@mui/icons-material/Place';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import { styled as styledMUI } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Fragment, useState } from "react";
import styled from 'styled-components';
import { getAnalytics, logEvent } from "firebase/analytics";
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
const { Map } = require('../Map/map');



const Content = styled.div`
  margin: auto;
  max-width: 600px;
  @media (max-width: 600px) {
    max-width: 100%;
  }
`;
const StyledInputs = styled.div`
  display: flex;
  margin-bottom: 20px;
  margin-top: 15px;
`
const StyledRecommendationsBox = styled.div`
  height: fit-content;
  max-height: 400px;
  overflow-y: scroll;
  margin: 25px auto;
  background: /* Shadow covers */
  linear-gradient(#fafafa 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), #fafafa 70%) 0 100%, /* Shadows */
  radial-gradient(50% 0, farthest-side, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(50% 100%, farthest-side, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)) 0 100%;
  background: /* Shadow covers */
  linear-gradient(#fafafa 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), #fafafa 70%) 0 100%, /* Shadows */
  radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)) 0 100%;
  background-repeat: no-repeat;
  background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
  /* Opera doesn't support this in the shorthand */
  background-attachment: local, local, scroll, scroll;
`
const StyledChooseTags = styled.div`
  margin-right: 10px;
  width: 100%;
`;
const ButtonGetRecommendations = styledMUI(Button)({
  fontSize: '16px',
  height: '52px',
  width: '52px',
  padding: '5px 0px',
  color: 'var(--button-color)',
  border: '1px solid var(--button-border-color)',
  backgroundColor: 'var(--button-background-color)',
  '&:hover': {
    backgroundColor: 'var(--button-background-color-hover)',
    borderColor: 'var(--button-border-color-hover)',
  },
})
const StyledRecommendationName = styled.div`
  color: var(--text-color-secondary);
  line-height: 1.2;
  margin-top: 15px;
`
const StyledTags = styled.div`
  color: #777;
  font-size: 15px;
  font-style: italic;
  margin: -3px 0px;
`
const StyledRecommendationLocation = styled.div`
  font-size: 16px;
`
const StyledRecommendationLocationLink = styled.a`
  text-decoration: none;
  &:hover {
    color: var(--text-color-secondary);
  };
`
const StyledRecommendationLink = styled.a`
  font-size: 15px;
  &:hover {
    color: var(--text-color-secondary);
  };
`
const StyledRecommendationRecommenders = styled.div`
  display: flex;
  font-size: 16px;
  margin-top: 5px;
`
const StyledRecommendationRecommender = styled.a`
  background-color: var(--button-background-color-secondary);
  border: 1px solid var(--button-border-color-secondary);
  border-radius: 5px;
  color: var(--button-color-secondary);
  margin-right: 5px;
  padding: 0px 5px;
  text-decoration: none;
  &:hover {
    background-color: var(--button-background-color-hover-secondary);
  }
`
const CustomChip = ({ index, option, getTagProps }) => {
  return (
    <Chip
      key={index}
      label={option.label}
      style={{
        backgroundColor: 'var(--button-background-color-secondary-dark)',
        border: '1px solid var(--button-border-color-secondary)',
        color: 'white',
        marginRight: '2px',
        '&:hover': {
          backgroundColor: 'var(--button-background-color-hover-secondary-dark)',
        },
      }}
      {...getTagProps({ index })}
    />
  );
};
const StyledInfo = styled.p`
color: #555;
  font-size: 20px;
  font-style: italic;
  line-height: 1;
  margin: 6px 10px 10px 0px;
`;
const StyledInfoDiv = styled.div`
  display: flex;
  @media (max-width: 675px) {
    display: block;
  }
`
const StyledTag = styled.div`
  background-color: var(--button-background-color-secondary-dark);
  border: 1px solid var(--button-border-color-secondary);
  border-radius: 16px;
  color: white;
  font-size: 15px;
  margin: 0px 0px 25px 5px;
  padding: 5px 12px;
  width: fit-content;
  @media (max-width: 450px) {
    margin: 0px auto 25px;
  }
`
const StyledButtonCreateAccount = styled(Link)`
  background-color: var(--button-background-color);
  border: 1px solid var(--button-border-color);  
  border-radius: 5px;
  color: var(--button-color);
  font-size: 18px;
  font-weight: 200;
  padding: 7px 0px;
  text-align: center;
  text-decoration: none;
  width: 100%;
  min-width: 300px;
  
  &:hover {
    background-color: var(--button-background-color-hover);
    border-color: var(--button-border-color-hover);
  };
`


export default function PageHome({uid, tagsAll, usernames}) {

  const functions = getFunctions();
  const analytics = getAnalytics()
  const [loading, setLoading] = useState(false)

  const [tags, setTags] = useState(false);
  const [recommendations, setRecommendations] = useState(false);
  async function getRecommendations() {
    setRecommendations(false)
    const response = await fetchRecommendations();
    setRecommendations(response)
  }

  async function fetchRecommendations() {    
    setLoading(true)
    logEvent(analytics, 'Search tags', { tags: tags})
    const getRecommendationsFunction = httpsCallable(functions, 'get_recommendations');
    const response = await getRecommendationsFunction({tags: tags.map(tag => tag.replace(/[^a-z0-9]+/g, '')), uid: uid})
    setLoading(false)
    try {
      const data = await response['data']['results'].map(doc => {
        return {
          title: doc['title'],
          latitude: doc['latitude'],
          longitude: doc['longitude'],
          location: doc['location'],
          url: doc['url'],
          tags: doc['tags'],
          recommenders: doc['recommenders'],
        }
      });
      return data;
    }
    catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }

  return (
    <Content>
      { tagsAll && <div>
        <StyledInputs>
          <StyledChooseTags>
            <Autocomplete
              disablePortal
              multiple
              autoHighlight
              id="recommendation-tags"
              options={tagsAll.concat(usernames)}
              groupBy={(option) => option.group}
              onChange={(event, option) => {
                if (option.length > 0) {
                  if (option[option.length - 1]?.group === 'users') {
                    window.location.href = `/${option[option.length - 1].label}`;
                  }
                }
                setTags(option.map(o => o.label));
              }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root.Mui:hover .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid rgba(0, 58, 60, 0.2)",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid rgba(0, 58, 60, 1)",
                },
              }}
              renderInput={(params) => <TextField {...params} label="Search recommendations" variant="outlined" />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <CustomChip index={index} option={option} getTagProps={getTagProps} />
                ))
              }
            />
          </StyledChooseTags>
          <ButtonGetRecommendations
            color="success"
            variant="outlined"
            onClick={getRecommendations}          
          >
            <SubdirectoryArrowLeftIcon/>
          </ButtonGetRecommendations>
        </StyledInputs>        
        {loading && <div style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
          <CircularProgress/>
        </div>}
        {recommendations && <StyledRecommendationsBox>{
          recommendations?.map((recommendation, index) => (
            <Fragment key={index}>
              <Typography variant="h6" component="div" gutterBottom>
                <StyledRecommendationName>{recommendation.title}</StyledRecommendationName>
                <StyledTags>
                  {recommendation.tags.sort().join(', ')}                  
                </StyledTags>
                {recommendation.location && <StyledRecommendationLocation>
                  {/* Create a link to google maps using the recommendation title and location when the user clicks on PlaceIcon */}
                  <StyledRecommendationLocationLink href={`https://www.google.com/maps/search/${recommendation.title}+${recommendation.location}`} target="_blank">
                    <PlaceIcon style={{
                      color: 'var(--button-background-color-secondary-dark)',
                      margin: "2px 0 -5px -5px",
                    }}/>
                    {recommendation.location}
                  </StyledRecommendationLocationLink>
                </StyledRecommendationLocation>}
                {recommendation.url && <div style={{marginTop: "-5px", marginBottom: "10px", lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  <StyledRecommendationLink href={recommendation.url} target="_blank">{recommendation.url.startsWith("http") ? recommendation.url : `https://${recommendation.url}`}</StyledRecommendationLink>
                </div>}
                <StyledRecommendationRecommenders>{recommendation.recommenders.map((recommender, rIndex) => (
                  <StyledRecommendationRecommender href={`/${recommender}`} key={rIndex}>{recommender}</StyledRecommendationRecommender>
                ))}</StyledRecommendationRecommenders>
              </Typography>
            </Fragment>
          ))
        }</StyledRecommendationsBox>}
        {recommendations && <Map recommendations={recommendations} />}
        {(recommendations && recommendations?.length === 0) && <div style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
          <p style={{fontSize: '20px', color: '#222'}}>
            There aren't any recommendations that match all of those tags.
          </p>
        </div>}
        {(!recommendations && uid === "default" && !loading) && <div style={{margin: '30px auto 10px'}}>
          <StyledInfoDiv>
            <StyledInfo>Search for recommendations using tags</StyledInfo>
            <StyledTag>vancouver</StyledTag>
          </StyledInfoDiv>
          <StyledInfoDiv>
            <StyledInfo>Use multiple tags to be more specific</StyledInfo>
            <div style={{display: 'flex'}}>
              <StyledTag>vancouver</StyledTag>
              <StyledTag>restaurant</StyledTag>
              <StyledTag>sharing plates</StyledTag>
            </div>
          </StyledInfoDiv>
          <StyledInfoDiv>
            <StyledInfo>Search for a user to see all of their recommendations</StyledInfo>
            <StyledTag>dave</StyledTag>
          </StyledInfoDiv>
            <StyledInfo>Create an account to add your own recommendations</StyledInfo>
          <StyledInfoDiv>
            <div style={{minWidth: '100%', display: 'flex'}}>
            <StyledButtonCreateAccount to={ROUTES.SIGN_UP}>
              Create an Account
          </StyledButtonCreateAccount>
          </div>
          </StyledInfoDiv>
        </div>}
      </div>}
    </Content>
  );
}
