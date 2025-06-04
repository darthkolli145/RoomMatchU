import { calculateDistanceFromUCSC } from './distanceCalculator';

const UCSC_COORDS = [-122.0583, 36.9916]; // lng, lat

export interface DistanceResult {
  distance: number | null;
  isEstimate: boolean;
}

export async function getRoadDistanceFromUCSC(lat: number, lng: number): Promise<number | null> {
  const result = await getRoadDistanceFromUCSCWithInfo(lat, lng);
  return result.distance;
}

export async function getRoadDistanceFromUCSCWithInfo(lat: number, lng: number): Promise<DistanceResult> {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
  
  // Check if we have a valid Mapbox API key
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    console.warn('Mapbox API key not configured. Falling back to straight-line distance.');
    // Fallback to Haversine formula for straight-line distance
    return {
      distance: calculateDistanceFromUCSC(lat, lng),
      isEstimate: true
    };
  }
  
  const destCoords = `${lng},${lat}`; // Mapbox uses lng,lat

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${UCSC_COORDS[0]},${UCSC_COORDS[1]};${destCoords}?access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    
    // Check if the response is ok
    if (!res.ok) {
      console.warn(`Mapbox API returned ${res.status}: ${res.statusText}. Falling back to straight-line distance.`);
      return {
        distance: calculateDistanceFromUCSC(lat, lng),
        isEstimate: true
      };
    }
    
    const data = await res.json();

    if (data.routes && data.routes[0] && data.routes[0].distance) {
      const meters = data.routes[0].distance;
      const miles = meters / 1609.34;
      return {
        distance: Math.round(miles * 10) / 10,
        isEstimate: false
      };
    } else {
      console.warn('No route returned from Mapbox. Falling back to straight-line distance.');
      return {
        distance: calculateDistanceFromUCSC(lat, lng),
        isEstimate: true
      };
    }
  } catch (err) {
    console.error('Mapbox Directions API error:', err);
    // Fallback to straight-line distance calculation
    return {
      distance: calculateDistanceFromUCSC(lat, lng),
      isEstimate: true
    };
  }
}
