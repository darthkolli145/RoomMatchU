// This file exports all Firebase-related functionality
import { auth as configAuth, db as configDb, googleProvider as configGoogleProvider } from './config';
import { auth as mockAuth, db as mockDb, googleProvider as mockGoogleProvider, isMock } from './mockConfig';

// Always use mock data during development until Firebase is set up
const USE_MOCK = false;
console.log('Firebase configuration: Using mock data for development');

// Export Firebase services (either real or mock)
export const auth = USE_MOCK ? mockAuth : configAuth;
export const db = USE_MOCK ? mockDb : configDb;
export const googleProvider = USE_MOCK ? mockGoogleProvider : configGoogleProvider;
export const useMockFirebase = USE_MOCK; 