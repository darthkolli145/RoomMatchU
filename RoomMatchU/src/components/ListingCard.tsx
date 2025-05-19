import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingType, CompatibilityScore } from '../types';

type ListingCardProps = {
  listing: ListingType;
  onFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
  compatibilityScore?: CompatibilityScore;
  showCompatibilityScore?: boolean;
};

export default function ListingCard({ 
  listing, 
  onFavorite, 
  isFavorited = false,
  compatibilityScore,
  showCompatibilityScore = false,
}: ListingCardProps) {
  const [favorite, setFavorite] = useState(isFavorited);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    if (onFavorite) {
      onFavorite(listing.id);
    }
  };

  // Helper to generate color for compatibility score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-600 text-white';
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 70) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 50) return 'bg-yellow-400';
    if (score >= 40) return 'bg-orange-400';
    if (score >= 30) return 'bg-orange-500 text-white';
    if (score >= 20) return 'bg-red-400 text-white';
    return 'bg-red-500 text-white';
  };

  // Helper to generate descriptive text for score
  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Great Match';
    if (score >= 60) return 'Good Match';
    if (score >= 50) return 'Fair Match';
    if (score >= 40) return 'Basic Match';
    if (score >= 30) return 'Partial Match';
    if (score >= 20) return 'Low Match';
    return 'Poor Match';
  };

  // Select the image to display - use thumbnailURL if available, otherwise first image or placeholder
  const getDisplayImage = () => {
    if (listing.thumbnailURL) {
      return listing.thumbnailURL;
    } else if (listing.imageURLs && listing.imageURLs.length > 0) {
      return listing.imageURLs[0];
    }
    return null;
  };

  const displayImage = getDisplayImage();

  return (
    <div className="listing-card">
      <Link to={`/listing/${listing.id}`} className="listing-link">
        <div className="listing-image">
          {displayImage ? (
            <img src={displayImage} alt={listing.title} />
          ) : (
            <div className="placeholder-image">No Image</div>
          )}
          <button 
            className={`favorite-btn ${favorite ? 'favorited' : ''}`}
            onClick={handleFavorite}
          >
            <span className="material-icon">
              {favorite ? 'favorite' : 'favorite_border'}
            </span>
          </button>
          <div className="listing-price">${listing.price}</div>
          
          {/* Compatibility score chip */}
          {showCompatibilityScore && compatibilityScore && (
            <div 
              className={`compatibility-score ${getScoreColor(compatibilityScore.overall)}`}
              title={compatibilityScore.matchDetails.join('\n')}
            >
              {compatibilityScore.overall.toFixed(1)}% {getScoreDescription(compatibilityScore.overall)}
            </div>
          )}
        </div>
        <div className="listing-details">
          <h3 className="listing-title">{listing.title}</h3>
          <p className="listing-location">{listing.location}</p>
          <p className="listing-info">
            {listing.bedrooms} BD | {listing.bathrooms} BA | Available {new Date(listing.availableDate).toLocaleDateString()}
          </p>
          
          {/* Match details if available */}
          {showCompatibilityScore && compatibilityScore && compatibilityScore.matchDetails.length > 0 && (
            <div className="match-details text-xs text-gray-600 mt-1">
              <span className="font-semibold">Matches:</span> {compatibilityScore.matchDetails.slice(0, 2).join(', ')}
              {compatibilityScore.matchDetails.length > 2 && '...'}
            </div>
          )}
          
          {/* Show tags if available */}
          {listing.tags && Object.keys(listing.tags).length > 0 && (
            <div className="listing-tags">
              {Object.entries(listing.tags).map(([category, value]) => {
                if (Array.isArray(value) && value.length > 0) {
                  return (
                    <span key={category} className="tag">
                      {value[0]}
                    </span>
                  );
                } else if (typeof value === 'string' && value) {
                  return (
                    <span key={category} className="tag">
                      {value}
                    </span>
                  );
                }
                return null;
              }).filter(Boolean).slice(0, 3)}
              {Object.keys(listing.tags).length > 3 && (
                <span className="tag">+{Object.keys(listing.tags).length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
} 