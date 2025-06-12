/**
 * Road distance calculation utility using Google Maps Distance Matrix API
 * Provides more accurate distance measurements that account for actual roads and traffic patterns
 */

// UCSC campus coordinates for distance calculations
const UCSC_COORDINATES = {
  lat: 36.9914,
  lng: -122.0588
};

// Cache for storing distance calculations to avoid repeated API calls
const distanceCache = new Map<string, number>();

/**
 * Calculates the actual road/driving distance from a location to UCSC campus using Google Maps API
 * Uses caching to avoid redundant API calls for the same coordinates
 * @param lat - Latitude of the location
 * @param lng - Longitude of the location  
 * @returns Promise<number | null> - Distance in miles, or null if calculation fails
 */
export async function getRoadDistanceFromUCSC(lat: number, lng: number): Promise<number | null> {
  // Create a cache key based on coordinates (rounded to avoid minor variations)
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  // Return cached result if available
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey)!;
  }

  try {
    // Get Google Maps API key from environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found - using fallback distance calculation');
      return null;
    }

    // Construct Google Distance Matrix API URL
    const origin = `${UCSC_COORDINATES.lat},${UCSC_COORDINATES.lng}`;
    const destination = `${lat},${lng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=${apiKey}`;

    // Make API request
    const response = await fetch(url);
    const data = await response.json();

    // Validate API response structure
    if (
      data.status === 'OK' &&
      data.rows?.[0]?.elements?.[0]?.status === 'OK' &&
      data.rows[0].elements[0].distance?.text
    ) {
      // Extract distance value from response text (e.g., "5.2 mi" -> 5.2)
      const distanceText = data.rows[0].elements[0].distance.text;
      const distanceValue = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
      
      // Cache the result for future use
      distanceCache.set(cacheKey, distanceValue);
      
      return distanceValue;
    } else {
      console.warn('Google Distance Matrix API returned invalid data:', data);
      return null;
    }
  } catch (error) {
    console.error('Error calculating road distance:', error);
    return null;
  }
}
