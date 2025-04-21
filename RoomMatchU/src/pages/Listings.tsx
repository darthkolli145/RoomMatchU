import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import FilterBar from '../components/FilterBar';

// Fallback mock data if Firebase query fails
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
    neighborhood: 'westside'
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
    neighborhood: 'seabright'
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
    neighborhood: 'campus'
  }
];

type FilterValues = {
  onCampus: string;
  houseType: string;
  neighborhood: string;
  priceMin: string;
  priceMax: string;
  rooms: string;
  utilities: string;
  rentPeriod: string;
  pets: string;
};

export default function Listings() {
  const [listings, setListings] = useState<ListingType[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (useMockFirebase) {
      console.log('Using mock Firebase database for listings');
    }
    
    const fetchListings = async () => {
      try {
        console.log('Fetching listings...');
        const listingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc')
        );
        
        const listingsSnapshot = await getDocs(listingsQuery);
        console.log('Snapshot received, doc count:', listingsSnapshot.docs?.length || 0);
        
        let listingsData = [];
        
        if (listingsSnapshot.docs?.length > 0) {
          listingsData = listingsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as ListingType));
        } else {
          console.log('No docs found, using fallback data');
          listingsData = fallbackListings;
        }
        
        setListings(listingsData);
        setFilteredListings(listingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        console.log('Using fallback listings data');
        setListings(fallbackListings);
        setFilteredListings(fallbackListings);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...listings];
    
    // Filter by on/off campus
    if (filters.onCampus) {
      filtered = filtered.filter(listing => {
        if (filters.onCampus === 'on') return listing.onCampus;
        if (filters.onCampus === 'off') return !listing.onCampus;
        return true;
      });
    }
    
    // Filter by neighborhood
    if (filters.neighborhood) {
      filtered = filtered.filter(listing => 
        listing.neighborhood.toLowerCase() === filters.neighborhood.toLowerCase()
      );
    }
    
    // Filter by price range
    if (filters.priceMin) {
      filtered = filtered.filter(listing => 
        listing.price >= parseInt(filters.priceMin)
      );
    }
    
    if (filters.priceMax) {
      filtered = filtered.filter(listing => 
        listing.price <= parseInt(filters.priceMax)
      );
    }
    
    // Filter by number of rooms
    if (filters.rooms) {
      filtered = filtered.filter(listing => 
        listing.bedrooms >= parseInt(filters.rooms)
      );
    }
    
    // Filter by pets allowed
    if (filters.pets) {
      filtered = filtered.filter(listing => {
        if (filters.pets === 'yes') return listing.pets;
        if (filters.pets === 'no') return !listing.pets;
        return true;
      });
    }
    
    setFilteredListings(filtered);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredListings(listings);
      return;
    }
    
    const searchResults = listings.filter(listing => 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredListings(searchResults);
  };

  const handleFavorite = (listingId: string) => {
    console.log('Favorited listing:', listingId);
    // In a real app, this would add/remove the listing from favorites in Firestore
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
          <FilterBar onFilterChange={handleFilterChange} />
        </aside>
        
        <main className="listings-main">
          <div className="listings-count">
            <p>{filteredListings.length} listings found</p>
          </div>
          
          <div className="listings-grid">
            {filteredListings.length > 0 ? (
              filteredListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  onFavorite={handleFavorite}
                />
              ))
            ) : (
              <div className="no-listings">
                <p>No listings found matching your criteria.</p>
              </div>
            )}
          </div>
          
          {filteredListings.length > 0 && (
            <div className="load-more">
              <button>Load More</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 