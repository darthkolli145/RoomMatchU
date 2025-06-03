// Mock Firebase configuration for development - JavaScript version
// We're creating our own GoogleAuthProvider instead of importing
const GoogleAuthProvider = function() {
  // Empty constructor
};

// Mock Firebase implementation for development
import { Listing } from './firebaseHelpers';

const mockDb = {
  listings: new Map(),
  users: new Map(),
  favorites: new Map(),
};

// Create mock data for listings
export const mockListings: Listing[] = [
  {
    id: 'mock-1',
    title: 'Cozy Studio near Campus',
    price: 1200,
    location: 'Near UCSC',
    description: 'Perfect for students. Walking distance to campus.',
    bedrooms: 1,
    bathrooms: 1,
    availableDate: new Date('2024-03-01'),
    imageURLs: ['https://picsum.photos/400/300?random=1'],
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: new Date(),
    favoriteCount: 5,
    pets: false,
    onCampus: false,
    address: '123 High St, Santa Cruz, CA 95064',
    tags: {}
  },
  {
    id: 'mock-2',
    title: '2BR Apartment with Ocean View',
    price: 2200,
    location: 'Westside Santa Cruz',
    description: 'Beautiful apartment with stunning ocean views.',
    bedrooms: 2,
    bathrooms: 2,
    availableDate: new Date('2024-02-15'),
    imageURLs: ['https://picsum.photos/400/300?random=2'],
    amenities: ['parking', 'dishwasher', 'balcony'],
    utilities: ['water', 'garbage', 'internet'],
    ownerId: 'user-2',
    createdAt: new Date(),
    favoriteCount: 12,
    pets: true,
    onCampus: false,
    address: '456 Ocean View Dr, Santa Cruz, CA 95062',
    tags: {}
  },
  {
    id: 'mock-3',
    title: 'Room in Shared House',
    price: 800,
    location: 'Downtown Santa Cruz',
    description: 'One room available in friendly shared house.',
    bedrooms: 1,
    bathrooms: 1,
    availableDate: new Date('2024-04-01'),
    imageURLs: ['https://picsum.photos/400/300?random=3'],
    amenities: ['shared-kitchen', 'backyard'],
    utilities: ['all-included'],
    ownerId: 'user-3',
    createdAt: new Date(),
    favoriteCount: 8,
    pets: false,
    onCampus: true,
    address: '789 Pacific Ave, Santa Cruz, CA 95060',
    tags: {}
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