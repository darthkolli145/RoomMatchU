# Setting Up Mapbox for Distance Calculations

RoomMatchU uses Mapbox Directions API to calculate accurate driving distances from UC Santa Cruz campus to listings. Without a Mapbox API key, the app will fall back to straight-line distance estimates (multiplied by 1.3 to approximate road distance).

## Getting a Free Mapbox API Key

1. Sign up for a free account at [Mapbox](https://account.mapbox.com/auth/signup/)
2. After logging in, go to your [Account Dashboard](https://account.mapbox.com/)
3. Find your default public token or create a new one
4. Copy the token

## Setting Up the API Key

1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace `your_mapbox_token_here` with your actual Mapbox token:
   ```
   VITE_MAPBOX_API_KEY=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsc29tZXRoaW5nIn0.yourtoken
   ```

3. Restart the development server for the changes to take effect

## Free Tier Limits

Mapbox's free tier includes:
- 100,000 free requests per month for Directions API
- No credit card required

This is more than sufficient for development and moderate production use.

## Fallback Behavior

If the Mapbox API key is not configured or if API calls fail, the app will:
1. Calculate straight-line distance using the Haversine formula
2. Multiply by 1.3 to estimate road distance
3. Display the result (with a note that it's an estimate if UI supports it)

This ensures the app continues to work even without the API key, though with less accurate distance calculations. 