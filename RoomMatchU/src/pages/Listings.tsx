import { useState, useEffect } from 'react';
import { ListingType, UserQuestionnaire, PriorityLevel } from '../types';
import ListingCard from '../components/ListingCard';
import ListingFilter, { FilterOptions } from '../components/ListingFilter';
import { filterListings, ListingWithScore, sortListingsByCompatibility } from '../utils/filterListings';
import { sampleListings } from '../utils/sampleListings'; // Import the sample listings
import { useMockFirebase } from '../firebase';

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
  const [listings, setListings] = useState<ListingType[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [useQuestionnaire, setUseQuestionnaire] = useState<boolean>(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log('Fetching listings...');
        
        // Use sample listings which have complete compatibility data
        console.log('Using sample listings data with compatibility tags');
        const listingsData = sampleListings;
        
        console.log(`Total sample listings: ${listingsData.length}`);
        setListings(listingsData);
        
        // Apply initial filtering (without compatibility initially)
        const { listingsWithScores } = filterListings(listingsData, {}, undefined);
        setFilteredListings(listingsWithScores);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading listings:', error);
        // Use fallback as last resort
        setListings(fallbackListings);
        const { listingsWithScores } = filterListings(fallbackListings, {}, undefined);
        setFilteredListings(listingsWithScores);
        setLoading(false);
      }
    };

    fetchListings();
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
      
      // Debug: Log compatibility scores of sorted listings
      console.log('Compatibility scores of sorted listings:');
      sortedListings.forEach(listing => {
        console.log(`${listing.title} - Score: ${listing.compatibilityScore?.overall.toFixed(1)}%, Details: ${listing.compatibilityScore?.matchDetails.join(', ')}`);
      });
    }
    
    setFilteredListings(sortedListings);
  }, [listings, filters, searchTerm, useQuestionnaire]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The search term is already handled in the useEffect
  };

  const handleFavorite = (listingId: string) => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (favorites.includes(listingId)) {
      favorites = favorites.filter((id: string) => id !== listingId);
    } else {
      favorites.push(listingId);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('Updated favorites:', favorites);
    // In a real app, this would add/remove the listing from favorites in Firestore
  };

  const toggleQuestionnaire = () => {
    setUseQuestionnaire(!useQuestionnaire);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="listings-page">
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
      
      <div className="listings-content">
        <aside className="filters-sidebar">
          <div className="mb-4">
            <button 
              onClick={toggleQuestionnaire}
              className={`w-full p-3 rounded ${useQuestionnaire ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {useQuestionnaire ? 'Using Compatibility Filter' : 'Enable Compatibility Filter'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              {useQuestionnaire 
                ? 'Listings are now sorted by compatibility' 
                : 'Click to use sample questionnaire data to filter listings'}
            </p>
          </div>
          
          <ListingFilter 
            onFilterChange={handleFilterChange} 
            initialFilters={filters}
          />
        </aside>
        
        <main className="listings-main">
          <div className="listings-count">
            <p>{filteredListings.length} listings found</p>
          </div>
          
          <div className="listings-grid listings-page-grid">
            {filteredListings.length > 0 ? (
              (() => {
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

                return filteredListings.map(listing => {
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
                });
              })()
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