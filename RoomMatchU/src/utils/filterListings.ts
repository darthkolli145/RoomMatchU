import { ListingType, CompatibilityScore, UserQuestionnaire, QuestionnaireCategory } from "../types";
import { FilterOptions } from "../components/ListingFilter";
import { calculateCompatibility } from "./compatibilityScoring";

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