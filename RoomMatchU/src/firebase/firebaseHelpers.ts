// src/firebase/firebaseHelpers.ts
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  doc
} from "firebase/firestore";
import { db, auth } from "./config";
import { User } from "firebase/auth";
import { QuestionnaireCategory } from "../types";

// Input from the PostListing form
export interface ListingFormData {
  title: string;
  bio: string;
  neighborhood: string;
  beds: string;
  baths: string;
  availableDate: string;
  price: string;
  onCampus: boolean;
  pets: boolean;
  // Tags for compatibility matching
  sleepSchedule?: string;
  wakeupSchedule?: string;
  cleanliness?: string;
  noiseLevel?: string;
  visitors?: string;
  lifestyle?: string[];
  studyHabits?: string;
  // Tags object for compatibility
  tags?: {
    [key in QuestionnaireCategory]?: string | string[];
  };
}

// Final structure of a listing stored in Firestore
export interface Listing {
  id: string;
  title: string;
  bio: string;
  neighborhood: string;
  beds: number;
  baths: number;
  availableDate: Date;
  price: number;
  posterUID: string;
  createdAt: Timestamp; // Firestore timestamp object
  onCampus: boolean;
  pets: boolean;
  // Tags for compatibility
  tags?: {
    [key in QuestionnaireCategory]?: string | string[];
  };
}

// POST a new listing to Firestore
export const postListing = async (formData: ListingFormData): Promise<string> => {
  // Only authenticated users can post
  const user = auth.currentUser as User | null;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const listingData = {
    title: formData.title,
    bio: formData.bio,
    neighborhood: formData.neighborhood,
    beds: Number(formData.beds),
    baths: Number(formData.baths),
    price: Number(formData.price),
    availableDate: new Date(formData.availableDate),
    posterUID: user.uid,
    createdAt: serverTimestamp(),
    onCampus: formData.onCampus || false,
    pets: formData.pets || false,
    tags: formData.tags || {},
  };

  const docRef = await addDoc(collection(db, "listings"), listingData);
  return docRef.id;
};

// FETCH all listings from Firestore
export const fetchListings = async (): Promise<Listing[]> => {
  try {
    const snapshot = await getDocs(collection(db, "listings"));
    return snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title,
        bio: data.bio,
        neighborhood: data.neighborhood,
        beds: data.beds,
        baths: data.baths,
        availableDate: data.availableDate.toDate?.() ?? new Date(), // ensure Date object
        price: data.price,
        posterUID: data.posterUID,
        createdAt: data.createdAt,
        onCampus: data.onCampus || false,
        pets: data.pets || false,
        tags: data.tags || {},
      } as Listing;
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

// Add a favorite listing
export const addFavorite = async (listingId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  await setDoc(doc(db, `users/${user.uid}/favorites/${listingId}`), { favoritedAt: new Date() });
};

// Fetch all favorite listing IDs
export const fetchFavorites = async (): Promise<string[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const snapshot = await getDocs(collection(db, `users/${user.uid}/favorites`));
  return snapshot.docs.map(doc => doc.id);
};