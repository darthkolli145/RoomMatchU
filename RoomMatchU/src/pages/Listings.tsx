// Listings.tsx
import { useState, useEffect } from 'react';
import { ListingType, UserQuestionnaire, PriorityLevel } from '../types/index';
import ListingCard from '../components/ListingCard';
import ListingFilter, { FilterOptions } from '../components/ListingFilter';
import { filterListings, ListingWithScore, sortListingsByCompatibility } from '../utils/filterListings';
import { sampleListings } from '../utils/sampleListings'; // Import the sample listings
import { useMockFirebase } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
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
  priorities: {
    sleepSchedule: "Deal Breaker" as PriorityLevel, // Increased priority weight
    cleanliness: "Very Important" as PriorityLevel,
    noiseLevel: "Deal Breaker" as PriorityLevel, // Increased priority weight
    visitors: "Very Important" as PriorityLevel, // Added new priority
    pets: "Very Important" as PriorityLevel, // Added new priority
    studyHabits: "Somewhat Important" as PriorityLevel // Added new priority
  }
};

export default function Listings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [listings, setListings] = useState<ListingType[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [useQuestionnaire, setUseQuestionnaire] = useState<boolean>(false);
  const [userQuestionnaire, setUserQuestionnaire] = useState<UserQuestionnaire | null>(null);


  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (currentUser) {
        const response = await fetchQuestionnaireByUserId(currentUser.id);
        setUserQuestionnaire(response);
      }
    };
    fetchQuestionnaire();
  }, [currentUser]);
  
  // Extract search query from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

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

  // Apply filters whenever filters or search term changes
  useEffect(() => {
    if (listings.length === 0) return;
    
    // First filter by search term
    let searchResults = listings;
    if (searchTerm.trim()) {
      searchResults = listings.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Then apply compatibility filters
    const { filteredListings: filtered, listingsWithScores } = filterListings(
      searchResults, 
      filters, 
      useQuestionnaire ? mockQuestionnaire : undefined
    );
    
    // Sort by compatibility score if questionnaire is enabled
    let sortedListings = filtered;
    if (useQuestionnaire) {
      sortedListings = sortListingsByCompatibility(filtered);
    }
    
    setFilteredListings(sortedListings);
  }, [listings, filters, searchTerm, useQuestionnaire]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Update URL with search query without page reload
    const searchParams = new URLSearchParams(location.search);
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm);
    } else {
      searchParams.delete('search');
    }
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
    
    // The search term filtering is handled in the useEffect
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
      <div className="listings-content">
        <aside className="filters-sidebar">
          <div className="mb-4">
            <button 
              onClick={toggleQuestionnaire}
              className={`w-full p-3 rounded ${useQuestionnaire ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {useQuestionnaire ? 'Using Sample Compatibility Filter' : 'Enable Sample Compatibility Filter'}
            </button>
          </div>
          
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
        
        <main className="listings-main">
          <div className="listings-header">
            <h1>Listings</h1>
            <div className="search-section">
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="Search listings" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-icon">
                  <span className="material-icon">search</span>
                </button>
              </form>
            </div>
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