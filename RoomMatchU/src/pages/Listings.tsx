import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import FilterBar from '../components/FilterBar';

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
    const fetchListings = async () => {
      try {
        const listingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc')
        );
        const listingsSnapshot = await getDocs(listingsQuery);
        const listingsData = listingsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as ListingType));
        setListings(listingsData);
        setFilteredListings(listingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
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