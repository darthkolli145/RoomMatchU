import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingType } from '../types';

type ListingCardProps = {
  listing: ListingType;
  onFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
};

export default function ListingCard({ listing, onFavorite, isFavorited = false }: ListingCardProps) {
  const [favorite, setFavorite] = useState(isFavorited);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    if (onFavorite) {
      onFavorite(listing.id);
    }
  };

  return (
    <div className="listing-card">
      <Link to={`/listing/${listing.id}`} className="listing-link">
        <div className="listing-image">
          {listing.imageURLs && listing.imageURLs.length > 0 ? (
            <img src={listing.imageURLs[0]} alt={listing.title} />
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
        </div>
        <div className="listing-details">
          <h3 className="listing-title">{listing.title}</h3>
          <p className="listing-location">{listing.location}</p>
          <p className="listing-info">
            {listing.bedrooms} BD | {listing.bathrooms} BA | Available {new Date(listing.availableDate).toLocaleDateString()}
          </p>
        </div>
      </Link>
    </div>
  );
} 