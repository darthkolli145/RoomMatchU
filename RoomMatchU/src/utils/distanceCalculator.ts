// UC Santa Cruz coordinates
const UCSC_LAT = 36.9916;
const UCSC_LNG = -122.0583;

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance from UC Santa Cruz
 * @param lat Latitude of the location
 * @param lng Longitude of the location
 * @returns Distance in miles from UCSC, or null if coordinates are invalid
 */
export function calculateDistanceFromUCSC(lat?: number, lng?: number): number | null {
  if (lat === undefined || lng === undefined || lat === 0 || lng === 0) {
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