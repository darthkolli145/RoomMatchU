export type User = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  questionnaire?: UserQuestionnaire;
};

export type PriorityLevel = 'Not Important' | 'Somewhat Important' | 'Very Important' | 'Deal Breaker';

export type QuestionnaireCategory = 
  | 'sleepSchedule'
  | 'wakeupSchedule'
  | 'cleanliness'
  | 'noiseLevel'
  | 'visitors'
  | 'pets'
  | 'studyHabits'
  | 'lifestyle'
  | 'prefGender';

export type UserQuestionnaire = {
  fullname: string[];
  lifestyle: string[];
  cleanliness: string;
  noiseLevel: string;
  sleepSchedule: string;
  yearlvl: string;
  visitors: string;
  Gender: string;
  sharing: string[],
  Hobbies: string[];
  email?: string[];
  Major: string[];
  wakeupSchedule: string;
  roommateCleanliness: string;
  okvisitors: string;
  overnightGuests: string;
  studySpot: string;
  pets: string;
  okPets: string;
  prefGender: string;
  dealMust: string[];
  maxDistanceFromCampus?: number;
  priorities: {
    [key in QuestionnaireCategory]?: PriorityLevel;
  };
};

export interface CompatibilityScore {
  score: number;
  matches: string[];
  conflicts: string[];
}

export type ListingType = {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  availableDate: Date;
  imageURLs: string[];
  thumbnailURL?: string;
  amenities: string[];
  utilities: string[];
  ownerId: string;
  createdAt: any;
  favoriteCount: number;
  pets: boolean;
  onCampus: boolean;
  address: string;
  shortAddress?: string;
  lat?: number;
  lng?: number;
  tags: {
    [key in QuestionnaireCategory]?: string | string[];
  };
  compatibilityScores?: {
    [userId: string]: CompatibilityScore;
  };
}; 