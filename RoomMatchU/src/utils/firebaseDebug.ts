// Firebase debugging utility functions

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

/**
 * Fetches and logs all documents from a specific collection
 * @param collectionName The name of the collection to check
 */
export const checkCollection = async (collectionName: string): Promise<any[]> => {
  try {
    console.log(`Checking contents of "${collectionName}" collection...`);
    
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents: any[] = [];
    
    console.log(`Found ${querySnapshot.docs.length} documents in "${collectionName}"`);
    
    querySnapshot.forEach((docSnapshot) => {
      const docData = docSnapshot.data();
      const formattedData = {
        id: docSnapshot.id,
        ...docData,
        // Convert any Timestamp objects to readable dates
        ...(docData.createdAt && { 
          createdAt: typeof docData.createdAt.toDate === 'function' 
            ? docData.createdAt.toDate().toISOString() 
            : docData.createdAt 
        }),
        ...(docData.updatedAt && { 
          updatedAt: typeof docData.updatedAt.toDate === 'function' 
            ? docData.updatedAt.toDate().toISOString() 
            : docData.updatedAt 
        })
      };
      
      console.log(`Document ID: ${docSnapshot.id}`, formattedData);
      documents.push(formattedData);
    });
    
    return documents;
  } catch (error) {
    console.error(`Error checking "${collectionName}" collection:`, error);
    throw error;
  }
};

/**
 * Fetches and logs a specific document
 * @param collectionName The collection containing the document
 * @param documentId The ID of the document to check
 */
export const checkDocument = async (collectionName: string, documentId: string) => {
  try {
    console.log(`Checking document "${documentId}" in collection "${collectionName}"...`);
    
    const docRef = doc(db, collectionName, documentId);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      console.log(`Document data:`, data);
      return data;
    } else {
      console.log(`Document "${documentId}" does not exist in collection "${collectionName}"`);
      return null;
    }
  } catch (error) {
    console.error(`Error checking document:`, error);
    throw error;
  }
};

/**
 * Checks the contents of a specific Storage folder
 * @param path The path in Storage to check
 */
export const checkStorageFolder = async (path: string): Promise<string[]> => {
  try {
    console.log(`Checking Storage folder: ${path}`);
    
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    console.log(`Found ${result.items.length} files in "${path}"`);
    
    const fileUrls: string[] = [];
    
    for (const itemRef of result.items) {
      const url = await getDownloadURL(itemRef);
      console.log(`File: ${itemRef.name}, URL: ${url}`);
      fileUrls.push(url);
    }
    
    // Log any prefixes (subfolders)
    result.prefixes.forEach((folderRef) => {
      console.log(`Subfolder: ${folderRef.name}`);
    });
    
    return fileUrls;
  } catch (error) {
    console.error(`Error checking Storage folder:`, error);
    throw error;
  }
}; 