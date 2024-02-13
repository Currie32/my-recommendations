import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { round } from '@floating-ui/utils';
import PlaceIcon from '@mui/icons-material/Place';
import "leaflet/dist/leaflet.css";
import styled from 'styled-components';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [28, 46],
  iconAnchor: [17, 46]
});
L.Marker.prototype.options.icon = DefaultIcon;


const StyledRecommendationName = styled.h3`
  color: var(--text-color-secondary);
  font-size: 16px;
  margin-top: 15px;
`
const StyledTags = styled.div`
  color: #777;
  font-size: 15px;
  font-style: italic;
  margin: -15px 0px 0px;
`
const StyledNote = styled.div`
	font-size: 15px;
	margin-top: 3px;
`
const StyledRecommendationLocation = styled.div`
  font-size: 16px;
	margin: 4px 0px 7px;
`
const StyledRecommendationLocationLink = styled.a`
	color: black;
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


const Map = ({ recommendations, showRecommenders=true }) => {
    const [mapCenter, setMapCenter] = useState([0, 0]); // Default center at (0, 0)
    const [zoom, setZoom] = useState(2); // Default zoom level
    const [recommendationsToPlot, setRecommendationsToPlots] = useState([]);
  
  
    useEffect(() => {
      if (!recommendations || recommendations.length === 0) {
        return;
      }
      // Filter out locations without latitude or longitude values
      const validLocations = recommendations.filter(location => location.latitude && location.longitude);
  
      // Calculate the center of the map based on valid building locations
      if (validLocations.length > 0) {
        const latSum = validLocations.reduce((sum, location) => sum + location.latitude, 0);
        const lonSum = validLocations.reduce((sum, location) => sum + location.longitude, 0);
        const avgLat = latSum / validLocations.length;
        const avgLon = lonSum / validLocations.length;
  
        setMapCenter([avgLat, avgLon]);
        
        // Calculate the maximum distance between two points
        const maxDistance = validLocations.reduce((maxDist, location1) => {
          return validLocations.reduce((innerMaxDist, location2) => {
            const distance = Math.sqrt(
              Math.pow(location2.latitude - location1.latitude, 2) +
              Math.pow(location2.longitude - location1.longitude, 2)
            );
  
            return Math.max(innerMaxDist, distance);
          }, maxDist);
        }, 0);
  
        // Adjust the zoom level based on the maximum distance
        var zoomLevel = round(12 *  (1 - (maxDistance / 140)))
        zoomLevel = Math.max(2, zoomLevel);
        setZoom(zoomLevel);
  
        setRecommendationsToPlots(validLocations);
      }
    }, [recommendations]);
  
    if (recommendationsToPlot.length > 0) {
      return (
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '400px', width: '100%', zIndex: 0}} key={mapCenter[0].toString()}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
  
        {recommendationsToPlot.map((recommendation) => (
          <Marker
            key={recommendation.id}
            position={[recommendation.latitude, recommendation.longitude]}
          >
            <Popup>
              <StyledRecommendationName>{recommendation.title}</StyledRecommendationName>
              {/* <StyledTags>{recommendation.tags.sort().join(', ')}</StyledTags> */}
							{/* If tags have labels sort using the labels otherwise use the tags */}
							<StyledTags>{recommendation.tags.map(tag => (tag.label ? tag.label : tag)).sort().join(', ')}</StyledTags>

							{recommendation.note && <StyledNote>"{recommendation.note}"</StyledNote>}
							{recommendation.location && <StyledRecommendationLocation>
								<StyledRecommendationLocationLink href={`https://www.google.com/maps/search/${recommendation.title}+${recommendation.location}`} target="_blank">
									<PlaceIcon style={{
										color: 'var(--button-background-color-secondary-dark)',
										margin: "2px 0 -5px -5px",
									}}/>
									{recommendation.location}
								</StyledRecommendationLocationLink>
							</StyledRecommendationLocation>}
							{recommendation.url && <div style={{marginTop: "-5px", color: "black", marginBottom: "10px", lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis'}}>
								<StyledRecommendationLink href={recommendation.url} target="_blank">{recommendation.url.startsWith("http") ? recommendation.url : `https://${recommendation.url}`}</StyledRecommendationLink>
							</div>}
              {showRecommenders && <StyledRecommendationRecommenders>{recommendation?.recommenders.map((recommender, rIndex) => (
                <StyledRecommendationRecommender href={`/${recommender}`} key={rIndex}>{recommender}</StyledRecommendationRecommender>
            	))}</StyledRecommendationRecommenders>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      )
    }
  };

  export {
    Map
  }