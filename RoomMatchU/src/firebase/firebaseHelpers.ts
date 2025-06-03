// src/firebase/firebaseHelpers.ts
import {
  collection,
  query,
  where,
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
import axios from "axios";

interface GeocodingResult {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

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

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  // Read API key from process.env
  const KEY = import.meta.env.VITE_GEOCODING_API_KEY;
  if (!KEY) {
    throw new Error("Missing REACT_APP_GEOCODING_API_KEY in environment");
  }

  console.log("Using Geocoding API key:", import.meta.env.VITE_GEOCODING_API_KEY);
  if (!address || address.trim().length === 0) {
    throw new Error("Cannot geocode an empty address.");
  }

  // Build the request URL
  const params = new URLSearchParams({
    address: address,
    key: KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;

  // Call Google's API
  let resp;
  try {
    resp = await axios.get<GeocodingResult>(url);
  } catch (err) {
    console.error("Error fetching geocoding data:", err);
    throw new Error("Network or Axios error while geocoding address.");
  }

  const data = resp.data;
  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    throw new Error(`Geocoding failed for "${address}", status: ${data.status}`);
  }

  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
}

// Input from the PostListing form
export interface ListingFormData {
  title: string;
  bio: string;
  address: string;
  lat?: number;
  lng?: number;
  beds: string;
  baths: string;
  availableDate: Date;
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
  prefGender?: string;
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
  availableDate: Date;
  imageURLs: string[];
  thumbnailURL?: string;
  amenities: string[];
  utilities: string[];
  ownerId: string;
  createdAt: Timestamp;
  favoriteCount: number;
  pets: boolean;
  onCampus: boolean;
  address: string;
  prefGender?: string;
  lat?: number;
  lng?: number;
  tags: {
    [key in QuestionnaireCategory]?: string | string[];
  };
}

export const postListing = async (formData: ListingFormData): Promise<string> => {
  // Only authenticated users can post
  const user = auth.currentUser as User | null;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // If lat/lng were already provided in formData, skip geocoding.
  //     Otherwise, call geocodeAddress(...) to look them up.
  let coords: { lat: number; lng: number } | undefined;
  if (typeof formData.lat === "number" && typeof formData.lng === "number") {
    coords = { lat: formData.lat, lng: formData.lng };
  } else {
    console.log("Debug: about to geocode with address =", JSON.stringify(formData.address));
    try {
      coords = await geocodeAddress(formData.address);
    } catch (err) {
      console.error("Geocoding error:", err);
      // Continue without coordinates rather than failing completely
      coords = { lat: 0, lng: 0 };
    }
  }

  // Build the object that we will actually store in Firestore
  const listingData: any = {
    title: formData.title,
    bio: formData.bio,
    address: formData.address,
    beds: Number(formData.beds),
    baths: Number(formData.baths),
    price: Number(formData.price),
    availableDate:
      formData.availableDate instanceof Timestamp
        ? formData.availableDate.toDate()
        : new Date(formData.availableDate),
    posterUID: user.uid,
    createdAt: serverTimestamp(),
    onCampus: formData.onCampus || false,
    pets: formData.pets || false,
    tags: formData.tags || {},
    imageURLs: formData.imageURLs || [],
    ...(formData.thumbnailURL !== undefined && { thumbnailURL: formData.thumbnailURL }),
    // Insert geocoded coordinates here:
    lat: coords.lat,
    lng: coords.lng,
  };

  // Actually write the document
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
        bedrooms: data.beds || 0,
        bathrooms: data.baths || 0,
        availableDate: data.availableDate?.toDate
        ? data.availableDate.toDate()
        : new Date(data.availableDate),
              imageURLs: data.imageURLs || [],
        thumbnailURL: data.thumbnailURL,
        amenities: data.amenities || [],
        utilities: data.utilities || [],
        ownerId: data.posterUID,
        createdAt: data.createdAt,
        favoriteCount: data.favoriteCount || 0,
        pets: data.pets,
        onCampus: data.onCampus,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
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

  // First, save the questionnaire in the questionnaireResponses collection
  const docRef = doc(db, "questionnaireResponses", user.uid);

  await setDoc(docRef, {
    ...questionnaireData,
    userId: user.uid,
    createdAt: serverTimestamp()
  });

  // Then, update the user's profile to include the questionnaire data
  const userDocRef = doc(db, "users", user.uid);
  
  try {
    await setDoc(userDocRef, {
      questionnaire: questionnaireData
    }, { merge: true });
    
    console.log("User profile updated with questionnaire data");
  } catch (error) {
    console.error("Error updating user profile with questionnaire:", error);
    // We don't throw here to not block the main questionnaire save
  }

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

// export const fetchQuestionnaireByUserId = async (userId: string): Promise<UserQuestionnaire | null> => {
//   try {
//     const q = query(
//       collection(db, "questionnaireResponses"),
//       where("userId", "==", userId)
//     );

//     const snapshot = await getDocs(q);

//     if (!snapshot.empty) {
//       const docData = snapshot.docs[0].data();
//       return docData as UserQuestionnaire;
//     }

//     return null;
//   } catch (error) {
//     console.error("Error fetching questionnaire:", error);
//     return null;
//   }
// };

export const fetchQuestionnaireByUserId = async (userId: string): Promise<UserQuestionnaire | null> => {
  try {
    const docSnap = await getDoc(doc(db, "questionnaireResponses", userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserQuestionnaire;
    }
    return null;
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    return null;
  }
};

// Upload image to Firebase Storage
export const uploadImageToFirebase = async (file: File): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `listings/${user.uid}/${timestamp}_${file.name}`;
    
    // Create a storage reference
    const storageRef = ref(storage, filename);
    
    // Upload the file
    console.log(`Uploading ${file.name} to Firebase Storage...`);
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Successfully uploaded to Firebase:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw error;
  }
};