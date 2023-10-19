import Chip from '@mui/material/Chip';


function addRecommendation(recommendations, getRecommendations) {
  const newID = Math.random();
  const newRecommendation = {
    id: 'new_recommendation_' + newID,
    location: '',
    recommenders: [],
    note: '',
    tags: [],
    title: '',
    url: '',
  };
  getRecommendations([...recommendations, newRecommendation]);
}


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


function deleteRecommendation(recommendations, recommendationID, setRecommendations) {
    const updatedRecommendations = recommendations.filter(r => r.id !== recommendationID);
    setRecommendations(updatedRecommendations);
}



function dictionaryMatcher(dictionaries, targetDictionary) {
  if (!dictionaries || dictionaries.length === 0) {
    return false;
  }
  return dictionaries.some(dictionary => {
    // Check if the dictionary has the same keys as the target dictionary
    const targetKeys = Object.keys(targetDictionary);

    // Check if all keys and values match
    return targetKeys.every(key => {
      if (key === 'tags') {
        // Handle special case for 'tags' key
        const dictionaryTagsString = dictionary['tags'].map(tag => tag.label).join(', ');
        const targetDictionaryTagsString = targetDictionary['tags'].join(', ');
        return dictionaryTagsString === targetDictionaryTagsString;
      } else {
        // Check regular key-value pairs
        if (Array.isArray(targetDictionary[key])) {
          // Handle arrays
          const dictionaryKeyString = dictionary[key].join(', ');
          const targetDictionaryKeyString = targetDictionary[key].join(', ');
          return dictionaryKeyString === targetDictionaryKeyString;
        } else {
          // Handle non-array values
          return dictionary[key] === targetDictionary[key];
        }
      }
    });
  });
}



const handleFieldChange = (recommendations, recommendationId, field, value, getTitleForSearching, getRecommendations) => {
        
    const updatedRecommendations = recommendations.map((recommendation) => {
      if (recommendation.id === recommendationId) {
        if (field === "title" && value) {
          getTitleForSearching(value);
        }
        else if (field === "tags") {
          const newValue = value.map(_convertToDictionary);
          const newTags = newValue.map(tag => ({ label: tag }));
          return { ...recommendation, tags: newTags };
        } 
        return { ...recommendation, [field]: value};
      }
        return recommendation;
    });
    getRecommendations(updatedRecommendations);
};


const _convertToDictionary = (item) => {
  if (typeof item === 'object') {
    // Check if title is a key of the item dictionary
    if (item.hasOwnProperty('title')) {
      return item.title;
    }
    return item.label;
  }
  return item.toLowerCase();
};


function generateSubstrings(text) {
  const substrings = [];

  // Split the text into words and lowercase
  const textSplit = text.toLowerCase().split(" ");

  // Generate all possible combinations of words
  const textCombos = textSplit.map((_, index) => textSplit.slice(index).join(" "));

  // Extract substrings of length 3 to 10 from each combination
  for (const textCombo of textCombos) {
      for (let i = 3; i <= Math.min(10, textCombo.length); i++) {
          substrings.push(textCombo.slice(0, i));
      }
  }
  return substrings;
}


function handleResultClick(recommendations, recommendationId, result, username, getRecommendations) {
  const updatedRecommendations = recommendations.map((recommendation) => {
    if (recommendation.id === recommendationId) {
      return {
        note: "",
        id: result.id,
        location: result.location,
        recommenders: result.recommenders.concat(username),
        tags: result.tags.map(tag => ({label: tag})),
        title: result.title,
        url: result.url,
      };
    }
    return recommendation;
  });
  getRecommendations(updatedRecommendations);
}


function replaceInvalidID(recommendations) {
  const recommendationsToSave = recommendations.map(recommendation => {
    // Check if the id starts with "new_"
    if (recommendation.id.startsWith('new_recommendation_')) {
      // Replace id with title
      return { ...recommendation, id: recommendation.title };
    } else {
      return recommendation;
    }
  });
  return recommendationsToSave
}


export {
  addRecommendation,
  CustomChip,
  deleteRecommendation,
  dictionaryMatcher,
  generateSubstrings,
  handleFieldChange,
  handleResultClick,
  replaceInvalidID
};
