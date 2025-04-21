import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [newListings, setNewListings] = useState<ListingType[]>([]);
  const [roommateListings, setRoommateListings] = useState<ListingType[]>([]);
  const [matchedListings, setMatchedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch new listings
        const newListingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const newListingsSnapshot = await getDocs(newListingsQuery);
        const newListingsData = newListingsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as ListingType));
        setNewListings(newListingsData);

        // In a real app, you would have different queries for roommates and matched listings
        // For demo purposes, we'll use the same data
        setRoommateListings(newListingsData);
        setMatchedListings(newListingsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

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

      <section className="listings-section">
        <div className="section-header">
          <h2>New Listings!</h2>
          <Link to="/listings" className="see-more-link">See More</Link>
        </div>
        <div className="listings-grid">
          {newListings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      </section>

      <section className="listings-section">
        <div className="section-header">
          <h2>Looking for Roommates?</h2>
          <Link to="/roommates" className="see-more-link">See More</Link>
        </div>
        <div className="listings-grid">
          {roommateListings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      </section>

      <section className="listings-section">
        <div className="section-header">
          <h2>Based on Questionnaire</h2>
          <Link to="/matches" className="see-more-link">See More</Link>
        </div>
        <div className="listings-grid">
          {matchedListings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
} 