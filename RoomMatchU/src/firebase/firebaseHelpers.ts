// src/firebase/firebaseHelpers.ts
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";
import { auth } from "./config";
import { User } from "firebase/auth";

// Input from the PostListing form
export interface ListingFormData {
  title: string;
  bio: string;
  neighborhood: string;
  beds: string;
  baths: string;
  availableDate: string;
  price: string;
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
}

// POST a new listing to Firestore
export const postListing = async (formData: ListingFormData): Promise<string> => {
  // Only authenticated users can post
  const user = auth.currentUser as User | null;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const listingData = {
    ...formData,
    beds: Number(formData.beds),
    baths: Number(formData.baths),
    price: Number(formData.price),
    availableDate: new Date(formData.availableDate),
    posterUID: user.uid,
    createdAt: serverTimestamp(),
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
      } as Listing;
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};
