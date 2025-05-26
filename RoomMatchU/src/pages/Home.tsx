// pages/home
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType } from '../types/index';
import ListingCard from '../components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';
import { populateWithSampleListings } from '../utils/populateDatabase';
// import { sampleListings } from '../utils/sampleListings'; // Import the sample listings
import { useAuth } from '../contexts/AuthContext';
import { fetchListings } from '../firebase/firebaseHelpers';
import { Listing } from '../firebase/firebaseHelpers';
import { Timestamp } from 'firebase/firestore';


// Fallback mock data with required tags - only used if sample listings fail
const fallbackListings: Listing[] = [
  {
    id: 'listing-1',
    title: 'Beautiful 2 Bedroom in Westside',
    description: 'Spacious apartment with view',
    location: 'Westside, Santa Cruz',
    price: 1200,
    neighborhood: 'westside',
    bedrooms: 2,
    bathrooms: 1,
    availableDate: '2025-06-01',
    imageURLs: ['https://via.placeholder.com/300?text=Apartment'],
    thumbnailURL: 'https://via.placeholder.com/300?text=Apartment',
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: Timestamp.fromDate(new Date()),
    favoriteCount: 5,
    pets: true,
    onCampus: false,
    tags: {
      sleepSchedule: "10pm – 12am",
      cleanliness: "Moderately tidy",
      noiseLevel: "Background noise/music",
      lifestyle: ["Cooks often"]
    }
  },
  {
    id: 'listing-1',
    title: 'Beautiful 2 Bedroom in Westside',
    description: 'Spacious apartment with view',
    location: 'Westside, Santa Cruz',
    price: 1200,
    neighborhood: 'westside',
    bedrooms: 2,
    bathrooms: 1,
    availableDate: '2025-06-01',
    imageURLs: ['https://via.placeholder.com/300?text=Apartment'],
    thumbnailURL: 'https://via.placeholder.com/300?text=Apartment',
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: Timestamp.fromDate(new Date()),
    favoriteCount: 5,
    pets: true,
    onCampus: false,
    tags: {
      sleepSchedule: "10pm – 12am",
      cleanliness: "Moderately tidy",
      noiseLevel: "Background noise/music",
      lifestyle: ["Cooks often"]
    }
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [roommateListings, setRoommateListings] = useState<Listing[]>([]);
  const [matchedListings, setMatchedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [populateStatus, setPopulateStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAndSetListings = async () => {
      try {
        const listingsData = await fetchListings();
  
        if (listingsData.length) {
          // Sort by createdAt
          const sortedByDate = [...listingsData].sort((a, b) => {
            return new Date(b.createdAt.toDate()).getTime() - new Date(a.createdAt.toDate()).getTime();
          });
  
          setNewListings(sortedByDate.slice(0, 4));
          setRoommateListings(sortedByDate.slice(4, 8));
          setMatchedListings([...listingsData].sort(() => 0.5 - Math.random()).slice(0, 4));
        }
  
        setLoading(false);
      } catch (error) {
        console.error('Error loading listings:', error);
        setNewListings(fallbackListings);
        setRoommateListings(fallbackListings);
        setMatchedListings(fallbackListings);
        setLoading(false);
      }
    };
  
    fetchAndSetListings();
  }, []);

  const handleFavorite = async (listingId: string) => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
    
    // Refresh favorites after toggling
    await refreshFavorites();
  };
  
  const handlePopulateDatabase = async () => {
    setPopulateStatus('Adding sample listings to Firebase...');
    
    try {
      const addedIds = await populateWithSampleListings();
      setPopulateStatus(`Successfully added ${addedIds.length} listings to Firebase.`);
    } catch (error) {
      console.error('Error populating database:', error);
      setPopulateStatus('Error adding listings. See console for details.');
    }
  };
  
  const goToFavorites = () => {
    navigate('/favorites');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to listings page with search query parameter
      navigate(`/listings?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Find Your Perfect Match!</h1>
        <p>Connect with roommates or find listings that match your lifestyle</p>
        <div className="search-section">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search for listings by location or amenities" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-icon">
              <span className="material-icon">search</span>
            </button>
          </form>
          
          {useMockFirebase && populateStatus && (
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>{populateStatus}</p>
            </div>
          )}
        </div>
        
        {currentUser && favorites.length > 0 && (
          <div className="favorites-banner">
            <p>You have {favorites.length} favorite {favorites.length === 1 ? 'listing' : 'listings'}</p>
            <button 
              className="view-favorites-btn"
              onClick={goToFavorites}
            >
              View Favorites
            </button>
          </div>
        )}
      </div>

      <div className="sections-container">
        <section className="listings-section">
          <div className="section-header">
            <h2>New Listings!</h2>
            <Link to="/listings" className="see-more-link">See More</Link>
          </div>
          <div className="listings-grid home-grid">
            {newListings.length > 0 ? (
              newListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(listing.id)}
                />
              ))
            ) : (
              <div className="no-listings">No listings found</div>
            )}
          </div>
        </section>

        {currentUser && currentUser.questionnaire ? (
          <section className="listings-section">
            <div className="section-header">
              <h2>Based on Questionnaire</h2>
              <Link to="/matches" className="see-more-link">See More</Link>
            </div>
            <div className="listings-grid home-grid">
              {matchedListings.length > 0 ? (
                matchedListings.map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    onFavorite={handleFavorite}
                    isFavorited={favorites.includes(listing.id)}
                  />
                ))
              ) : (
                <div className="no-listings">No matched listings found</div>
              )}
            </div>
          </section>
        ) : currentUser ? (
          <section className="listings-section">
            <div className="section-header">
              <h2>Personalized Recommendations</h2>
            </div>
            <div className="questionnaire-prompt">
              <h3>Complete Your Questionnaire</h3>
              <p>Fill out our quick questionnaire to get personalized listing recommendations that match your lifestyle and preferences.</p>
              <Link to="/questionnaire" className="questionnaire-btn">
                Take Questionnaire
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
} 