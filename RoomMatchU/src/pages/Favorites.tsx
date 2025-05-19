// pages/Favorites.tsx
import { useState, useEffect } from 'react';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';
import { sampleListings } from '../utils/sampleListings';

export default function Favorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritedListings, setFavoritedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get favorites from localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(storedFavorites);
    
    // In a real app, you would fetch the listings from Firestore
    // For now, filter from sample listings
    const favListings = sampleListings.filter(listing => 
      storedFavorites.includes(listing.id)
    );
    
    setFavoritedListings(favListings);
    setLoading(false);
  }, []);

  const handleFavorite = (id: string) => {
    // Remove from favorites
    const updatedFavorites = favorites.filter(favId => favId !== id);
    setFavorites(updatedFavorites);
    
    // Update localStorage
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    // Update displayed listings
    setFavoritedListings(prevListings => 
      prevListings.filter(listing => listing.id !== id)
    );
  };

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
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
