import { UserQuestionnaire, ListingType, CompatibilityScore, QuestionnaireCategory, PriorityLevel } from "../types/index";
import { calculateDistanceFromUCSC } from "./distanceCalculator";
import { getRoadDistanceFromUCSC } from "./roadDistance";

// Priority level weights for calculations
const PRIORITY_WEIGHTS = {
  'Not Important': 1,
  'Somewhat Important': 2,
  'Very Important': 3,
  'Deal Breaker': 4
};

// Default weight if no priority is set
const DEFAULT_PRIORITY_WEIGHT = 1;

// Weight for distance in the overall score (treated as "Very Important" by default)
const DISTANCE_WEIGHT = 3;

// Default score for missing data (penalizes incomplete questionnaires)
const MISSING_DATA_SCORE = 50; // Neutral score when data is missing

// All possible categories that should be considered
const ALL_CATEGORIES: QuestionnaireCategory[] = [
  'sleepSchedule',
  'wakeupSchedule', 
  'cleanliness',
  'noiseLevel',
  'visitors',
  'pets',
  'lifestyle',
  'studyHabits'
];

// Calculate compatibility between a user's questionnaire and a listing
export async function calculateCompatibility(
  userQuestionnaire: UserQuestionnaire,
  listing: ListingType
): Promise<CompatibilityScore> {
  const categoryScores: { [key in QuestionnaireCategory | 'distance']?: number } = {};
  const matches: string[] = [];
  const conflicts: string[] = [];
  const missingData: string[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Helper to get weight for a category
  const getCategoryWeight = (category: QuestionnaireCategory): number => {
    const priority = userQuestionnaire.priorities[category];
    return priority ? PRIORITY_WEIGHTS[priority] : DEFAULT_PRIORITY_WEIGHT;
  };

  // Process all categories, not just the ones with data
  for (const category of ALL_CATEGORIES) {
    const weight = getCategoryWeight(category);
    let score: number;
    let hasUserData = false;
    let hasListingData = false;

    switch (category) {
      case 'sleepSchedule':
        hasUserData = !!userQuestionnaire.sleepSchedule;
        hasListingData = !!listing.tags?.sleepSchedule;
        if (hasUserData && hasListingData) {
          score = calculateCategoryMatch(
            userQuestionnaire.sleepSchedule, 
            listing.tags.sleepSchedule as string
          );
          if (score > 70) {
            matches.push('Compatible sleep schedules');
          } else if (score < 40) {
            conflicts.push('Different sleep schedules');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your sleep schedule preference');
          if (!hasListingData) missingData.push('Listing sleep schedule info');
        }
        break;

      case 'wakeupSchedule':
        hasUserData = !!userQuestionnaire.wakeupSchedule;
        hasListingData = !!listing.tags?.wakeupSchedule;
        if (hasUserData && hasListingData) {
          score = calculateCategoryMatch(
            userQuestionnaire.wakeupSchedule, 
            listing.tags.wakeupSchedule as string
          );
          if (score > 70) {
            matches.push('Compatible wake-up times');
          } else if (score < 40) {
            conflicts.push('Different wake-up times');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your wake-up time preference');
          if (!hasListingData) missingData.push('Listing wake-up time info');
        }
        break;

      case 'cleanliness':
        hasUserData = !!userQuestionnaire.cleanliness;
        hasListingData = !!listing.tags?.cleanliness;
        if (hasUserData && hasListingData) {
          score = calculateCategoryMatch(
            userQuestionnaire.cleanliness, 
            listing.tags.cleanliness as string
          );
          if (score > 70) {
            matches.push('Compatible cleanliness preferences');
          } else if (score < 40) {
            conflicts.push('Different cleanliness preferences');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your cleanliness preference');
          if (!hasListingData) missingData.push('Listing cleanliness info');
        }
        break;

      case 'noiseLevel':
        hasUserData = !!userQuestionnaire.noiseLevel;
        hasListingData = !!listing.tags?.noiseLevel;
        if (hasUserData && hasListingData) {
          score = calculateCategoryMatch(
            userQuestionnaire.noiseLevel, 
            listing.tags.noiseLevel as string
          );
          if (score > 70) {
            matches.push('Compatible noise level preferences');
          } else if (score < 40) {
            conflicts.push('Different noise level preferences');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your noise level preference');
          if (!hasListingData) missingData.push('Listing noise level info');
        }
        break;

      case 'visitors':
        hasUserData = !!userQuestionnaire.visitors;
        hasListingData = !!listing.tags?.visitors;
        if (hasUserData && hasListingData) {
          score = calculateCategoryMatch(
            userQuestionnaire.visitors, 
            listing.tags.visitors as string
          );
          if (score > 70) {
            matches.push('Compatible visitor preferences');
          } else if (score < 40) {
            conflicts.push('Different visitor preferences');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your visitor preference');
          if (!hasListingData) missingData.push('Listing visitor info');
        }
        break;

      case 'pets':
        hasUserData = !!userQuestionnaire.pets;
        hasListingData = listing.pets !== undefined;
        if (hasUserData && hasListingData) {
          score = calculatePetsMatch(
            userQuestionnaire.pets, 
            userQuestionnaire.okPets,
            listing.pets
          );
          if (score > 70) {
            matches.push('Compatible pet preferences');
          } else if (score < 40) {
            conflicts.push('Different pet preferences');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your pet preference');
          if (!hasListingData) missingData.push('Listing pet policy');
        }
        break;

      case 'lifestyle':
        hasUserData = userQuestionnaire.lifestyle && userQuestionnaire.lifestyle.length > 0;
        hasListingData = !!listing.tags?.lifestyle;
        if (hasUserData && hasListingData) {
          const rawLifestyles = Array.isArray(listing.tags.lifestyle)
            ? listing.tags.lifestyle
            : [listing.tags.lifestyle];
          // Filter out any undefined values
          const listingLifestyles = rawLifestyles.filter((item): item is string => item !== undefined);
          score = calculateLifestyleMatch(
            userQuestionnaire.lifestyle || [],
            listingLifestyles
          );
          if (score > 70) {
            matches.push('Compatible lifestyle habits');
          } else if (score < 40) {
            conflicts.push('Different lifestyle habits');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your lifestyle preferences');
          if (!hasListingData) missingData.push('Listing lifestyle info');
        }
        break;

      case 'studyHabits':
        hasUserData = !!userQuestionnaire.studySpot;
        hasListingData = !!listing.tags?.studyHabits;
        if (hasUserData && hasListingData) {
          score = calculateCategoryMatch(
            userQuestionnaire.studySpot, 
            listing.tags.studyHabits as string
          );
          if (score > 70) {
            matches.push('Compatible study habits');
          } else if (score < 40) {
            conflicts.push('Different study habits');
          }
        } else {
          score = MISSING_DATA_SCORE;
          if (!hasUserData) missingData.push('Your study habit preference');
          if (!hasListingData) missingData.push('Listing study habit info');
        }
        break;

      default:
        score = MISSING_DATA_SCORE;
    }

    categoryScores[category] = score;
    totalScore += score * weight;
    totalWeight += weight;
  }
  
  // Distance from Campus
  if (userQuestionnaire.maxDistanceFromCampus && listing.lat !== undefined && listing.lng !== undefined) {
    const actualDistance = await getRoadDistanceFromUCSC(listing.lat, listing.lng);  
    
    if (actualDistance !== null) {
      const maxDistance = userQuestionnaire.maxDistanceFromCampus;
      let distanceScore: number;
      
      if (actualDistance <= maxDistance) {
        // Within preferred distance - score based on how close it is
        distanceScore = 100 - (actualDistance / maxDistance) * 20; // 80-100 score
      } else {
        // Beyond preferred distance - score decreases rapidly
        const distanceRatio = actualDistance / maxDistance;
        if (distanceRatio <= 1.5) {
          distanceScore = 80 - (distanceRatio - 1) * 60; // 50-80 score
        } else if (distanceRatio <= 2) {
          distanceScore = 50 - (distanceRatio - 1.5) * 40; // 30-50 score
        } else {
          distanceScore = Math.max(0, 30 - (distanceRatio - 2) * 10); // 0-30 score
        }
      }
      
      categoryScores.distance = distanceScore;
      totalScore += distanceScore * DISTANCE_WEIGHT;
      totalWeight += DISTANCE_WEIGHT;
      
      if (distanceScore > 80) {
        matches.push(`Within preferred distance (${actualDistance.toFixed(1)} miles from campus)`);
      } else if (distanceScore < 50) {
        conflicts.push(`Beyond preferred distance (${actualDistance.toFixed(1)} miles, wanted ${maxDistance} miles max)`);
      }
    }
  } else if (listing.lat !== undefined && listing.lng !== undefined) {
    // Even without a distance preference, give a small bonus for on-campus or very close properties
    const actualDistance = await getRoadDistanceFromUCSC(listing.lat, listing.lng);
    
    if (actualDistance !== null && actualDistance < 1) {
      // Small bonus for being very close to campus - treat as a lightly weighted category
      const bonusScore = actualDistance < 0.1 ? 100 : (1 - actualDistance) * 80; // 20-100 score based on proximity
      const bonusWeight = 0.5; // Light weight for bonus
      totalScore += bonusScore * bonusWeight;
      totalWeight += bonusWeight;
      
      if (actualDistance < 0.1) {
        matches.push('On campus');
      } else {
        matches.push(`Very close to campus (${actualDistance.toFixed(1)} miles)`);
      }
    }
  }
  
  // Calculate overall score
  // totalScore is sum of (score * weight) where score is 0-100
  // totalWeight is sum of weights
  // So average is totalScore / totalWeight (already in percentage form)
  const overall = totalWeight > 0 ? (totalScore / totalWeight) : 0;
  
  // Ensure the overall score is between 0-100
  const normalizedOverall = Math.max(0, Math.min(100, overall));
  
  // Debug for edge cases
  if (totalWeight === 0) {
    console.warn('Warning: No categories were compared - totalWeight is 0');
    conflicts.push('Unable to calculate compatibility - no matching data');
  }
  
  // Additional adjustment for important dealbreakers
  // If a deal breaker category scores below 30, cap the overall score
  const dealBreakerCategories = Object.entries(userQuestionnaire.priorities)
    .filter(([_, priority]) => priority === 'Deal Breaker')
    .map(([category]) => category as QuestionnaireCategory);

  let finalScore = normalizedOverall;
  for (const category of dealBreakerCategories) {
    const score = categoryScores[category];
    if (score !== undefined && score < 30) {
      // Cap the score at a lower value for deal breaker violations
      finalScore = Math.min(finalScore, 40);
      conflicts.push(`Deal breaker: ${category} is not compatible`);
    }
  }

  // Add information about missing data if significant
  if (missingData.length > 0) {
    conflicts.push(`Incomplete data for: ${missingData.length} categories`);
  }

  const result = {
    score: Math.round(finalScore),
    matches,
    conflicts
  };
  
  return result;
}

// Helper functions

// Calculate match score for simple category matches (exact match = 100, partial match based on options)
function calculateCategoryMatch(userValue: string, listingValue: string): number {
  if (!userValue || !listingValue) return 0;
  
  // Exact match
  if (userValue === listingValue) return 100;
  
  // For sleep schedule compatibility
  if (userValue.includes('Before') && listingValue.includes('Before')) return 80;
  if (userValue.includes('After') && listingValue.includes('After')) return 80;
  
  // Opposite sleep schedules are highly incompatible
  if (userValue.includes('Before') && listingValue.includes('After')) return 20;
  if (userValue.includes('After') && listingValue.includes('Before')) return 20;
  
  // Middle ground sleep schedule with early/late
  if (userValue === '10pm - 12am' && listingValue.includes('Before')) return 60;
  if (userValue === '10pm - 12am' && listingValue.includes('After')) return 60;
  if (userValue.includes('Before') && listingValue === '10pm - 12am') return 60;
  if (userValue.includes('After') && listingValue === '10pm - 12am') return 60;
  
  // For cleanliness compatibility
  if (userValue === 'Very tidy' && listingValue === 'Moderately tidy') return 70;
  if (userValue === 'Moderately tidy' && listingValue === 'Very tidy') return 80;
  if (userValue === 'Moderately tidy' && listingValue === 'Messy') return 30;
  if (userValue === 'Very tidy' && listingValue === 'Messy') return 10; // Very tidy with messy is a bad match
  if (userValue === 'Messy' && listingValue === 'Very tidy') return 40; // Messy person might be ok with tidy place
  
  // For noise level compatibility
  if (userValue === 'Silent' && listingValue === 'Background noise/music') return 40;
  if (userValue === 'Background noise/music' && listingValue === 'Silent') return 70;
  if (userValue === 'Silent' && listingValue === 'Loud music/TV') return 10;
  if (userValue === 'Background noise/music' && listingValue === 'Loud music/TV') return 50;
  if (userValue === 'Loud music/TV' && listingValue === 'Silent') return 20;
  
  // For visitor frequency
  if (userValue === 'Rarely' && listingValue === 'Occasionally') return 70;
  if (userValue === 'Occasionally' && listingValue === 'Rarely') return 80;
  if (userValue === 'Rarely' && listingValue === 'Frequently') return 30;
  if (userValue === 'Occasionally' && listingValue === 'Frequently') return 60;
  if (userValue === 'Frequently' && listingValue === 'Rarely') return 40;
  
  // Study habits
  if (userValue === 'Home' && listingValue === 'Library') return 80; // Different places can be good
  if (userValue === 'Library' && listingValue === 'Home') return 80;
  if (userValue === 'Other' && (listingValue === 'Home' || listingValue === 'Library')) return 70;
  
  // Partial match for no preference
  if (userValue === 'No preference') return 70;
  if (listingValue === 'No preference') return 70;
  
  // Default partial match for everything else
  return 30;
}

// Calculate pet compatibility
function calculatePetsMatch(userHasPets: string, userOkWithPets: string, listingAllowsPets: boolean): number {
  // User has pets but listing doesn't allow them - deal breaker
  if (userHasPets === 'Yes' && !listingAllowsPets) return 0;
  
  // User doesn't want pets but listing has pets - significant mismatch
  if (userOkWithPets === 'No' && listingAllowsPets) return 20;
  
  // User has pets and listing allows them - perfect match
  if (userHasPets === 'Yes' && listingAllowsPets) return 100;
  
  // User doesn't have pets
  if (userHasPets === 'No') {
    if (userOkWithPets === 'Yes') {
      // User is fine with pets
      return 90; // High match regardless of listing
    }
    if (userOkWithPets === 'Other(allergies, certain animals, etc.)') {
      // User has conditions about pets
      return listingAllowsPets ? 60 : 90;
    }
    // User doesn't want pets
    return listingAllowsPets ? 30 : 100;
  }
  
  return 50;
}

// Calculate lifestyle compatibility
function calculateLifestyleMatch(userLifestyle: string[], listingLifestyle: string[]): number {
  if (!userLifestyle.length || !listingLifestyle.length) return 0;
  
  const matches = userLifestyle.filter(item => listingLifestyle.includes(item)).length;
  const totalItems = new Set([...userLifestyle, ...listingLifestyle]).size;
  
  return (matches / totalItems) * 100;
}

// Extract tags from a user questionnaire (useful when creating listings)
export function extractTagsFromQuestionnaire(questionnaire: UserQuestionnaire): ListingType['tags'] {
  return {
    sleepSchedule: questionnaire.sleepSchedule,
    wakeupSchedule: questionnaire.wakeupSchedule,
    cleanliness: questionnaire.cleanliness,
    noiseLevel: questionnaire.noiseLevel,
    visitors: questionnaire.visitors,
    pets: questionnaire.pets,
    studyHabits: questionnaire.studySpot,
    lifestyle: questionnaire.lifestyle
  };
} 