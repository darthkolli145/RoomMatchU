import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db, googleProvider } from '../firebase/config';
import { User as FirebaseUser, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User, UserQuestionnaire } from '../types/index';
import { getUserFavorites } from '../firebase/favoritesService';
import { setDoc } from 'firebase/firestore';
import { fetchQuestionnaireByUserId } from '../firebase/firebaseHelpers';
import toast from 'react-hot-toast';

const createUserDocumentIfNotExists = async (firebaseUser: FirebaseUser) => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: new Date()
    });
    console.log('User document created for:', firebaseUser.email);
  }
};


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
      // Make sure user's email is stored in Firestore
      await createUserDocumentIfNotExists(firebaseUser);
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Try to fetch questionnaire data directly from questionnaireResponses collection
      let questionnaireData: UserQuestionnaire | null = null;
      try {
        questionnaireData = await fetchQuestionnaireByUserId(firebaseUser.uid);
        console.log('Questionnaire data found:', !!questionnaireData);
      } catch (error) {
        console.error('Error fetching questionnaire data:', error);
      }
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Create full user object with the Firebase user and additional Firestore data
        // Use questionnaire data from either user document or from direct fetch
        const fullUser: User = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          questionnaire: questionnaireData || userData.questionnaire as UserQuestionnaire || undefined
        };
        
        // If we found questionnaire data but it's not in the user doc, update the user doc
        if (questionnaireData && !userData.questionnaire) {
          try {
            await setDoc(userDocRef, { questionnaire: questionnaireData }, { merge: true });
            console.log('Updated user document with questionnaire data');
          } catch (updateError) {
            console.error('Error updating user with questionnaire data:', updateError);
          }
        }
        
        setCurrentUser(fullUser);
      } else {
        // If no additional data exists, just use the Firebase user
        // but still include questionnaire if found
        setCurrentUser({
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          questionnaire: questionnaireData || undefined
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
      const email = firebaseUser.email || '';

      if (!email.endsWith('@ucsc.edu')) {
        console.warn(`Blocked non-UCSC email sign-in: ${email}`);
        toast.error('Only UCSC email addresses are allowed.');
        await signOut(auth);
        setTimeout(async () => {
          window.location.reload();
        }, 3000); // 3 second delay to allow pop-up error to show
        return;
      }


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
      const email = result.user.email || '';
  
      if (!email.endsWith('@ucsc.edu')) {
        console.warn(`Blocked non-UCSC email sign-in: ${email}`);
        alert('Only UCSC email addresses are allowed.');
        await signOut(auth);
        // Add: Reload app to reset UI
        window.location.reload();
        return;
      }
  
      // Proceed ONLY if valid UCSC email
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