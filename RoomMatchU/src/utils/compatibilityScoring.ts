import { UserQuestionnaire, ListingType, CompatibilityScore, QuestionnaireCategory, PriorityLevel } from "../types";

// Priority level weights for calculations
const PRIORITY_WEIGHTS = {
  'Not Important': 1,
  'Somewhat Important': 2,
  'Very Important': 3,
  'Deal Breaker': 4
};

// Default weight if no priority is set
const DEFAULT_PRIORITY_WEIGHT = 1;

// Calculate compatibility between a user's questionnaire and a listing
export function calculateCompatibility(
  userQuestionnaire: UserQuestionnaire,
  listing: ListingType
): CompatibilityScore {
  const categoryScores: { [key in QuestionnaireCategory]?: number } = {};
  const matchDetails: string[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Helper to get weight for a category
  const getCategoryWeight = (category: QuestionnaireCategory): number => {
    const priority = userQuestionnaire.priorities[category];
    return priority ? PRIORITY_WEIGHTS[priority] : DEFAULT_PRIORITY_WEIGHT;
  };

  // Sleep Schedule
  if (userQuestionnaire.sleepSchedule && listing.tags?.sleepSchedule) {
    const weight = getCategoryWeight('sleepSchedule');
    const score = calculateCategoryMatch(
      userQuestionnaire.sleepSchedule, 
      listing.tags.sleepSchedule as string
    );
    
    categoryScores.sleepSchedule = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible sleep schedules');
    }
  }

  // Wake-up Schedule
  if (userQuestionnaire.wakeupSchedule && listing.tags?.wakeupSchedule) {
    const weight = getCategoryWeight('wakeupSchedule');
    const score = calculateCategoryMatch(
      userQuestionnaire.wakeupSchedule, 
      listing.tags.wakeupSchedule as string
    );
    
    categoryScores.wakeupSchedule = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible wake-up times');
    }
  }

  // Cleanliness
  if (userQuestionnaire.cleanliness && listing.tags?.cleanliness) {
    const weight = getCategoryWeight('cleanliness');
    const score = calculateCategoryMatch(
      userQuestionnaire.cleanliness, 
      listing.tags.cleanliness as string
    );
    
    categoryScores.cleanliness = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible cleanliness preferences');
    }
  }

  // Noise Level
  if (userQuestionnaire.noiseLevel && listing.tags?.noiseLevel) {
    const weight = getCategoryWeight('noiseLevel');
    const score = calculateCategoryMatch(
      userQuestionnaire.noiseLevel, 
      listing.tags.noiseLevel as string
    );
    
    categoryScores.noiseLevel = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible noise level preferences');
    }
  }

  // Visitors
  if (userQuestionnaire.visitors && listing.tags?.visitors) {
    const weight = getCategoryWeight('visitors');
    const score = calculateCategoryMatch(
      userQuestionnaire.visitors, 
      listing.tags.visitors as string
    );
    
    categoryScores.visitors = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible visitor preferences');
    }
  }

  // Pets
  if (userQuestionnaire.pets && listing.tags?.pets) {
    const weight = getCategoryWeight('pets');
    const score = calculatePetsMatch(
      userQuestionnaire.pets, 
      userQuestionnaire.okPets,
      listing.pets
    );
    
    categoryScores.pets = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible pet preferences');
    }
  }

  // Lifestyle
  if (userQuestionnaire.lifestyle.length > 0 && listing.tags?.lifestyle) {
    const weight = getCategoryWeight('lifestyle');
    const listingLifestyles = Array.isArray(listing.tags.lifestyle)
      ? listing.tags.lifestyle
      : [listing.tags.lifestyle];
      
    const score = calculateLifestyleMatch(
      userQuestionnaire.lifestyle,
      listingLifestyles
    );
    
    categoryScores.lifestyle = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible lifestyle habits');
    }
  }

  // Study Habits
  if (userQuestionnaire.studySpot && listing.tags?.studyHabits) {
    const weight = getCategoryWeight('studyHabits');
    const score = calculateCategoryMatch(
      userQuestionnaire.studySpot, 
      listing.tags.studyHabits as string
    );
    
    categoryScores.studyHabits = score;
    totalScore += score * weight;
    totalWeight += weight;
    
    if (score > 70) {
      matchDetails.push('Compatible study habits');
    }
  }
  
  // Calculate overall score
  const overall = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  
  // Ensure the overall score is between 0-100
  const normalizedOverall = Math.max(0, Math.min(100, overall));
  
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
      matchDetails.push(`Deal breaker: ${category} is not compatible`);
    }
  }

  return {
    overall: finalScore,
    categoryScores,
    matchDetails
  };
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