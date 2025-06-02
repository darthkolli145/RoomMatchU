import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './config';

// Collection path to match the one used in firebaseHelpers.ts
const getUserFavoritesPath = (userId: string) => `users/${userId}/favorites`;

/**
 * Add a listing to a user's favorites
 * @param userId User ID
 * @param listingId Listing ID
 */
export const addFavorite = async (userId: string, listingId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, getUserFavoritesPath(userId), listingId);
    await setDoc(favoriteRef, {
      createdAt: serverTimestamp()
    });
    console.log(`Added listing ${listingId} to favorites for user ${userId}`);
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

/**
 * Remove a listing from a user's favorites
 * @param userId User ID
 * @param listingId Listing ID
 */
export const removeFavorite = async (userId: string, listingId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, getUserFavoritesPath(userId), listingId);
    await deleteDoc(favoriteRef);
    console.log(`Removed listing ${listingId} from favorites for user ${userId}`);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

/**
 * Get all favorite listing IDs for a user
 * @param userId User ID
 * @returns Array of listing IDs
 */
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    // Create a query for the user's favorites subcollection
    const favoritesRef = collection(db, getUserFavoritesPath(userId));
    const querySnapshot = await getDocs(favoritesRef);
    
    const favoriteIds: string[] = [];
    
    // Get all favorite IDs and verify they exist in the listings collection
    for (const docSnap of querySnapshot.docs) {
      // The document ID is the listing ID
      const listingId = docSnap.id;
      
      // Optionally verify the listing still exists
      const listingRef = doc(db, "listings", listingId);
      const listingSnap = await getDoc(listingRef);

      if (listingSnap.exists()) {
        favoriteIds.push(listingId);
      }
    }
    
    return favoriteIds;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
};

/**
 * Check if a listing is favorited by a user
 * @param userId User ID
 * @param listingId Listing ID
 * @returns Boolean indicating if the listing is favorited
 */
export const isFavorited = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const favoriteRef = doc(db, getUserFavoritesPath(userId), listingId);
    const docSnap = await getDoc(favoriteRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking if favorited:', error);
    throw error;
  }
};

/**
 * Toggle favorite status for a listing
 * @param userId User ID
 * @param listingId Listing ID
 * @returns New favorite status (true if added, false if removed)
 */
export const toggleFavorite = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const isFavorite = await isFavorited(userId, listingId);
    
    if (isFavorite) {
      await removeFavorite(userId, listingId);
      return false;
    } else {
      await addFavorite(userId, listingId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}; 