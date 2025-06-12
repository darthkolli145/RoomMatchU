// pages/home
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType, CompatibilityScore } from '../types/index';
import ListingCard from '../components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';
import { populateWithSampleListings } from '../utils/populateDatabase';
// import { sampleListings } from '../utils/sampleListings'; // Import the sample listings
import { useAuth } from '../contexts/AuthContext';
import { fetchListings } from '../firebase/firebaseHelpers';
import { Listing } from '../firebase/firebaseHelpers';
import { Timestamp } from 'firebase/firestore';
import { calculateCompatibility } from '../utils/compatibilityScoring';
import { calculateDistanceFromUCSC } from '../utils/distanceCalculator';
import { getRoadDistanceFromUCSC } from '../utils/roadDistance';

// Type for listings with compatibility scores
type ListingWithScore = Listing & { compatibilityScore?: CompatibilityScore };

// Fallback mock data with required tags - only used if sample listings fail
const fallbackListings: Listing[] = [
  {
    id: 'listing-1',
    title: 'Beautiful 2 Bedroom in Westside',
    description: 'Spacious apartment with view',
    location: 'Westside, Santa Cruz',
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    availableDate: new Date('2025-06-01'),
    imageURLs: ['https://via.placeholder.com/300?text=Apartment'],
    thumbnailURL: 'https://via.placeholder.com/300?text=Apartment',
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: Timestamp.fromDate(new Date()),
    favoriteCount: 5,
    pets: true,
    onCampus: false,
    address: '123 West St, Santa Cruz, CA',
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
    bedrooms: 2,
    bathrooms: 1,
    availableDate: new Date('2025-06-01'),
    imageURLs: ['https://via.placeholder.com/300?text=Apartment'],
    thumbnailURL: 'https://via.placeholder.com/300?text=Apartment',
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: Timestamp.fromDate(new Date()),
    favoriteCount: 5,
    pets: true,
    onCampus: false,
    address: '123 West St, Santa Cruz, CA',
    tags: {
      sleepSchedule: "10pm – 12am",
      cleanliness: "Moderately tidy",
      noiseLevel: "Background noise/music",
      lifestyle: ["Cooks often"]
    }
  }
];

const sampleListings = [
  {
    id: '1',
    title: 'Sunny Room in Westside',
    price: 800,
    location: 'Westside, Santa Cruz',
    description: 'Bright room in shared house',
    bedrooms: 1,
    bathrooms: 1,
    availableDate: new Date('2024-02-01'),
    imageURLs: ['https://placehold.co/400x300?text=Room'],
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user1',
    createdAt: new Date(),
    favoriteCount: 5,
    pets: false,
    onCampus: false,
    address: '',
    tags: {}
  },
  {
    id: '2',
    title: '2BR Apartment Near Campus',
    price: 1500,
    location: 'Near UCSC',
    description: 'Modern apartment, walking distance to campus',
    bedrooms: 2,
    bathrooms: 1,
    availableDate: new Date('2024-03-01'),
    imageURLs: ['https://placehold.co/400x300?text=Apartment'],
    amenities: ['parking', 'dishwasher'],
    utilities: ['water', 'garbage', 'electricity'],
    ownerId: 'user2',
    createdAt: new Date(),
    favoriteCount: 12,
    pets: true,
    onCampus: false,
    address: '',
    tags: {}
  }
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [roommateListings, setRoommateListings] = useState<Listing[]>([]);
  const [matchedListings, setMatchedListings] = useState<ListingWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [populateStatus, setPopulateStatus] = useState('');
  const isMobile = useIsMobile();

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
          
          // If the user has a questionnaire, generate personalized matches
          if (currentUser?.questionnaire) {
            console.log('Generating matches based on questionnaire');

            const listingsWithScores = await Promise.all(
              listingsData.map(async (listing) => {
                const compatibilityScore = await calculateCompatibility(currentUser.questionnaire!, listing);
                return { ...listing, compatibilityScore };
              })
            );

            // Filter by max distance from UCSC if available
            let filteredByDistance = listingsWithScores;
            if (currentUser.questionnaire.maxDistanceFromCampus) {
              const distanceChecks = await Promise.all(
                listingsWithScores.map(async (listing) => {
                  if (listing.lat !== undefined && listing.lng !== undefined) {
                    const distance = await getRoadDistanceFromUCSC(listing.lat, listing.lng);
                    if (distance === null) return true;
                    return distance <= currentUser.questionnaire!.maxDistanceFromCampus!;
                  }
                  return true;
                })
              );
              filteredByDistance = listingsWithScores.filter((_, idx) => distanceChecks[idx]);
            }

            // Now apply score threshold
            const filteredByScore = filteredByDistance.filter(listing =>
              (listing.compatibilityScore?.score || 0) >= 60
            );

            // Sort remaining listings by score
            const sortedByCompatibility = filteredByScore.sort((a, b) => {
              const scoreA = a.compatibilityScore?.score || 0;
              const scoreB = b.compatibilityScore?.score || 0;
              return scoreB - scoreA;
            });

            setMatchedListings(sortedByCompatibility.slice(0, 4));
          } else {
            setMatchedListings([...listingsData].sort(() => 0.5 - Math.random()).slice(0, 4));
          }

          
          // Additional listings
          setRoommateListings(sortedByDate.slice(4, 8));
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
  }, [currentUser]);

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

  // Check if the user has already completed the questionnaire
  const hasCompletedQuestionnaire = currentUser?.questionnaire !== undefined;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Find Your Perfect Match!</h1>
        <p>Connect with fellow ucsc roommates or find listings that match your lifestyle</p>
        <div className="search-section">
          <button 
            onClick={() => navigate('/listings')}
            className="hero-cta-button"
          >
            Look for your perfect Place
          </button>
          
          {useMockFirebase && populateStatus && (
            <div className="mt-4 text-center text-sm text-[#be1818] font-medium">
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
              newListings.slice(0, isMobile ? 2 : 4).map(listing => (
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

        {currentUser && hasCompletedQuestionnaire ? (
          <section className="listings-section">
            <div className="section-header">
              <h2>Based on Questionnaire</h2>
              <Link to="/matches" className="see-more-link">See More</Link>
            </div>
            <div className="listings-grid home-grid">
              {matchedListings.length > 0 ? (
                matchedListings.slice(0, isMobile ? 2 : 4).map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    onFavorite={handleFavorite}
                    isFavorited={favorites.includes(listing.id)}
                    compatibilityScore={listing.compatibilityScore}
                    showCompatibilityScore={true}
                  />
                ))
              ) : (
                <div className="no-listings">
                  <p>😕 No matches above 60% compatibility found.</p>
                  <p>Check out our <Link to="/listings" className="listings-link">new listings</Link> or try updating your <Link to="/questionnaire" className="quest-link">questionnaire</Link>.</p>
                </div>
              )}
            </div>
          </section>
        ) : currentUser && !hasCompletedQuestionnaire ? (
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