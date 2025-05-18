// pages/Favorites.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, useMockFirebase } from '../firebase';
import { ListingType } from '../types';
import ListingCard from '../components/ListingCard';

// Use same mock data as fallback
const fallbackListings = [/* same fallbackListings array here */];

export default function Favorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritedListings, setFavoritedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve favorite IDs from localStorage
    const stored = localStorage.getItem('favorites');
    const favoriteIds = stored ? JSON.parse(stored) : [];
    setFavorites(favoriteIds);

    const fetchListings = async () => {
      try {
        const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(listingsQuery);

        let listingsData: ListingType[] = [];

        if (snapshot.docs.length > 0) {
          listingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ListingType));
        } else {
          listingsData = fallbackListings;
        }

        const filtered = listingsData.filter(listing => favoriteIds.includes(listing.id));
        setFavoritedListings(filtered);
      } catch (error) {
        console.error('Error loading favorites, using fallback data:', error);
        const filtered = fallbackListings.filter(listing => favoriteIds.includes(listing.id));
        setFavoritedListings(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFavorite = (id: string) => {
    // optional: allow unfavorite from this page
    const updated = favorites.filter(favId => favId !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavoritedListings(favoritedListings.filter(listing => listing.id !== id));
  };

  if (loading) return <div className="loading">Loading...</div>;

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
          <p>No favorited listings yet.</p>
        )}
      </main>
    </div>
  );
}
