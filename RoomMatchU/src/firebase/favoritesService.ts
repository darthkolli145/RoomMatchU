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

// Collection name
const FAVORITES_COLLECTION = 'favorites';

/**
 * Add a listing to a user's favorites
 * @param userId User ID
 * @param listingId Listing ID
 */
export const addFavorite = async (userId: string, listingId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, FAVORITES_COLLECTION, `${userId}_${listingId}`);
    await setDoc(favoriteRef, {
      userId,
      listingId,
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
    const favoriteRef = doc(db, FAVORITES_COLLECTION, `${userId}_${listingId}`);
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
    // Create a query against the favorites collection
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(favoritesRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    const favoriteIds: string[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const listingRef = doc(db, "listings", data.listingId);
      const listingSnap = await getDoc(listingRef);

      if (listingSnap.exists()) {
        favoriteIds.push(data.listingId);
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
    const favoriteRef = doc(db, FAVORITES_COLLECTION, `${userId}_${listingId}`);
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