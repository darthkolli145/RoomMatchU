/**
 * Geographic distance calculation utilities for determining proximity to UCSC campus
 * Contains functions for calculating straight-line and road distances from listings to campus
 */

// UCSC campus coordinates (latitude and longitude)
const UCSC_COORDINATES = {
  lat: 36.9914,
  lng: -122.0588
};

// Multiplier to estimate road distance from straight-line distance
// Road distances are typically 1.2-1.5x straight-line distances
const ROAD_DISTANCE_MULTIPLIER = 1.3;

/**
 * Converts degrees to radians for trigonometric calculations
 * @param degrees - Angle in degrees
 * @returns number - Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the straight-line distance between two geographic points using the Haversine formula
 * This gives the "as the crow flies" distance, not accounting for roads or terrain
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point  
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns number - Distance in miles
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusMiles = 3959; // Earth's radius in miles
  
  // Convert latitude and longitude differences to radians
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  // Convert latitudes to radians
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  
  // Haversine formula calculation
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = earthRadiusMiles * c;
  
  // Apply road distance multiplier for more realistic estimates
  const estimatedRoadDistance = distance * ROAD_DISTANCE_MULTIPLIER;
  
  return Math.round(estimatedRoadDistance * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculates the straight-line distance from a given location to UCSC campus
 * Convenience function that uses the predefined UCSC coordinates
 * @param lat - Latitude of the location
 * @param lng - Longitude of the location
 * @returns number - Distance in miles from the location to UCSC campus
 */
export function calculateDistanceFromUCSC(lat: number, lng: number): number {
  return calculateDistance(lat, lng, UCSC_COORDINATES.lat, UCSC_COORDINATES.lng);
}

/**
 * Validate if coordinates are valid
 */
function isValidCoordinate(lat: number, lng: number): boolean {
  return lat !== undefined && 
         lng !== undefined && 
         !isNaN(lat) && 
         !isNaN(lng) &&
         lat >= -90 && 
         lat <= 90 && 
         lng >= -180 && 
         lng <= 180 &&
         !(lat === 0 && lng === 0); // Exclude 0,0 as it's often a default/error value
}

/**
 * Format distance for display
 * @param distance Distance in miles
 * @returns Formatted string
 */
export function formatDistance(distance: number | null): string {
  if (distance === null) {
    return 'Distance unavailable';
  }
  
  if (distance < 0.1) {
    return 'On campus';
  } else if (distance < 1) {
    return `${distance} mi from UCSC`;
  } else {
    return `${distance} miles from UCSC`;
  }
} 