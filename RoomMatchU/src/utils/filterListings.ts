// filterListings.ts
import { ListingType, CompatibilityScore, UserQuestionnaire, QuestionnaireCategory } from "../types/index";
import { FilterOptions } from "../components/ListingFilter";
import { calculateCompatibility } from "./compatibilityScoring";
import { referenceCoords } from "./constants";


// Define a type that extends ListingType to include the calculated compatibility score
export type ListingWithScore = ListingType & { 
  compatibilityScore?: CompatibilityScore 
};

/**
 * Filter listings based on the provided filter options and optional user questionnaire 
 * for compatibility scoring
 */
export function filterListings(
  listings: ListingType[],
  filters: FilterOptions,
  userQuestionnaire?: UserQuestionnaire
): { 
  filteredListings: ListingWithScore[], 
  listingsWithScores: ListingWithScore[] 
} {
  // Calculate compatibility scores for all listings if questionnaire is provided
  const listingsWithScores: ListingWithScore[] = listings.map(listing => {
    if (userQuestionnaire) {
      const compatibilityScore = calculateCompatibility(userQuestionnaire, listing);
      return { ...listing, compatibilityScore };
    }
    return listing as ListingWithScore;
  });
  
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Earth's radius in miles
    const toRad = (deg: number) => (deg * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }

  // Apply filters
  const filteredListings = listingsWithScores.filter(listing => {
    // Price filters
    if (filters.minPrice && listing.price < filters.minPrice) return false;
    if (filters.maxPrice && listing.price > filters.maxPrice) return false;
    
    // Room configuration
    if (filters.bedrooms && listing.bedrooms < filters.bedrooms) return false;
    if (filters.bathrooms && listing.bathrooms < filters.bathrooms) return false;
    
    // Location
    if (filters.onCampus !== undefined && listing.onCampus !== filters.onCampus) return false;
    if (filters.neighborhood && listing.neighborhood !== filters.neighborhood) return false;

    if (
      filters.maxDistance &&
      listing.lat !== undefined &&
      listing.lng !== undefined
    ) {
      const distance = haversineDistance(
        referenceCoords.lat,
        referenceCoords.lng,
        listing.lat,
        listing.lng
      );
      if (distance > filters.maxDistance) return false;
    }
    
    // Pets
    if (filters.pets !== undefined && listing.pets !== filters.pets) return false;
    
    // Compatibility score - Only filter if minCompatibility is explicitly set
    if (
      filters.minCompatibility && 
      filters.minCompatibility > 0 &&
      listing.compatibilityScore && 
      listing.compatibilityScore.score < filters.minCompatibility
    ) {
      return false;
    }
    
    // Priority categories - removed since categoryScores is no longer available
    // We could replace this with a check on matches/conflicts in the future

    // Priority category filtering
    if (filters.priorityCategories && filters.priorityCategories.length > 0 && userQuestionnaire) {
      for (const category of filters.priorityCategories) {
        let userResponse: string | string[] | undefined;
        let listingResponse: string | string[] | undefined;

        // Map fields carefully based on your Firestore structure:
        switch (category) {
          case 'sleepSchedule':
            userResponse = userQuestionnaire?.sharing?.sleepSchedule;
            listingResponse = listing.tags?.sleepSchedule;
            break;
          case 'wakeupSchedule':
            userResponse = userQuestionnaire?.sharing?.wakeupSchedule;
            listingResponse = listing.tags?.wakeupSchedule;
            break;
          case 'visitors':
            userResponse = userQuestionnaire?.sharing?.visitors;
            listingResponse = listing.tags?.visitors;
            break;
          case 'studyHabits':
            userResponse = userQuestionnaire?.sharing?.studySpot;
            listingResponse = listing.tags?.studyHabits;
            break;
          case 'cleanliness':
            userResponse = userQuestionnaire?.cleanliness;
            listingResponse = listing.tags?.cleanliness;
            break;
          case 'noiseLevel':
            userResponse = userQuestionnaire?.noiseLevel;
            listingResponse = listing.tags?.noiseLevel;
            break;
          case 'lifestyle':
            userResponse = userQuestionnaire?.lifestyle;
            listingResponse = listing.tags?.lifestyle;
            break;
        }

        // Handle array vs string comparisons
        if (Array.isArray(userResponse) && Array.isArray(listingResponse)) {
          const overlap = userResponse.some(val => listingResponse.includes(val));
          if (!overlap) return false;
        } else if (typeof userResponse === "string" && typeof listingResponse === "string") {
          if (userResponse.trim() !== listingResponse.trim()) return false;
        } else {
          return false;
        }
      }
    }

    
    return true;
  });
  
  return { 
    filteredListings, 
    listingsWithScores
  };
}

/**
 * Sort listings by compatibility score (highest first)
 */
export function sortListingsByCompatibility(
  listings: ListingWithScore[]
): ListingWithScore[] {
  return [...listings].sort((a, b) => {
    const scoreA = a.compatibilityScore?.score || 0;
    const scoreB = b.compatibilityScore?.score || 0;
    return scoreB - scoreA;
  });
} 