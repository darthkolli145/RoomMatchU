/**
 * ListingCard component - displays individual housing listing information in a card format
 * Handles favorite toggling, image galleries, and compatibility score display
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListingType, CompatibilityScore } from '../types/index';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../firebase/favoritesService';
import { Listing } from '../firebase/firebaseHelpers';
import { calculateDistanceFromUCSC, formatDistance } from '../utils/distanceCalculator';
import { extractShortAddress } from '../utils/addressParser';
import { getRoadDistanceFromUCSC } from '../utils/roadDistance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ListingCardProps {
  listing: ListingType;
  onFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
  compatibilityScore?: CompatibilityScore;
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);

  // Get the images to display (use placeholder if none available)
  const imagesToShow = listing.imageURLs && listing.imageURLs.length > 0 
    ? listing.imageURLs 
    : ['https://placehold.co/400x300?text=No+Image'];

  useEffect(() => {
    /**
     * Calculates and sets the road distance from listing to UCSC campus
     * Only runs if listing has valid coordinates
     */
    const calculateDistance = async () => {
      if (listing.lat !== undefined && listing.lng !== undefined) {
        setIsLoadingDistance(true);
        try {
          const roadDistance = await getRoadDistanceFromUCSC(listing.lat, listing.lng);
          setDistance(roadDistance);
        } catch (error) {
          console.error('Error calculating distance:', error);
        } finally {
          setIsLoadingDistance(false);
        }
      }
    };

    calculateDistance();
  }, [listing.lat, listing.lng]);
  

  /**
   * Handles clicking on the listing card to navigate to the detailed view
   * @param e - Click event
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('.favorite-btn') || target.closest('.image-nav-btn')) {
      return;
    }
    navigate(`/listing/${listing.id}`);
  };

  /**
   * Handles toggling the favorite status of a listing
   * Shows appropriate success/error messages and updates UI state
   * @param e - Click event from favorite button
   */
  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (!currentUser) {
      toast.error('Please sign in to save favorites');
      navigate('/login');
      return;
    }

    if (isTogglingFavorite) return; // Prevent multiple rapid clicks

    setIsTogglingFavorite(true);
    
    try {
      const newFavoriteStatus = await toggleFavorite(currentUser.id, listing.id);
      
      if (newFavoriteStatus) {
        toast.success('Added to favorites! ❤️');
      } else {
        toast.success('Removed from favorites');
      }
      
      // Call the parent component's callback if provided
      if (onFavorite) {
        onFavorite(listing.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  /**
   * Advances to the next image in the gallery
   * Wraps around to the first image if at the end
   * @param e - Click event from next button
   */
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesToShow.length);
  };

  /**
   * Goes back to the previous image in the gallery
   * Wraps around to the last image if at the beginning
   * @param e - Click event from previous button
   */
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesToShow.length) % imagesToShow.length);
  };

  /**
   * Formats the availability date for display
   * @param date - The availability date
   * @returns string - Formatted date string
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  /**
   * Gets the appropriate CSS class for compatibility score styling
   * @param score - Compatibility score (0-100)
   * @returns string - CSS class name based on score range
   */
  const getCompatibilityClass = (score: number) => {
    if (score >= 80) return 'compatibility-excellent';
    if (score >= 60) return 'compatibility-good';
    if (score >= 40) return 'compatibility-fair';
    return 'compatibility-poor';
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
      return listing.imageURLs[currentImageIndex];
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
              className={`compatibility-score ${getCompatibilityClass(compatibilityScore.score)}`}
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
            📍 {formatDistance(distance)}
          </p>
          
          {Array.isArray(compatibilityScore?.matches) && compatibilityScore.matches.length > 0 && (
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