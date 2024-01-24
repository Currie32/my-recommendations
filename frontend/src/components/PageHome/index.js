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


const Content = styled.div`
  margin: auto;
  max-width: 600px;
  @media (max-width: 600px) {
    max-width: 100%;
  }
`;
const StyledHint = styled.div`
  font-size: 16px;
  font-style: italic;
  color: var(--text-color-secondary);
  line-height: 1;
  max-width: 560px;
  margin-bottom: 8px;
`;
const StyledInputs = styled.div`
  display: flex;
  margin-bottom: 20px;
  margin-top: 15px;
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
  margin-top: 15px;
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
const StyledTags = styled.div`
  color: #777;
  font-size: 15px;
  font-style: italic;
  margin: -3px 0px;
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
    const response = await getRecommendationsFunction({tags: tags.map(tag => tag.replace(/\s+/g, '_')), uid: uid})
    setLoading(false)
    try {
      const data = await response['data']['results'].map(doc => {
        return {
          title: doc['title'],
          location: doc['location'],
          url: doc['url'],
          tags: doc['tags'].map(tag => tag.replace('_', ' ')),
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
        <StyledHint>Use tags to find recommended restaurants, podcasts, books, and more.</StyledHint>
        <StyledHint>Combine tags to find more specific recommendations, such as cafes in a particular city.</StyledHint>
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
        {recommendations && 
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
        }
        {recommendations?.length === 0 && <div style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
          <p style={{fontSize: '20px', color: '#222'}}>
            There aren't any recommendations that match all of those tags.
          </p>
        </div>}
      </div>}
    </Content>
  );
}
