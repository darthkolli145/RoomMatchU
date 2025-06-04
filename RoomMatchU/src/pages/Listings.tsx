// Listings.tsx
import { useState, useEffect } from 'react';
import { ListingType, UserQuestionnaire, PriorityLevel } from '../types/index';
import ListingCard from '../components/ListingCard';
import ListingFilter, { FilterOptions } from '../components/ListingFilter';
import { filterListings, ListingWithScore, sortListingsByCompatibility } from '../utils/filterListings';
import { sampleListings } from '../utils/sampleListings'; // Import the sample listings
import { useMockFirebase } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchListings, fetchQuestionnaireByUserId } from '../firebase/firebaseHelpers';


// Fallback mock data if everything else fails
const fallbackListings = [
  {
    id: 'listing-1',
    title: 'Beautiful 2 Bedroom in Westside',
    price: 1200,
    location: 'Westside, Santa Cruz',
    description: 'Spacious apartment with view',
    bedrooms: 2,
    bathrooms: 1,
    availableDate: new Date('2025-06-01'),
    imageURLs: ['https://via.placeholder.com/300?text=Apartment'],
    amenities: ['parking', 'laundry'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-1',
    createdAt: { toDate: () => new Date() },
    favoriteCount: 5,
    pets: true,
    onCampus: false,
    address: '123 West St, Santa Cruz, CA 95060',
    lat: 36.9741, // About 2 miles from UCSC
    lng: -122.0308,
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
    availableDate: new Date('2025-05-15'),
    imageURLs: ['https://via.placeholder.com/300?text=House'],
    amenities: ['parking', 'laundry', 'backyard'],
    utilities: ['water', 'garbage'],
    ownerId: 'user-2',
    createdAt: { toDate: () => new Date(Date.now() - 86400000) },
    favoriteCount: 8,
    pets: true,
    onCampus: false,
    address: '456 Ocean View Ave, Santa Cruz, CA 95062',
    lat: 36.9627, // About 4 miles from UCSC
    lng: -122.0000,
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
    availableDate: new Date('2025-06-15'),
    imageURLs: ['https://via.placeholder.com/300?text=Dorm'],
    amenities: ['furnished', 'kitchen'],
    utilities: ['all'],
    ownerId: 'user-3',
    createdAt: { toDate: () => new Date(Date.now() - 172800000) },
    favoriteCount: 3,
    pets: false,
    onCampus: true,
    address: '1156 High St, Santa Cruz, CA 95064',
    lat: 36.9916, // On campus
    lng: -122.0583,
    tags: {
      sleepSchedule: "Before 10pm",
      cleanliness: "Moderately tidy",
      noiseLevel: "Silent",
      studyHabits: "Library",
      lifestyle: ["Wakes up early"]
    }
  }
];

// Mock questionnaire for demonstration - updated for more diverse compatibility scores
const mockQuestionnaire: UserQuestionnaire = {
  fullname: ["Sample User"],
  lifestyle: ["Stays up late", "Drinks", "Smokes"], // Different from most listings
  cleanliness: "Very tidy", // Will be incompatible with messy listings
  noiseLevel: "Silent", // Will be incompatible with noisy listings
  sleepSchedule: "After 12am", // Late sleeper, incompatible with early sleepers
  yearlvl: "Graduate",
  visitors: "Rarely", // Will conflict with those who have visitors frequently
  Gender: "Male", // Changed to increase diversity
  sharing: ["Looking for roommates"],
  Hobbies: ["Gaming", "Music"],
  Major: ["Engineering"],
  wakeupSchedule: "After 9am", // Late riser, incompatible with early risers
  roommateCleanliness: "Very Important",
  okvisitors: "No", // Doesn't want visitors, will conflict with frequent visitors
  overnightGuests: "No", // Strong preference against overnight guests
  studySpot: "Library",
  pets: "No",
  okPets: "No", // No pets allowed, will conflict with pet-friendly places
  prefGender: "Male",
  dealMust: ["Quiet environment", "No smoking inside"],
  maxDistanceFromCampus: 5, // Added: prefers within 5 miles of campus
  priorities: {
    sleepSchedule: "Deal Breaker" as PriorityLevel, // Increased priority weight
    cleanliness: "Very Important" as PriorityLevel,
    noiseLevel: "Deal Breaker" as PriorityLevel, // Increased priority weight
    visitors: "Very Important" as PriorityLevel, // Added new priority
    pets: "Very Important" as PriorityLevel, // Added new priority
    studyHabits: "Somewhat Important" as PriorityLevel // Added new priority
  }
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default function Listings() {
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [listings, setListings] = useState<ListingType[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [useQuestionnaire, setUseQuestionnaire] = useState<boolean>(currentUser?.questionnaire !== undefined);
  const [userQuestionnaire, setUserQuestionnaire] = useState<UserQuestionnaire | null>(null);
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);



  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (currentUser) {
        try {
          // First try to get the questionnaire from the user object
          if (currentUser.questionnaire) {
            const questionnaire = currentUser.questionnaire;
            setUserQuestionnaire(questionnaire);
            setUseQuestionnaire(true);
            console.log('Using questionnaire from user profile');
            // Set initial filters based on user's questionnaire preferences
            if (questionnaire.maxDistanceFromCampus) {
              setFilters(prev => ({
                ...prev,
                maxDistance: questionnaire.maxDistanceFromCampus
              }));
            }
          } else {
            // If not in user object, try to fetch from questionnaireResponses collection
            const response = await fetchQuestionnaireByUserId(currentUser.id);
            if (response) {
              setUserQuestionnaire(response);
              setUseQuestionnaire(true);
              console.log('Using questionnaire from responses collection');
              // Set initial filters based on user's questionnaire preferences
              if (response.maxDistanceFromCampus) {
                setFilters(prev => ({
                  ...prev,
                  maxDistance: response.maxDistanceFromCampus
                }));
              }
            } else {
              console.log('No questionnaire found for user');
              setUseQuestionnaire(false);
            }
          }
        } catch (error) {
          console.error('Error fetching questionnaire:', error);
          setUseQuestionnaire(false);
        }
      } else {
        setUseQuestionnaire(false);
      }
    };
    fetchQuestionnaire();
  }, [currentUser]);
  
  useEffect(() => {
    const fetchListingsData = async () => {
      try {
        console.log('Fetching listings from Firestore...');
        const listingsData = await fetchListings();
  
        console.log(`Fetched ${listingsData.length} listings`);
        setListings(listingsData);
  
        const { listingsWithScores } = filterListings(listingsData, {}, undefined);
        setFilteredListings(listingsWithScores);
        setLoading(false);
      } catch (error) {
        console.error('Error loading listings:', error);
        setListings(fallbackListings);
        const { listingsWithScores } = filterListings(fallbackListings, {}, undefined);
        setFilteredListings(listingsWithScores);
        setLoading(false);
      }
    };
  
    fetchListingsData();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    if (listings.length === 0) return;
    
    // Apply compatibility filters
    const { filteredListings: filtered, listingsWithScores } = filterListings(
      listings, 
      filters, 
      useQuestionnaire && userQuestionnaire ? userQuestionnaire : undefined
    );
    
    // Sort by compatibility score if questionnaire is enabled and userQuestionnaire exists
    let sortedListings = filtered;
    if (useQuestionnaire && userQuestionnaire) {
      sortedListings = sortListingsByCompatibility(filtered);
    }
    
    setFilteredListings(sortedListings);
  }, [listings, filters, useQuestionnaire, userQuestionnaire]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleFavorite = async (listingId: string) => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
    
    // Favorites are now managed in Firebase through ListingCard component
    // After toggle, refresh the favorites
    await refreshFavorites();
  };

  const toggleQuestionnaire = () => {
    setUseQuestionnaire(!useQuestionnaire);
  };
  
  const goToFavorites = () => {
    navigate('/favorites');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="listings-page">
      {isMobile && (
        <div className="mobile-filter-toggle">
          <button className="open-filter-btn" onClick={() => setShowMobileFilters(true)}>
            <span className="material-icon">filter_list</span>
          </button>
        </div>
      )}
      <div className="listings-content">
        {(!isMobile || showMobileFilters) && (
          <aside className={`filters-sidebar ${isMobile ? 'mobile-overlay' : ''}`}>
            {isMobile && (
              <div className="close-filter-header">
                <button className="close-filter-btn" onClick={() => setShowMobileFilters(false)}>
                  <span className="material-icon">close</span>
                </button>
              </div>
            )}
            {userQuestionnaire ? (
              <div className="mb-4">
                <button 
                  onClick={toggleQuestionnaire}
                  className={`w-full p-3 rounded ${useQuestionnaire ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  {useQuestionnaire ? 'Using Your Compatibility Profile' : 'Enable Compatibility Matching'}
                </button>
                {useQuestionnaire && (
                  <p className="text-sm text-gray-600 mt-1">
                    Listings are sorted by how well they match your preferences.
                  </p>
                )}
              </div>
            ) : currentUser ? (
              <div className="mb-4 p-3 bg-yellow-100 rounded">
                <p className="text-sm">Complete your questionnaire to enable compatibility matching!</p>
                <button 
                  onClick={() => navigate('/questionnaire')}
                  className="mt-2 w-full p-2 rounded bg-yellow-500 text-white text-sm"
                >
                  Take Questionnaire
                </button>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm">Sign in to enable compatibility matching!</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-2 w-full p-2 rounded bg-gray-500 text-white text-sm"
                >
                  Sign In
                </button>
              </div>
            )}
            
            <ListingFilter 
              onFilterChange={handleFilterChange} 
              initialFilters={filters}
            />
            
            {currentUser && favorites.length > 0 && (
              <div className="favorites-shortcut mt-4">
                <button 
                  onClick={goToFavorites}
                  className="w-full p-3 rounded bg-rose-100 text-rose-600 hover:bg-rose-200"
                >
                  View Your Favorites ({favorites.length})
                </button>
              </div>
            )}
          </aside>
          )}
        <main className="listings-main">
          <div className="listings-header">
            <h1>Listings</h1>
          </div>
          <div className="listings-count">
            <p>{filteredListings.length} listings found</p>
          </div>
          
          <div className="listings-grid listings-page-grid">
            {filteredListings.length > 0 ? (
              filteredListings.map(listing => {
                const isFavorited = favorites.includes(listing.id);
                return (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    isFavorited={isFavorited}
                    onFavorite={handleFavorite}
                    compatibilityScore={listing.compatibilityScore}
                    showCompatibilityScore={useQuestionnaire}
                  />
                );
              })
            ) : (
              <div className="no-listings">
                <p>No listings found matching your criteria.</p>
              </div>
            )}
          </div>
          
          {filteredListings.length > 0 && filteredListings.length >= 12 && (
            <div className="load-more">
              <button>Load More</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 