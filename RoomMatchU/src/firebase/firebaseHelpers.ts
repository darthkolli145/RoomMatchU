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
import { db, auth, storage } from "./config";
import { User } from "firebase/auth";
import { QuestionnaireCategory } from "../types/index";
import { UserQuestionnaire } from "../types/index";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { getDoc } from "firebase/firestore";

export const fetchUserEmail = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().email || null;
    }
  } catch (error) {
    console.error("Error fetching user email:", error);
  }
  return null;
};

// Input from the PostListing form
export interface ListingFormData {
  title: string;
  bio: string;
  neighborhood: string;
  address: string;
  lat?: number;
  lng?: number;
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
  // Images
  images?: File[];
  thumbnailIndex?: number;

  imageURLs?: string[];
  thumbnailURL?: string;
}

// Final structure of a listing stored in Firestore
export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  availableDate: string;
  imageURLs: string[];
  thumbnailURL?: string;
  amenities: string[];
  utilities: string[];
  ownerId: string;
  createdAt: Timestamp;
  favoriteCount: number;
  pets: boolean;
  onCampus: boolean;
  neighborhood: string;
  address: string;
  lat?: number;
  lng?: number;
  tags: {
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

  // We expect frontend to handle image uploading fully now
  const imageURLs: string[] = formData.imageURLs || [];
  const thumbnailURL: string | undefined = formData.thumbnailURL;

  const listingData = {
    title: formData.title,
    bio: formData.bio,
    neighborhood: formData.neighborhood,
    address: formData.address,
    ...(formData.lat !== undefined && { lat: formData.lat }),
    ...(formData.lng !== undefined && { lng: formData.lng }),
    beds: Number(formData.beds),
    baths: Number(formData.baths),
    price: Number(formData.price),
    availableDate: new Date(formData.availableDate),
    posterUID: user.uid,
    createdAt: serverTimestamp(),
    onCampus: formData.onCampus || false,
    pets: formData.pets || false,
    tags: formData.tags || {},
    imageURLs: imageURLs,
    ...(thumbnailURL !== undefined && { thumbnailURL }),
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
        price: data.price,
        location: data.location || '',
        description: data.bio || '',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        availableDate: data.availableDate,
        imageURLs: data.imageURLs || [],
        thumbnailURL: data.thumbnailURL,
        amenities: data.amenities || [],
        utilities: data.utilities || [],
        ownerId: data.posterUID,
        createdAt: data.createdAt,
        favoriteCount: data.favoriteCount || 0,
        pets: data.pets,
        onCampus: data.onCampus,
        neighborhood: data.neighborhood,
        address: data.address,
        lat: data.lat,
        long: data.lng,
        tags: data.tags || {},
        compatibilityScores: data.compatibilityScores || {}
      };
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

export const postQuestionnaire = async (questionnaireData: UserQuestionnaire): Promise<string> => {
  const user = auth.currentUser as User | null;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const docRef = await addDoc(collection(db, "questionnaireResponses"), {
    ...questionnaireData,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const deleteListing = async (listingId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  // Fetch the listing document first to verify ownership (optional but recommended)
  const listingRef = doc(db, "listings", listingId);

  try {
    const listingSnap = await getDoc(listingRef);  // Use `getDoc` instead of `get()`

    if (!listingSnap.exists()) {
      throw new Error("Listing does not exist");
    }

    const listingData = listingSnap.data();
    if (listingData?.posterUID !== user.uid) {
      throw new Error("User not authorized to delete this listing");
    }

    // Proceed to delete
    await deleteDoc(listingRef);
    console.log(`Listing ${listingId} deleted successfully.`);
  } catch (error) {
    console.error("Error in deleteListing function:", error);
    throw error; // Re-throw to allow calling function to handle the error
  }
};


export const addFavorite = async (listingId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const favRef = doc(db, `users/${user.uid}/favorites/${listingId}`);
  await setDoc(favRef, { favoritedAt: new Date() });
};

export const fetchFavorites = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const favCollection = collection(db, `users/${user.uid}/favorites`);
  const snapshot = await getDocs(favCollection);

  return snapshot.docs.map(doc => doc.id); // listing IDs
};

// Remove a favorite listing
export const removeFavorite = async (listingId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  await deleteDoc(doc(db, `users/${user.uid}/favorites/${listingId}`));
};
