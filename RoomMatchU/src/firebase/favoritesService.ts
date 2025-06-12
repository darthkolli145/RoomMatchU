/**
 * Firebase service for managing user's favorite listings
 * Handles adding, removing, and retrieving favorited housing listings
 */

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
 * Adds a listing to the user's favorites collection in Firestore
 * Creates a subcollection under the user's document to store favorites
 * @param userId - The ID of the user favoriting the listing
 * @param listingId - The ID of the listing being favorited
 * @returns Promise<void>
 * @throws Error if the database operation fails
 */
export const addToFavorites = async (userId: string, listingId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', listingId);
    await setDoc(favoriteRef, {
      listingId,
      favoritedAt: serverTimestamp(),
      userId
    });
    console.log(`Added listing ${listingId} to favorites for user ${userId}`);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Removes a listing from the user's favorites collection
 * @param userId - The ID of the user unfavoriting the listing
 * @param listingId - The ID of the listing being removed from favorites
 * @returns Promise<void>
 * @throws Error if the database operation fails
 */
export const removeFromFavorites = async (userId: string, listingId: string): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', listingId);
    await deleteDoc(favoriteRef);
    console.log(`Removed listing ${listingId} from favorites for user ${userId}`);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

/**
 * Retrieves all favorited listing IDs for a specific user
 * @param userId - The ID of the user whose favorites to retrieve
 * @returns Promise<string[]> - Array of listing IDs that the user has favorited
 * @throws Error if the database operation fails
 */
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const favoritesCollection = collection(db, 'users', userId, 'favorites');
    const favoritesSnapshot = await getDocs(favoritesCollection);
    
    const favoriteIds = favoritesSnapshot.docs.map(doc => doc.id);
    console.log(`Retrieved ${favoriteIds.length} favorites for user ${userId}`);
    
    return favoriteIds;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
};

/**
 * Checks if a specific listing is favorited by a user
 * @param userId - The ID of the user to check
 * @param listingId - The ID of the listing to check
 * @returns Promise<boolean> - True if the listing is favorited, false otherwise
 */
export const isListingFavorited = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', listingId);
    const favoriteDoc = await getDoc(favoriteRef);
    
    return favoriteDoc.exists();
  } catch (error) {
    console.error('Error checking if listing is favorited:', error);
    return false;
  }
};

/**
 * Toggles the favorite status of a listing for a user
 * If the listing is currently favorited, it removes it; if not favorited, it adds it
 * @param userId - The ID of the user toggling the favorite
 * @param listingId - The ID of the listing being toggled
 * @returns Promise<boolean> - True if the listing is now favorited, false if unfavorited
 */
export const toggleFavorite = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const isFavorited = await isListingFavorited(userId, listingId);
    
    if (isFavorited) {
      await removeFromFavorites(userId, listingId);
      return false;
    } else {
      await addToFavorites(userId, listingId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}; 