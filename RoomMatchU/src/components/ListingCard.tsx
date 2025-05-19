import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../firebase/favoritesService';

interface ListingCardProps {
  listing: ListingType;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  compatibilityScore?: {
    score: number;
    matches: string[];
    conflicts: string[];
  };
  showCompatibilityScore?: boolean;
}

export default function ListingCard({
  listing,
  onFavorite,
  isFavorited = false,
  compatibilityScore,
  showCompatibilityScore = false
}: ListingCardProps) {
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to the listing detail
    
    if (isLoading) return; // Prevent multiple clicks
    
    if (!currentUser) {
      setShowAuthMessage(true);
      setTimeout(() => {
        setShowAuthMessage(false);
      }, 3000);
      return;
    }

    try {
      setIsLoading(true);
      
      // Toggle favorite in Firebase
      const newIsFavorited = await toggleFavorite(currentUser.id, listing.id);
      
      // Refresh the favorites in the auth context
      await refreshFavorites();
      
      // Call the parent component's callback if provided
      if (onFavorite) {
        onFavorite(listing.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if listing is favorited using the context's favorites array
  const isFavorite = currentUser ? favorites.includes(listing.id) : false;

  return (
    <div className="listing-card">
      <Link to={`/listing/${listing.id}`} className="listing-link">
        <div className="listing-image">
          {listing.imageURLs && listing.imageURLs.length > 0 ? (
            <img src={listing.thumbnailURL || listing.imageURLs[0]} alt={listing.title} />
          ) : (
            <div className="placeholder-image">No image available</div>
          )}
          
          <button 
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavorite}
          >
            <span className="material-icon">
              {isLoading ? 'sync' : (isFavorite ? 'favorite' : 'favorite_border')}
            </span>
          </button>
          
          {showAuthMessage && (
            <div className="auth-message">
              <p>Please sign in to save favorites</p>
              <Link to="/login">Sign In</Link>
            </div>
          )}
          
          <div className="listing-price">${listing.price}/mo</div>
          
          {showCompatibilityScore && compatibilityScore && (
            <div 
              className="compatibility-score" 
              style={{ 
                backgroundColor: compatibilityScore.score >= 80 ? '#4ade80' : 
                               compatibilityScore.score >= 60 ? '#facc15' : 
                               compatibilityScore.score >= 40 ? '#fb923c' : '#ef4444',
                color: compatibilityScore.score >= 60 ? '#000' : '#fff'
              }}
            >
              {compatibilityScore.score}% Match
            </div>
          )}
        </div>
        
        <div className="listing-details">
          <h3 className="listing-title">{listing.title}</h3>
          <p className="listing-location">{listing.location}</p>
          <p className="listing-info">
            {listing.bedrooms} BD · {listing.bathrooms} BA · Available: {new Date(listing.availableDate).toLocaleDateString()}
          </p>
          
          {compatibilityScore && compatibilityScore.matches.length > 0 && (
            <div className="match-details">
              {compatibilityScore.matches[0]}
            </div>
          )}
          
          {listing.tags && (
            <div className="listing-tags">
              {listing.tags.noiseLevel && (
                <span className="tag">{listing.tags.noiseLevel}</span>
              )}
              {listing.tags.cleanliness && (
                <span className="tag">{listing.tags.cleanliness}</span>
              )}
              {listing.tags.lifestyle && Array.isArray(listing.tags.lifestyle) && listing.tags.lifestyle.length > 0 && (
                <span className="tag">{listing.tags.lifestyle[0]}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
} 