// pages/Favorites.tsx
import { useState, useEffect } from 'react';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import { sampleListings } from '../utils/sampleListings';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [favoritedListings, setFavoritedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites whenever the auth state or favorites change
  useEffect(() => {
    const loadFavorites = async () => {
      // Only load favorites if user is logged in
      if (currentUser) {
        // In a real app, you would fetch the listings from Firestore
        // For now, filter from sample listings
        const favListings = sampleListings.filter(listing => 
          favorites.includes(listing.id)
        );
        
        setFavoritedListings(favListings);
      } else {
        // Clear listings if not logged in
        setFavoritedListings([]);
      }
      
      setLoading(false);
    };
    
    // Load favorites immediately
    loadFavorites();
  }, [currentUser, favorites]);

  const handleFavorite = async (id: string) => {
    // After removing the favorite, refresh favorites
    await refreshFavorites();
  };

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
  }
  
  // If user is not logged in, show sign-in message
  if (!currentUser) {
    return (
      <div className="listings-page">
        <div className="listings-header">
          <h1>Your Favorites</h1>
        </div>
        
        <div className="sign-in-required">
          <h2>Sign in to view your favorites</h2>
          <p>You need to be signed in to save and view your favorite listings.</p>
          <Link to="/login" className="sign-in-link">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="listings-header">
        <h1>Your Favorites</h1>
      </div>
      
      <main className="listings-main">
        {favoritedListings.length > 0 ? (
          <div className="listings-grid listings-page-grid">
            {favoritedListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing}
                isFavorited={true}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="no-listings">
            <p>You haven't added any listings to your favorites yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
