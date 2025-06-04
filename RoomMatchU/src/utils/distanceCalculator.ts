// UC Santa Cruz coordinates
const UCSC_LAT = 36.9916;
const UCSC_LNG = -122.0583;

// Multiplier to estimate road distance from straight-line distance
// Road distances are typically 1.2-1.5x straight-line distances
const ROAD_DISTANCE_MULTIPLIER = 1.3;

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Validate coordinates
  if (!isValidCoordinate(lat1, lng1) || !isValidCoordinate(lat2, lng2)) {
    console.warn('Invalid coordinates provided to calculateDistance');
    return 0;
  }
  
  const R = 3959; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Apply road distance multiplier for more realistic estimates
  const estimatedRoadDistance = distance * ROAD_DISTANCE_MULTIPLIER;
  
  return Math.round(estimatedRoadDistance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
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
 * Calculate distance from UC Santa Cruz
 * @param lat Latitude of the location
 * @param lng Longitude of the location
 * @returns Distance in miles from UCSC, or null if coordinates are invalid
 */
export function calculateDistanceFromUCSC(lat?: number, lng?: number): number | null {
  if (lat === undefined || lng === undefined || !isValidCoordinate(lat, lng)) {
    return null;
  }
  
  return calculateDistance(UCSC_LAT, UCSC_LNG, lat, lng);
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