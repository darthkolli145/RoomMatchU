import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./config";

// POST a new listing to Firestore
export const postListing = async (formData) => {
  // only signed in users can post listing
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    // Copy form data
    const listingData = {
      ...formData,
      posterUID: user.uid, // add userID of poster
      createdAt: serverTimestamp() // timestamp of creation
    };

    // add listingData to 'listings' collection in FS
    const docRef = await addDoc(collection(db, "listings"), listingData);
    return docRef.id;
  } catch (error) {
    console.error("Error posting listing:", error);
    throw error;
  }
};

// FETCH all listings
export const fetchListings = async () => {
  try {
    const snapshot = await getDocs(collection(db, "listings"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};