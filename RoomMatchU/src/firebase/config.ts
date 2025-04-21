// Firebase configuration - JavaScript version
// We're creating placeholder objects since we won't use real Firebase yet
const GoogleAuthProvider = function() {
  // Empty constructor
};

// Create mock Firebase objects
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {}; // Unsubscribe function
  },
  signInWithPopup: async () => {
    console.log('Placeholder Firebase not configured');
    return { user: null };
  },
  signOut: async () => {
    console.log('Placeholder Firebase not configured');
    return true;
  }
};

const db = {
  collection: () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => ({}),
        id: ''
      })
    }),
    where: () => ({
      get: async () => ({ docs: [] })
    }),
    orderBy: () => ({
      limit: () => ({
        get: async () => ({ docs: [] })
      })
    })
  })
};

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider }; 