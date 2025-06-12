// filterListings.ts
import { ListingType, CompatibilityScore, UserQuestionnaire, QuestionnaireCategory } from "../types/index";
import { FilterOptions } from "../components/ListingFilter";
import { calculateCompatibility } from "./compatibilityScoring";
import { getRoadDistanceFromUCSC } from "./roadDistance";


// Define a type that extends ListingType to include the calculated compatibility score
export type ListingWithScore = ListingType & { 
  compatibilityScore?: CompatibilityScore 
};

/**
 * Main filtering function that applies user-specified filters and calculates compatibility scores
 * Processes listings through multiple filter stages: basic filters, distance, compatibility, and priority categories
 * @param listings - Array of all available listings to filter
 * @param filters - User-specified filter options (price, location, compatibility, etc.)
 * @param userQuestionnaire - Optional user questionnaire for compatibility scoring
 * @returns Promise<{filteredListings: ListingWithScore[], listingsWithScores: ListingWithScore[]}> 
 *          - filteredListings: listings that pass all filters
 *          - listingsWithScores: all listings with compatibility scores calculated
 */
export async function filterListings(
  listings: ListingType[],
  filters: FilterOptions,
  userQuestionnaire?: UserQuestionnaire
): Promise<{ 
  filteredListings: ListingWithScore[], 
  listingsWithScores: ListingWithScore[] 
}> {
  // Calculate compatibility scores for all listings if questionnaire is provided
  const listingsWithScores: ListingWithScore[] = [];
  
  // Process listings with compatibility scores
  for (const listing of listings) {
    if (userQuestionnaire) {
      const compatibilityScore = await calculateCompatibility(userQuestionnaire, listing);
      listingsWithScores.push({ ...listing, compatibilityScore });
    } else {
      listingsWithScores.push(listing as ListingWithScore);
    }
  }

  // Apply filters sequentially to narrow down results
  const filteredListings: ListingWithScore[] = [];
  
  for (const listing of listingsWithScores) {
    // Price filters - exclude listings outside user's budget range
    if (filters.minPrice && listing.price < filters.minPrice) continue;
    if (filters.maxPrice && listing.price > filters.maxPrice) continue;
    
    // Room configuration filters
    if (filters.bedrooms && listing.bedrooms < filters.bedrooms) continue;
    if (filters.bathrooms && listing.bathrooms < filters.bathrooms) continue;
    
    // Location filters - on/off campus preference
    if (filters.onCampus !== undefined && listing.onCampus !== filters.onCampus) continue;

    // Distance filter using improved road distance calculation
    if (
      filters.maxDistance &&
      listing.lat !== undefined &&
      listing.lng !== undefined
    ) {
      const distance = await getRoadDistanceFromUCSC(listing.lat, listing.lng);
      if (distance === null || distance > filters.maxDistance) continue;
    }
    
    // Pet policy filters
    if (filters.pets !== undefined && listing.pets !== filters.pets) continue;
    
    // Compatibility score filter - Only filter if minCompatibility is explicitly set
    if (
      filters.minCompatibility && 
      filters.minCompatibility > 0 &&
      listing.compatibilityScore && 
      listing.compatibilityScore.score < filters.minCompatibility
    ) {
      continue;
    }

    // Priority category filtering - match specific lifestyle preferences
    if (filters.priorityCategories && filters.priorityCategories.length > 0 && userQuestionnaire) {
      let shouldInclude = true;
      
      for (const category of filters.priorityCategories) {
        let userResponse: string | string[] | undefined;
        let listingResponse: string | string[] | undefined;

        // Map questionnaire fields to listing tags based on category
        switch (category) {
          case 'sleepSchedule':
            userResponse = userQuestionnaire.sleepSchedule;
            listingResponse = listing.tags?.sleepSchedule;
            break;
          case 'wakeupSchedule':
            userResponse = userQuestionnaire.wakeupSchedule;
            listingResponse = listing.tags?.wakeupSchedule;
            break;
          case 'visitors':
            userResponse = userQuestionnaire.visitors;
            listingResponse = listing.tags?.visitors;
            break;
          case 'studyHabits':
            userResponse = userQuestionnaire.studySpot;
            listingResponse = listing.tags?.studyHabits;
            break;
          case 'cleanliness':
            userResponse = userQuestionnaire.cleanliness;
            listingResponse = listing.tags?.cleanliness;
            break;
          case 'noiseLevel':
            userResponse = userQuestionnaire.noiseLevel;
            listingResponse = listing.tags?.noiseLevel;
            break;
          case 'lifestyle':
            userResponse = userQuestionnaire.lifestyle;
            listingResponse = listing.tags?.lifestyle;
            break;
          case 'pets':
            userResponse = userQuestionnaire.pets;
            // For pets, check the listing.pets boolean, not the tags
            if (listing.pets !== (userResponse === 'Yes')) {
              shouldInclude = false;
              break;
            }
            continue;
        }

        // Skip this category if either user or listing doesn't have data for it
        if (userResponse === undefined || listingResponse === undefined) {
          continue;
        }

        // Handle different data type comparisons (arrays vs strings)
        if (Array.isArray(userResponse) && Array.isArray(listingResponse)) {
          // Both are arrays - check for any overlap
          const overlap = userResponse.some(val => 
            listingResponse.some(listVal => 
              String(val).trim().toLowerCase() === String(listVal).trim().toLowerCase()
            )
          );
          if (!overlap) {
            shouldInclude = false;
            break;
          }
        } else if (typeof userResponse === "string" && typeof listingResponse === "string") {
          // Both are strings - check for exact match
          if (userResponse.trim().toLowerCase() !== listingResponse.trim().toLowerCase()) {
            shouldInclude = false;
            break;
          }
        } else if (Array.isArray(userResponse) && typeof listingResponse === "string") {
          // User has array, listing has string - check if string is in user's array
          const match = userResponse.some(val => 
            String(val).trim().toLowerCase() === listingResponse.trim().toLowerCase()
          );
          if (!match) {
            shouldInclude = false;
            break;
          }
        } else if (typeof userResponse === "string" && Array.isArray(listingResponse)) {
          // User has string, listing has array - check if user's string is in listing's array
          const match = listingResponse.some(val => 
            userResponse.trim().toLowerCase() === String(val).trim().toLowerCase()
          );
          if (!match) {
            shouldInclude = false;
            break;
          }
        }
      }
      
      if (!shouldInclude) continue;
    }
    
    filteredListings.push(listing);
  }
  
  return { 
    filteredListings, 
    listingsWithScores
  };
}

/**
 * Sorts listings by their compatibility score in descending order (highest scores first)
 * @param listings - Array of listings with compatibility scores
 * @returns ListingWithScore[] - Sorted array with highest compatibility scores first
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