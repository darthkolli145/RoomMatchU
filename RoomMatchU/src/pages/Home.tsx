import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import { Link } from 'react-router-dom';

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

export default function Home() {
  const [newListings, setNewListings] = useState<ListingType[]>([]);
  const [roommateListings, setRoommateListings] = useState<ListingType[]>([]);
  const [matchedListings, setMatchedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingData, setIsCreatingData] = useState(false);

  useEffect(() => {
    if (useMockFirebase) {
      console.log('Using mock Firebase database');
    } else {
      console.log('Using real Firebase database');
    }
    
    const fetchListings = async () => {
      try {
        console.log('Fetching listings...');
        // Fetch new listings
        const newListingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        console.log('Query created');
        
        const newListingsSnapshot = await getDocs(newListingsQuery);
        console.log('Snapshot received, doc count:', newListingsSnapshot.docs?.length || 0);
        
        let listingsData = [];
        
        if (newListingsSnapshot.docs?.length > 0) {
          listingsData = newListingsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          console.log('Found listings in Firebase:', listingsData.length);
        } else {
          console.log('No docs found, using fallback data');
          listingsData = fallbackListings;
        }
        
        console.log('Processed listings data:', listingsData);
        
        setNewListings(listingsData);
        setRoommateListings(listingsData);
        setMatchedListings(listingsData);
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
    if (useMockFirebase) {
      alert('Cannot add sample data when using mock Firebase');
      return;
    }

    try {
      setIsCreatingData(true);
      console.log('Creating sample data in Firebase...');

      // Remove the id property and add server timestamp for createdAt
      const sample1 = {
        ...fallbackListings[0],
        createdAt: serverTimestamp(),
      };
      delete sample1.id;

      const sample2 = {
        ...fallbackListings[1],
        createdAt: serverTimestamp(),
      };
      delete sample2.id;

      const sample3 = {
        ...fallbackListings[2],
        createdAt: serverTimestamp(),
      };
      delete sample3.id;

      // Add to Firebase
      const listingsCollection = collection(db, 'listings');
      await addDoc(listingsCollection, sample1);
      await addDoc(listingsCollection, sample2);
      await addDoc(listingsCollection, sample3);

      alert('Sample data created! Refresh the page to see it.');
      console.log('Sample data created successfully');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data. Check console for details.');
    } finally {
      setIsCreatingData(false);
    }
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
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
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
            {isCreatingData ? 'Creating Sample Data...' : 'Create Sample Data in Firebase'}
          </button>
        </div>
      )}

      <section className="listings-section">
        <div className="section-header">
          <h2>New Listings!</h2>
          <Link to="/listings" className="see-more-link">See More</Link>
        </div>
        <div className="listings-grid">
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
        <div className="listings-grid">
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
        <div className="listings-grid">
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
  );
} 