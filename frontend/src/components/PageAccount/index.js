import { createFilterOptions } from '@mui/material/Autocomplete';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled as styledMUI } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';

const {
  fetchFollowing, fetchRecommendations,
  removeUsernameFromRecommenders,
  saveFollowing, saveRecommendations, saveTags, saveUserRecommendations, saveUsername, searchName
} = require('./db_handler')
const { addRecommendation, CustomChip, deleteRecommendation, handleFieldChange, handleResultClick, replaceInvalidID } = require('./utils');
const filterAutocomplete = createFilterOptions();


const Content = styled.div`
  margin: auto;
  max-width: 1000px;
`;
const StyledUsernameContainer = styled.div`
  display: flex;
`;
const StyledButtonSaveUsername = styledMUI(Button)({
  backgroundColor: 'var(--button-background-color)',
  border: '1px solid var(--button-border-color)',
  color: 'black',
  height: '56px',
  marginLeft: '20px',
  '&:hover': {
    backgroundColor: 'var(--button-background-color-hover)',
    borderColor: 'var(--button-border-color-hover)',
  },
  '&:disabled': {
    border: '1px solid rgba(1, 148, 154, 0)',
  }
})
const StyledHint = styled.div`
  font-size: 16px;
  font-style: italic;
  color: var(--text-color-secondary);
  line-height: 1;
  max-width: 560px;
  margin-bottom: 15px;
  margin-top: -10px;
`;
const StyledButtonSaveRecommendations = styledMUI(Button)({
  backgroundColor: 'var(--button-background-color)',
  border: '1px solid var(--button-border-color)',
  color: 'black',
  width: '100px',
  '&:hover': {
    backgroundColor: 'var(--button-background-color-hover)',
    borderColor: 'var(--button-border-color-hover)',
  },
  '&:disabled': {
    border: '1px solid rgba(1, 148, 154, 0)',
  }
})
const StyledRecommendations = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 2fr);
  gap: 0px 15px;

  @media (max-width: 850px) {
    grid-template-columns: 2fr;
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;
const StyledRecommendationBox = styled.div`
  border: 1px solid black;
  border-radius: 5px;
  font-size: 12px;
  min-height: 85%;
  padding: 10px 15px;
  margin: 10px auto;
  @media (max-width: 700px) {
    min-height: 200px;
  }
`
const StyledRecommendationItem = styled.div`
  margin: 5px auto;
  // Update Input to have 0 padding
  input {
    padding: 0px 0px 3px;
  }
`;
const StyledAutocompleteBox = styled.div`
  border: 1px solid black;
  border-radius: 3px;
  cursor: pointer;
  margin: 5px;
  padding: 5px;
  &:hover {
    background-color: rgba(1, 148, 154, 0.05);
  }
`;
const StyledAutocompleteField = styled.div`
  font-size: 14px;
`;
const StyledAutocompleteTags = styled.div`
  font-size: 14px;
  font-style: italic;
`;
const StyledButtonDeleteRecommendation = styledMUI(Button)({
  backgroundColor: 'rgba(0, 58, 60, 0.1)',
  borderColor: 'rgba(0, 58, 60, 0.5)',
  color: 'rgba(0, 58, 60, 1)',
  float: 'right',
  fontSize: '10px',
  padding: '2px 8px',
  marginBottom: '-15px',
  minWidth: '20px',
  zIndex: 1,
  '&:hover': {
    backgroundColor: 'rgba(0, 58, 60, 0.2)',
    borderColor: 'rgba(0, 58, 60, 0.6)',
  },
})

const StyledButton = styled.div`
  margin: 15px auto 10px;
  max-width: 600px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const StyledButtonAddRecommendation = styledMUI(Button)({
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


export default function PageAccount({
  uid,
  tagsAll, getTagsAll,
  username, getUsername, usernames,
  usernamePage, getUsernamePage,
  following, getFollowing,
  followingOriginal, getFollowingOriginal,
}) {

  // Get the username from the URL
  const url = window.location.href;
  const urlParts = url.split('/');
  const urlExtension = urlParts[urlParts.length - 1];
  useEffect(() => {
    if (urlExtension) {
      getUsernamePage(urlExtension);
      setUsernameNew(urlExtension);
    }
  }, [urlExtension]);
  
  const db = getFirestore();

  const [loading, setLoading] = useState(false)

  const [usernamePageUID, setUsernamePageUID] = useState(null);  
  const getUsernamePageUID = (usernamePageUID) => {
    setUsernamePageUID(usernamePageUID);
  }
  // Update the following value when usernamePage or username change 
  useEffect(() => {
    if (usernamePage && username && (usernamePage !== username)) {
      fetchFollowing(db, usernamePage, getUsernamePageUID, getFollowing);
    }
  }, [usernamePage, username]);


  // Data and code for setting a new username
  const [usernameNew, setUsernameNew] = useState(usernamePage)
  const [usernameTaken, setUsernameTaken] = useState(false)
  const [saveUsernameButtonText, setSaveUsernameButtonText] = useState('Save');
  const getSaveUsernameButtonText = (text) => {setSaveUsernameButtonText(text)}
  const getUsernameNew = (name) => {
    name = name.toLowerCase()
    setUsernameNew(name)
    setSaveUsernameButtonText("Save")
    if (usernames.map(u => u.label).includes(name)) {setUsernameTaken(true)}
    else {setUsernameTaken(false)}
  };

  // Identify if a user name is taken or invalid
  let invalidUsername = (
    usernameNew === '' ||
    usernameNew === username ||
    usernameNew === 'all_usernames' ||
    usernameTaken
  )
  
  
  // Save who the user is following whenever its value changes
  useEffect(() => {
    saveFollowing(db, uid, following, followingOriginal, getFollowingOriginal, username, usernamePage)
  }, [following])

  // Fetch recommendations for the User ID of the page
  useEffect(() => {
    if (usernamePageUID) {
      setLoading(true)
      fetchRecommendations(db, usernamePageUID)
        .then((userRecommendations) => {
          setRecommendations(userRecommendations);
          setRecommendationsOriginal(userRecommendations);
        });
      setLoading(false)
    }
  }, [usernamePageUID])


  const [recommendations, setRecommendations] = useState([]);
  const getRecommendations = (r) => {setRecommendations(r)}
  const [recommendationsOriginal, setRecommendationsOriginal] = useState([]);
  // Save new order of recommendations after drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    
    // Reorder the recommendations in your state
    const updatedRecommendations = [...recommendations];
    const [reorderedItem] = updatedRecommendations.splice(result.source.index, 1);
    updatedRecommendations.splice(result.destination.index, 0, reorderedItem);

    // Set the state with the new order of recommendations
    setRecommendations(updatedRecommendations);
  };

  // Save new and update recommendations
  const [saveRecommendationsButtonText, setSaveRecommendationsButtonText] = useState('Save');
  const getSaveRecommendationsButtonText = (text) => {
    setSaveRecommendationsButtonText(text)
  }

  const saveRecommendationsFunctions = async () => {

    // Update Save Recommendations Button text to indicate that it is being saved
    setSaveRecommendationsButtonText(<CircularProgress size={20} style={{ color: 'black' }} />);
    
    const updatedRecommendations = replaceInvalidID(recommendations)
    const userRecommendationsToSave = updatedRecommendations.map(recommendation => ({
      [recommendation.id]: recommendation.note
    }))

    saveUserRecommendations(db, uid, userRecommendationsToSave)
    saveRecommendations(db, recommendations, recommendationsOriginal, username, getSaveRecommendationsButtonText)
    saveTags(db, tagsAll, recommendations, getTagsAll)
    removeUsernameFromRecommenders(db, recommendationsOriginal, recommendations, username)
  };


  const [results, setResults] = useState([]);
  const getResults = (results) => {setResults(results) }
  const [titleForSearching, setTitleForSearching] = useState('');
  const [titleForSearchingCurrent, setTitleForSearchingCurrent] = useState('');
  const getTitleForSearching = (t) => {
    setTitleForSearching(t)
    setTimeout(() => {setTitleForSearchingCurrent(t)}, 200);
  }
  useEffect(() => {
    if (titleForSearching && (titleForSearching === titleForSearchingCurrent)) {
      searchName(db, titleForSearching, getResults);
    }
  }, [titleForSearchingCurrent]);

  return (
    <Content>
      <StyledUsernameContainer>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          disabled={username !== usernamePage}
          value={usernameNew}
          onChange={(event) => getUsernameNew(event.target.value)}
          sx={{
            "& .MuiOutlinedInput-root.Mui:hover .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(1, 99, 103, 1);",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(1, 99, 103, 1);",
            },
          }}
        />
        <StyledButtonSaveUsername disabled={invalidUsername || username !== usernamePage} variant="contained" color="primary"
          onClick={() => {saveUsername(db, uid, usernameNew, usernames, username, recommendations, getSaveUsernameButtonText, getUsername)}}>
          {saveUsernameButtonText}
        </StyledButtonSaveUsername>
      </StyledUsernameContainer>

      {usernames.length > 0 && <div>
        <h2>Following</h2>

        <StyledHint>Follow your friends so that their recommendations are ranked first.</StyledHint>        

        <StyledRecommendationItem><Autocomplete
          multiple
          id="following-usernames"
          // Filter usernames that are in following or equal to username
          options={usernames.filter(user => !following.includes(user.label) && user.label !== username)}
          onChange={(event, option) => getFollowing(option.map(o => o.label))}
          disabled={username !== usernamePage}
          value={following?.map(f => ({ label: f }))}
          renderInput={(params) => <TextField {...params} size="small" label="Following" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <CustomChip index={index} option={option} getTagProps={getTagProps} />
            ))
          }
          sx={{
            "& .MuiOutlinedInput-root.Mui:hover .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(1, 99, 103, 1);",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(1, 99, 103, 1);",
            },
          }}
        /></StyledRecommendationItem>
      </div>}


      <h2>Recommendations from {usernamePage}</h2>
      
      {recommendations.length > 0 && <div>
        <StyledButtonSaveRecommendations
          variant="contained"
          color="primary"
          disabled={username !== usernamePage}
          onClick={() => {saveRecommendationsFunctions()}}
        >
          {saveRecommendationsButtonText}
        </StyledButtonSaveRecommendations>
        
        <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <StyledRecommendations {...provided.droppableProps} ref={provided.innerRef}>
              {recommendations.map((recommendation, index) => (
                <Draggable key={recommendation.id} draggableId={recommendation.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <StyledRecommendationBox key={recommendation.id}>
                        <StyledButtonDeleteRecommendation
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={username !== usernamePage}
                          onClick={() => {deleteRecommendation(recommendations, recommendation.id, setRecommendations)}}
                        >
                          X
                        </StyledButtonDeleteRecommendation>
                        <StyledRecommendationItem>
                          <TextField
                            label="Name of Recommendation"
                            variant="standard"
                            disabled={username !== usernamePage}
                            fullWidth
                            value={recommendation.title}
                            onChange={(event) => handleFieldChange(
                              recommendations, recommendation.id, 'title', event.target.value, getTitleForSearching, getRecommendations
                            )}
                          />
                          {recommendation.title === titleForSearching && (
                            <div>
                              {results.map((result) => (
                                <StyledAutocompleteBox
                                  key={result.id}
                                  onClick={() => {
                                    handleResultClick(recommendations, recommendation.id, result, username, getRecommendations);
                                    setTitleForSearching(false)
                                    setResults([])
                                  }}
                                >
                                  {<StyledAutocompleteField>{result.title}</StyledAutocompleteField>}
                                  {<StyledAutocompleteTags>{result.tags.join(", ")}</StyledAutocompleteTags>}
                                  {<StyledAutocompleteField>{result.location}</StyledAutocompleteField>}
                                  {<StyledAutocompleteField>{result.url}</StyledAutocompleteField>}
                                </StyledAutocompleteBox>
                              ))}
                            </div>
                          )}
                        </StyledRecommendationItem>
                        <StyledRecommendationItem><Autocomplete
                          freeSolo
                          multiple
                          autoHighlight
                          selectOnFocus
                          autoSelect={window.innerWidth < 500}
                          disabled={username !== usernamePage}
                          id="recommendation-tags"
                          options={tagsAll.filter(tag => !recommendation.tags.map(t => t.label).includes(tag.label))}
                          filterOptions={(options, params) => {
                            const filtered = filterAutocomplete(options, params);
                            if (params.inputValue !== '') {
                              filtered.push({
                                title: params.inputValue,
                                label: `Add "${params.inputValue}"`,
                              });
                            }
                            return filtered;
                          }}
                          getOptionLabel={(option) => {
                            if (typeof option === 'string') {
                              return option;
                            }
                            if (option.title) {
                              return option.title;
                            }
                            return option.label;
                          }}
                          renderOption={(props, option) => <li {...props}>{option.label}</li>}
                          // getOptionLabel={(option) => option.label.label}
                          onChange={(event, option) => handleFieldChange(
                            recommendations, recommendation.id, 'tags', option, getTitleForSearching, getRecommendations
                          )}
                          value={recommendation.tags}
                          renderInput={(params) => <TextField {...params} variant="standard" size="small" label="Tags" />}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <CustomChip index={index} option={option} getTagProps={getTagProps} />
                            ))
                          }
                        /></StyledRecommendationItem>
                        <StyledRecommendationItem><TextField
                          label="Note"
                          variant="standard"
                          size="small"
                          fullWidth
                          multiline
                          inputProps={{style: {fontSize: 15, lineHeight: 1.2}}}
                          disabled={username !== usernamePage}
                          value={recommendation.note}
                          onChange={(event) => handleFieldChange(
                            recommendations, recommendation.id, 'note', event.target.value, getTitleForSearching, getRecommendations
                          )}
                        /></StyledRecommendationItem>
                        <StyledRecommendationItem><TextField
                          label="Location"
                          variant="standard"
                          size="small"
                          fullWidth
                          inputProps={{style: {fontSize: 15}}}
                          disabled={username !== usernamePage}
                          value={recommendation.location}
                          onChange={(event) => handleFieldChange(
                            recommendations, recommendation.id, 'location', event.target.value, getTitleForSearching, getRecommendations
                          )}
                        /></StyledRecommendationItem>
                        <StyledRecommendationItem><TextField
                        sx={{ fontSize: '10px' }}
                          label="Website"
                          variant="standard"
                          size="small"
                          fullWidth
                          inputProps={{style: {fontSize: 14}}}
                          disabled={username !== usernamePage}
                          value={recommendation.url}
                          onChange={(event) => handleFieldChange(
                            recommendations, recommendation.id, 'url', event.target.value, getTitleForSearching, getRecommendations
                          )}
                        /></StyledRecommendationItem>
                      </StyledRecommendationBox>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </StyledRecommendations>
          )}
        </Droppable>
        </DragDropContext>
      </div>}

      {loading && <div style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
        <CircularProgress style={{ color: 'black' }}/>
      </div>}

      {!loading && <StyledButton>
        <StyledButtonAddRecommendation variant="contained" disabled={username !== usernamePage} onClick={() => {addRecommendation(recommendations, getRecommendations)}}>
          Add a Recommendation
        </StyledButtonAddRecommendation>
      </StyledButton>}
    </Content>
  )
}
