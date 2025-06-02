import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { deleteListing } from '../firebase/firebaseHelpers';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { currentUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // User profile form state
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    major: '',
    year: '',
  });

  // Questionnaire data state
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);

  // Fetch user profile and questionnaire data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Get user doc from Firestore
        const userDocRef = doc(db, 'users', currentUser.id);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set user profile data
          setUserProfile({
            fullName: userData.fullName || currentUser.displayName || '',
            major: userData.major || (userData.questionnaire?.Major?.[0] || ''),
            year: userData.year || (userData.questionnaire?.yearlvl || ''),
          });
          
          // Set questionnaire data if available
          if (currentUser.questionnaire || userData.questionnaire) {
            setQuestionnaireData(currentUser.questionnaire || userData.questionnaire);
          }
        } else {
          // Initialize with currentUser data if available
          setUserProfile({
            fullName: currentUser.displayName || '',
            major: '',
            year: '',
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Fetch listings from Firestore where posterUID matches current user
  useEffect(() => {
    const fetchUserListings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'listings'),
          where('posterUID', '==', currentUser.id)
        );
        const snapshot = await getDocs(q);
        const fetchedListings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(fetchedListings);
      } catch (err) {
        console.error('Error fetching user listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserListings();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      await setDoc(userDocRef, {
        fullName: userProfile.fullName,
        major: userProfile.major,
        year: userProfile.year,
        // Don't overwrite other fields
      }, { merge: true });
      
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = (id: string) => {
    console.log(`[ARCHIVE] Listing ID: ${id}`);
    // Future: connect archive logic
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteListing(id);
      console.log(`Successfully deleted listing ${id}`);
      setListings(prev => prev.filter(listing => listing.id !== id));
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="profile p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-[#2c3e50]">Profile</h1>
        <p className="text-center">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-[#2c3e50]">Your Profile</h1>

      {message && (
        <div className={`p-3 mb-4 rounded text-center ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Edit toggle */}
      <div className="text-center mb-6">
        {!editMode ? (
          <button
            className="text-indigo-600 underline"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex justify-center gap-4">
            <button
              className="text-gray-600 underline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
            <button
              className="bg-indigo-600 text-white px-4 py-1 rounded"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Basic Info</h2>
        {editMode ? (
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600">Full Name</label>
              <input 
                className="w-full border p-2 rounded" 
                name="fullName"
                value={userProfile.fullName} 
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Major</label>
              <input 
                className="w-full border p-2 rounded" 
                name="major"
                value={userProfile.major} 
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Year</label>
              <input 
                className="w-full border p-2 rounded" 
                name="year"
                value={userProfile.year} 
                onChange={handleInputChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p><strong>Name:</strong> {userProfile.fullName || currentUser.displayName || 'Not provided'}</p>
            <p><strong>Major:</strong> {userProfile.major || 'Not provided'}</p>
            <p><strong>Year:</strong> {userProfile.year || 'Not provided'}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
          </div>
        )}
      </section>

      {/* Questionnaire */}
      {questionnaireData && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Your Questionnaire Answers</h2>
          <div className="space-y-1">
            {Object.entries(questionnaireData)
              .filter(([key]) => 
                !['userId', 'createdAt', 'email', 'priorities'].includes(key) && 
                typeof questionnaireData[key] !== 'object'
              )
              .map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong>{' '}
                  {Array.isArray(value) 
                    ? (value as any[]).join(', ') 
                    : (value as any).toString()}
                </p>
              ))}
          </div>
          <div className="mt-4">
            <button
              className="text-indigo-600 underline"
              onClick={() => window.location.href = '/questionnaire'}
            >
              Update Questionnaire
            </button>
          </div>
        </section>
      )}

      {/* Listings */}
      <section>
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Your Listings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <p>You have no listings yet.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="border p-4 rounded shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <p className="text-sm text-gray-600">{listing.location}</p>
                  <p className="text-sm text-gray-600">${listing.price}/month</p>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                    onClick={() => handleArchive(listing.id)}
                  >
                    Archive
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
