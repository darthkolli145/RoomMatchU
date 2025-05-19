import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';
import { populateWithSampleListings } from '../utils/populateDatabase';
import { sampleListings } from '../utils/sampleListings'; // Import the sample listings

// Fallback mock data with required tags - only used if sample listings fail
const fallbackListings: ListingType[] = [
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
    neighborhood: 'westside',
    tags: {
      sleepSchedule: "10pm - 12am",
      cleanliness: "Moderately tidy",
      noiseLevel: "Background noise/music",
      lifestyle: ["Cooks often"]
    }
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
    neighborhood: 'seabright',
    tags: {
      sleepSchedule: "After 12am",
      cleanliness: "Very tidy",
      noiseLevel: "Silent",
      lifestyle: ["Stays up late", "Vegetarian"]
    }
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
    neighborhood: 'campus',
    tags: {
      sleepSchedule: "Before 10pm",
      cleanliness: "Moderately tidy",
      noiseLevel: "Silent",
      studyHabits: "Library",
      lifestyle: ["Wakes up early"]
    }
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [newListings, setNewListings] = useState<ListingType[]>([]);
  const [roommateListings, setRoommateListings] = useState<ListingType[]>([]);
  const [matchedListings, setMatchedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [populateStatus, setPopulateStatus] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavoritesFromStorage = () => {
      const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(storedFavorites);
    };
    
    const fetchListings = async () => {
      try {
        // Check for favorites first
        fetchFavoritesFromStorage();
        
        // Use sampleListings for now
        const listingsData = sampleListings;
        
        // Organize listings into different sections
        if (listingsData.length) {
          // Sort by createdAt for "New Listings"
          const sortedByDate = [...listingsData].sort((a, b) => {
            return new Date(b.createdAt.toDate()).getTime() - new Date(a.createdAt.toDate()).getTime();
          });
          
          const newListings = sortedByDate.slice(0, 4);
          setNewListings(newListings);
          
          // For "Looking for Roommates" section - just a different slice for now
          const roommates = sortedByDate.slice(4, 8);
          setRoommateListings(roommates);
          
          // For "Based on Questionnaire" section
          const matched = [...listingsData]
            .sort(() => 0.5 - Math.random()) // Simple random shuffle
            .slice(0, 4);
          setMatchedListings(matched);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading listings:', error);
        // Use fallback as last resort
        setNewListings(fallbackListings);
        setRoommateListings(fallbackListings);
        setMatchedListings(fallbackListings);
        setLoading(false);
      }
    };
    
    fetchListings();
    
    // Set up an event listener to update favorites if they change
    window.addEventListener('storage', fetchFavoritesFromStorage);
    
    return () => {
      window.removeEventListener('storage', fetchFavoritesFromStorage);
    };
  }, []);

  const handleFavorite = (listingId: string) => {
    let currentFavorites = [...favorites];
    
    if (currentFavorites.includes(listingId)) {
      currentFavorites = currentFavorites.filter(id => id !== listingId);
    } else {
      currentFavorites.push(listingId);
    }
    
    setFavorites(currentFavorites);
    
    // Save to localStorage and dispatch storage event for cross-component communication
    localStorage.setItem('favorites', JSON.stringify(currentFavorites));
    window.dispatchEvent(new Event('storage'));
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Find Your Perfect Match</h1>
        <p>Connect with roommates or find listings that match your lifestyle</p>
        <div className="search-section">
          <form>
            <input type="text" placeholder="Search for listings by location or amenities" />
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
        
        {favorites.length > 0 && (
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

        <section className="listings-section">
          <div className="section-header">
            <h2>Looking for Roommates?</h2>
            <Link to="/roommates" className="see-more-link">See More</Link>
          </div>
          <div className="listings-grid home-grid">
            {roommateListings.length > 0 ? (
              roommateListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(listing.id)}
                />
              ))
            ) : (
              <div className="no-listings">No roommate listings found</div>
            )}
          </div>
        </section>

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
      </div>
    </div>
  );
} 