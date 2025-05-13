import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import { Link } from 'react-router-dom';
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
  const [newListings, setNewListings] = useState<ListingType[]>([]);
  const [roommateListings, setRoommateListings] = useState<ListingType[]>([]);
  const [matchedListings, setMatchedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingData, setIsCreatingData] = useState(false);
  const [isAddingSampleData, setIsAddingSampleData] = useState(false);

  useEffect(() => {
    if (useMockFirebase) {
      console.log('Using mock Firebase database');
    } else {
      console.log('Using real Firebase database');
    }
    
    const fetchListings = async () => {
      try {
        console.log('Fetching listings for home page...');
        
        // Use sample listings directly to show more variety
        const allListings = sampleListings;
        console.log(`Total sample listings available: ${allListings.length}`);
        
        // Get latest 6 listings for "New Listings" section
        const latest = [...allListings].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date();
          const dateB = b.createdAt?.toDate?.() || new Date();
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 6);
        
        // Get first 6 listings for "Looking for Roommates" section
        // Since we don't have that specific tag in our sample data, we're using different listings
        const roommateListingsData = allListings
          .filter((_, index) => index % 2 === 0) // Just selecting every other listing for variety
          .slice(0, 6);
        
        // Get 6 different listings for "Based on Questionnaire" section
        const matchListingsData = allListings
          .filter((_, index) => index % 3 === 0) // Just selecting every 3rd listing for variety
          .slice(0, 6);
        
        setNewListings(latest);
        setRoommateListings(roommateListingsData);
        setMatchedListings(matchListingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        console.log('Using fallback listings data');
        setNewListings(fallbackListings);
        setRoommateListings(fallbackListings);
        setMatchedListings(fallbackListings);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const createSampleData = async () => {
    alert('This feature is not available in the current configuration. Use the Add Full Sample Listings button instead.');
  };

  const addFullSampleListings = async () => {
    alert('This feature currently requires a proper Firebase configuration. Please set up Firebase first.');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would redirect to search results
    console.log('Search submitted');
  };

  const handleFavorite = (listingId: string) => {
    console.log('Favorited listing:', listingId);
    // In a real app, this would add/remove the listing from favorites in Firestore
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Search for locations, roommates, or listings" />
          <button type="submit" className="search-icon">
            <span className="material-icon">search</span>
          </button>
        </form>
      </div>

      {!useMockFirebase && (
        <div style={{ textAlign: 'center', margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={createSampleData} 
            disabled={isCreatingData}
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: isCreatingData ? 'not-allowed' : 'pointer',
              opacity: isCreatingData ? 0.7 : 1
            }}
          >
            {isCreatingData ? 'Creating Basic Data...' : 'Create Basic Sample Data'}
          </button>

          <button 
            onClick={addFullSampleListings} 
            disabled={isAddingSampleData}
            style={{
              background: '#3F51B5',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: isAddingSampleData ? 'not-allowed' : 'pointer',
              opacity: isAddingSampleData ? 0.7 : 1
            }}
          >
            {isAddingSampleData ? 'Adding Sample Listings...' : 'Add Full Sample Listings with Tags'}
          </button>
        </div>
      )}

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