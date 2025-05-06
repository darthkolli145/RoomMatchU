export type User = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  questionnaire?: UserQuestionnaire;
};

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
  email: string[];
  Major: string[];
  wakeupSchedule: string;
  roommateCleanliness: string;
  okvisitors: string;
  overnightGuests: string;
  studySpot: string;
  pets: string;
  okPets: string;
  prefGender: string;
  dealMust: string[]
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