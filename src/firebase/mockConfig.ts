// Mock Firebase configuration for development
import { GoogleAuthProvider } from 'firebase/auth';

// Create mock data for listings
const mockListings = [
  {
    id: 'listing-1',
    title: 'Beautiful 2 Bedroom in Westside',
    price: 1200,
    location: 'Westside, Santa Cruz',
    description: 'Spacious apartment with view',
    bedrooms: 2,
    bathrooms: 1,
    availableDate: '2025-06-01',
    imageURLs: ['https://via.placeholder.com/300?text=Apartment'],
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: { toDate: () => new Date() },
    favoriteCount: 5,
    pets: true,
    onCampus: false,
    neighborhood: 'westside'
  },
  {
    id: 'listing-2',
    title: '3 Bedroom House in Seabright',
    price: 2200,
    location: 'Seabright, Santa Cruz',
    description: 'Charming house near the beach',
    bedrooms: 3,
    bathrooms: 2,
    availableDate: '2025-05-15',
    imageURLs: ['https://via.placeholder.com/300?text=House'],
    amenities: ['parking', 'laundry', 'backyard'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-2',
    createdAt: { toDate: () => new Date(Date.now() - 86400000) },
    favoriteCount: 8,
    pets: true,
    onCampus: false,
    neighborhood: 'seabright'
  },
  {
    id: 'listing-3',
    title: 'Room in 4-person apartment on campus',
    price: 900,
    location: 'UC Santa Cruz',
    description: 'Room available in student housing',
    bedrooms: 1,
    bathrooms: 1,
    availableDate: '2025-06-15',
    imageURLs: ['https://via.placeholder.com/300?text=Dorm'],
    amenities: ['furnished', 'kitchen'],
    utilities: ['all'],
    ownerId: 'user-3',
    createdAt: { toDate: () => new Date(Date.now() - 172800000) },
    favoriteCount: 3,
    pets: false,
    onCampus: true,
    neighborhood: 'campus'
  }
];

// Mock users
const mockUsers = [
  {
    id: 'user-1',
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    photoURL: 'https://via.placeholder.com/150?text=Jane',
    questionnaire: {
      lifestyle: ['studying', 'quiet'],
      cleanliness: 'very clean',
      noiseLevel: 'quiet',
      sleepSchedule: 'early bird',
      visitors: 'occasionally',
      sharing: ['kitchen items', 'cleaning supplies']
    }
  },
  {
    id: 'user-2',
    displayName: 'John Smith',
    email: 'john@example.com',
    photoURL: 'https://via.placeholder.com/150?text=John',
    questionnaire: {
      lifestyle: ['social', 'active'],
      cleanliness: 'average',
      noiseLevel: 'moderate',
      sleepSchedule: 'night owl',
      visitors: 'frequently',
      sharing: ['furniture', 'kitchen items']
    }
  }
];

// Simplified mock auth
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {}; // Unsubscribe function
  },
  signInWithPopup: async () => {
    console.log('Mock sign in with Google');
    return { user: { uid: 'mock-uid', email: 'user@example.com', displayName: 'Test User' } };
  },
  signOut: async () => {
    console.log('Mock sign out');
    return true;
  }
};

// Simplified mock database
const db = {
  collection: (path) => ({
    doc: (id) => ({
      get: async () => ({
        exists: true,
        data: () => {
          if (path === 'listings') {
            return mockListings.find(item => item.id === id) || {};
          } else if (path === 'users') {
            return mockUsers.find(item => item.id === id) || {};
          }
          return {};
        },
        id
      })
    }),
    where: () => ({
      get: async () => ({
        docs: mockListings.map(listing => ({
          id: listing.id,
          data: () => listing,
          exists: true
        }))
      })
    }),
    orderBy: () => ({
      limit: () => ({
        get: async () => ({
          docs: mockListings.map(listing => ({
            id: listing.id,
            data: () => listing,
            exists: true
          }))
        })
      })
    })
  })
};

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
export const isMock = true; 