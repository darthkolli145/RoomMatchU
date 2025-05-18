import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { sampleListings } from "./sampleListings";

/**
 * Function to populate Firebase with sample listings
 * @returns Promise with the IDs of the added listings
 */
export const populateWithSampleListings = async (): Promise<string[]> => {
  try {
    console.log('Starting to add sample listings to Firebase...');
    
    const addedIds: string[] = [];
    const listingsCollection = collection(db, "listings");
    
    // Process listings one by one with a bit of delay to avoid rate limiting
    for (const listing of sampleListings) {
      // Prepare the listing data for Firebase
      // We exclude the ID as Firebase will generate one
      // We also convert the createdAt function to a server timestamp
      const { id, createdAt, ...listingData } = listing;
      
      // Add server timestamp
      const firestoreListing = {
        ...listingData,
        createdAt: serverTimestamp(),
      };
      
      // Add to Firebase
      const docRef = await addDoc(listingsCollection, firestoreListing);
      addedIds.push(docRef.id);
      
      console.log(`Added listing: ${listing.title} with ID: ${docRef.id}`);
      
      // Small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`Successfully added ${addedIds.length} sample listings to Firebase.`);
    return addedIds;
    
  } catch (error) {
    console.error('Error adding sample listings to Firebase:', error);
    throw error;
  }
};

/**
 * Function to populate Firebase with a single sample listing
 * Useful for testing specific listing types
 * @param index The index of the sample listing to add (0-9)
 * @returns Promise with the ID of the added listing
 */
export const addSingleSampleListing = async (index: number): Promise<string> => {
  try {
    if (index < 0 || index >= sampleListings.length) {
      throw new Error(`Invalid index: ${index}. Must be between 0 and ${sampleListings.length - 1}`);
    }
    
    const listing = sampleListings[index];
    const { id, createdAt, ...listingData } = listing;
    
    const firestoreListing = {
      ...listingData,
      createdAt: serverTimestamp(),
    };
    
    const listingsCollection = collection(db, "listings");
    const docRef = await addDoc(listingsCollection, firestoreListing);
    
    console.log(`Added single sample listing: ${listing.title} with ID: ${docRef.id}`);
    return docRef.id;
    
  } catch (error) {
    console.error('Error adding single sample listing to Firebase:', error);
    throw error;
  }
}; 