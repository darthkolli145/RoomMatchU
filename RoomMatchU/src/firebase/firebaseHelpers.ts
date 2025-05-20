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
import { QuestionnaireCategory } from "../types";
import { UserQuestionnaire } from "../types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

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
  // Images
  images?: File[];
  thumbnailIndex?: number;
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
  // Images
  imageURLs?: string[];
  thumbnailURL?: string;
}

// Compress an image before uploading
export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1, // Maximum size in MB
    maxWidthOrHeight: 1200, // Maximum width or height in pixels
    useWebWorker: true,
    initialQuality: 0.7, // Initial quality setting for JPEG/WEBP/etc
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Original file size: ${file.size / 1024 / 1024} MB`);
    console.log(`Compressed file size: ${compressedFile.size / 1024 / 1024} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
};

// Upload a single image to Firebase Storage
export const uploadImage = async (image: File, path: string): Promise<string> => {
  try {
    // Compress the image
    const compressedImage = await compressImage(image);
    
    // Create a reference to the file location
    const storageRef = ref(storage, path);
    
    // Upload the file
    await uploadBytes(storageRef, compressedImage);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// POST a new listing to Firestore
export const postListing = async (formData: ListingFormData): Promise<string> => {
  // Only authenticated users can post
  const user = auth.currentUser as User | null;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Upload images if any
  let imageURLs: string[] = [];
  let thumbnailURL: string | undefined;
  
  if (formData.images && formData.images.length > 0) {
    const uploadPromises = formData.images.map((image, index) => {
      const path = `listings/${user.uid}/${Date.now()}_${index}_${image.name}`;
      return uploadImage(image, path);
    });
    
    imageURLs = await Promise.all(uploadPromises);
    
    // Set the thumbnail URL
    if (typeof formData.thumbnailIndex === 'number' && imageURLs[formData.thumbnailIndex]) {
      thumbnailURL = imageURLs[formData.thumbnailIndex];
    } else if (imageURLs.length > 0) {
      // Default to first image if no thumbnail specified
      thumbnailURL = imageURLs[0];
    }
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
    imageURLs: imageURLs,
    thumbnailURL: thumbnailURL,
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
        imageURLs: data.imageURLs || [],
        thumbnailURL: data.thumbnailURL,
      } as Listing;
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
