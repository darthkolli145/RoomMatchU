// This file decides whether to use real Firebase or mock
import { auth as realAuth, db as realDb, googleProvider as realGoogleProvider } from './config';
import { auth as mockAuth, db as mockDb, googleProvider as mockGoogleProvider, isMock } from './mockConfig';

// Now that Firebase is connected, use the real Firebase implementation
const USE_MOCK = false;
console.log('Firebase configuration: Using', USE_MOCK ? 'mock' : 'real', 'Firebase services');

// Add some debug logging
console.log('Real Firebase auth available:', !!realAuth);
console.log('Real Firebase db available:', !!realDb);

// Export the appropriate services
export const auth = USE_MOCK ? mockAuth : realAuth;
export const db = USE_MOCK ? mockDb : realDb;
export const googleProvider = USE_MOCK ? mockGoogleProvider : realGoogleProvider;
export const useMockFirebase = USE_MOCK; 