import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { deleteListing } from '../firebase/firebaseHelpers';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';


export default function Profile() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ fullName: '', major: '', year: '' });
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return setLoading(false);
      try {
        const userDocRef = doc(db, 'users', currentUser.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            fullName: userData.fullName || currentUser.displayName || '',
            major: userData.major || userData.questionnaire?.Major?.[0] || '',
            year: userData.year || userData.questionnaire?.yearlvl || '',
          });
          if (currentUser.questionnaire || userData.questionnaire) {
            setQuestionnaireData(currentUser.questionnaire || userData.questionnaire);
          }
        } else {
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

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!currentUser) return setLoading(false);
      try {
        const q = query(collection(db, 'listings'), where('posterUID', '==', currentUser.id));
        const snapshot = await getDocs(q);
        setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching user listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserListings();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    try {
      await deleteListing(id);
      setListings(prev => prev.filter(listing => listing.id !== id));
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  if (!currentUser) {
    return <div className="profile"><h1>Profile</h1><p>Please sign in to view your profile.</p></div>;
  }

  const labelMap: { [key: string]: string } = {
    fullName: 'Name',
    major: 'Major',
    year: 'Year',
    Gender: 'Gender',
    Hobbies: 'Hobbies',
    dealMust: 'Dealbreakers / Must-Haves',
    sharing: 'About You',
    sleepSchedule: 'Sleep Schedule',
    wakeupSchedule: 'Wake-up Schedule',
    noiseLevel: 'Noise Level',
    studySpot: 'Study Spot',
    visitors: 'Visitors',
    cleanliness: 'Cleanliness',
    lifestyle: 'Lifestyle',
    okvisitors: 'Okay with Visitors',
    overnightGuests: 'Overnight Guests',
    pets: 'Pets',
    okPets: 'Okay with Pets',
    prefGender: 'Preferred Roommate Gender',
  };

  return (
    <div className="profile">
      <h1>Your Profile</h1>

      <div className="detail-group">
        <h2>Basic Info</h2>
        <div className="compatibility-tags-prof">
          <div className="tag-item-prof">
            <span className="tag-label">Name</span>
            <span className="tag-value">{userProfile.fullName}</span>
          </div>
          <div className="tag-item-prof">
            <span className="tag-label">Major</span>
            <span className="tag-value">{userProfile.major}</span>
          </div>
          <div className="tag-item-prof">
            <span className="tag-label">Year</span>
            <span className="tag-value">{userProfile.year}</span>
          </div>
          <div className="tag-item-prof">
            <span className="tag-label">Email</span>
            <span className="tag-value">{currentUser.email}</span>
          </div>
        </div>
      </div>

      {questionnaireData && (
        <div className="detail-group">
          <h2>Your Questionnaire Answers</h2>
          <div className="compatibility-tags-prof ">
            {Object.entries(questionnaireData)
              .filter(([key, value]) => !['userId', 'createdAt', 'email', 'priorities'].includes(key) && value)
              .map(([key, value]) => (
                <div key={key} className="tag-item-prof ">
                  <span className="tag-label">{labelMap[key] || key}</span>
                  <span className="tag-value">{Array.isArray(value) ? value.join(', ') : value}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="detail-group">
        <h2>Your Listings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <p>You have no listings yet.</p>
        ) : (
          <div className="compatibility-tags-prof ">
            {listings.map((listing) => (
              <div key={listing.id} className="tag-item-prof  listing-item">
                <div className='listingTitle'>
                  <Link to={`/listing/${listing.id}`} className="tag-label listing-link">
                  {listing.title}
                  </Link>
                </div>
                <span className="tag-value">${listing.price}/month</span>
                <div>
                  <button onClick={() => handleDelete(listing.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
