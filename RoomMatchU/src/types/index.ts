export type User = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  questionnaire?: UserQuestionnaire;
};

export type UserQuestionnaire = {
  lifestyle: string[];
  cleanliness: string;
  noiseLevel: string;
  sleepSchedule: string;
  visitors: string;
  sharing: string[];
};

export type ListingType = {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  availableDate: string;
  imageURLs: string[];
  amenities: string[];
  utilities: string[];
  ownerId: string;
  createdAt: any;
  favoriteCount: number;
  pets: boolean;
  onCampus: boolean;
  neighborhood: string;
}; 