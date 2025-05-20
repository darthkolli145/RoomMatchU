import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db, googleProvider } from '../firebase/config';
import { User as FirebaseUser, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User, UserQuestionnaire } from '../types';
import { getUserFavorites } from '../firebase/favoritesService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  favorites: string[];
  refreshFavorites: () => Promise<void>;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  favorites: [],
  refreshFavorites: async () => {},
  signIn: async () => {},
  signOutUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Function to fetch user's questionnaire data
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Create full user object with the Firebase user and additional Firestore data
        const fullUser: User = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          questionnaire: userData.questionnaire as UserQuestionnaire || undefined
        };
        
        setCurrentUser(fullUser);
      } else {
        // If no additional data exists, just use the Firebase user
        setCurrentUser({
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to just Firebase user data if Firestore fetch fails
      setCurrentUser({
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined
      });
    }
  };

  // Function to fetch user's favorites from Firebase
  const refreshFavorites = async () => {
    if (currentUser) {
      try {
        const userFavorites = await getUserFavorites(currentUser.id);
        setFavorites(userFavorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setCurrentUser(null);
        setFavorites([]);
      }
      setLoading(false);
      
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
    });

    return unsubscribe;
  }, []);

  // Load favorites whenever user changes
  useEffect(() => {
    if (currentUser) {
      refreshFavorites();
    }
  }, [currentUser]);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await fetchUserData(result.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOutUser = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear favorites state
      setFavorites([]);
      
      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event('favoritesClear'));
      
      console.log('User signed out and favorites cleared');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    currentUser,
    loading,
    favorites,
    refreshFavorites,
    signIn,
    signOutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 