import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./config";

// post listing
// post listings to a new collection in cloud firestore

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