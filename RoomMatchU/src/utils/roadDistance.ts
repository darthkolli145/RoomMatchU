const UCSC_COORDS = [-122.0583, 36.9916]; // lng, lat

export async function getRoadDistanceFromUCSC(lat: number, lng: number): Promise<number | null> {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
  const destCoords = `${lng},${lat}`; // Mapbox uses lng,lat

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${UCSC_COORDS[0]},${UCSC_COORDS[1]};${destCoords}?access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes[0] && data.routes[0].distance) {
      const meters = data.routes[0].distance;
      const miles = meters / 1609.34;
      return Math.round(miles * 10) / 10;
    } else {
      console.warn('No route returned from Mapbox');
      return null;
    }
  } catch (err) {
    console.error('Mapbox Directions API error:', err);
    return null;
  }
}
