import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingType } from '../types/index';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../firebase/favoritesService';
import { Listing } from '../firebase/firebaseHelpers';
import { calculateDistanceFromUCSC, formatDistance } from '../utils/distanceCalculator';
import { extractShortAddress } from '../utils/addressParser';

interface ListingCardProps {
  listing: Listing;
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
  const [imageError, setImageError] = useState(false);

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

  // Get the image URL to display
  const getImageUrl = () => {
    if (imageError) {
      return `https://placehold.co/400x300?text=${encodeURIComponent(listing.title || 'Listing')}`;
    }
    
    if (listing.thumbnailURL) {
      return listing.thumbnailURL;
    }
    
    if (listing.imageURLs && listing.imageURLs.length > 0) {
      return listing.imageURLs[0];
    }
    
    return `https://placehold.co/400x300?text=${encodeURIComponent(listing.title || 'Listing')}`;
  };

  const handleImageError = () => {
    console.error('Image failed to load:', getImageUrl());
    setImageError(true);
  };

console.log("DEBUG address:", listing.address);
console.log("DEBUG shortAddress:", listing.shortAddress);


  return (
    <div className="listing-card">
      <Link to={`/listing/${listing.id}`} className="listing-link">
        <div className="listing-image">
          <img 
            src={getImageUrl()} 
            alt={listing.title}
            onError={handleImageError}
            loading="lazy"
          />
          
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
                backgroundColor: compatibilityScore.score >= 80 ? '#6dacdf' : 
                               compatibilityScore.score >= 60 ? '#fff9e8' : 
                               compatibilityScore.score >= 40 ? '#ffb77c' : '#be1818',
                color: compatibilityScore.score >= 60 ? '#c1dde7' : '#fff'
              }}
            >
              {compatibilityScore.score}% Match
            </div>
          )}
        </div>
        
        <div className="listing-details">
          <h3 className="listing-title">{listing.title}</h3>
            <p className="listing-location">
              {listing.shortAddress || (listing.address ? extractShortAddress(listing.address) : '') || listing.location || 'Location not specified'}
            </p>
          <p className="listing-info">
            {listing.bedrooms} BD · {listing.bathrooms} BA · Available: {new Date(listing.availableDate).toLocaleDateString()}
          </p>
          
          {/* Distance from UCSC */}
          <p className="listing-distance">
            📍 {formatDistance(calculateDistanceFromUCSC(listing.lat, listing.lng))}
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