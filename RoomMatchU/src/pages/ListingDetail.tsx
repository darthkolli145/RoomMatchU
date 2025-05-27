import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ListingType } from '../types/index';
import ImageGallery from '../components/ImageGallery';
import { sampleListings } from '../utils/sampleListings';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../firebase/favoritesService';
import { fetchListings, fetchUserEmail } from '../firebase/firebaseHelpers';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [listing, setListing] = useState<ListingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [posterEmail, setPosterEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingsData = await fetchListings();
        const listingData = listingsData.find(item => item.id === id);

        if (listingData) {
          setListing(listingData);

          // Fetch email of the user who posted the listing
        const email = await fetchUserEmail(listingData.ownerId);
        setPosterEmail(email);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id]);

  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

useEffect(() => {
  const getEmail = async () => {
    if (listing?.ownerId) {
      const email = await fetchUserEmail(listing.ownerId);
      setOwnerEmail(email);
    }
  };
  getEmail();
}, [listing]);
  
  const handleFavorite = async () => {
    // Check if user is authenticated
    if (!currentUser) {
      setShowAuthMessage(true);
      
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowAuthMessage(false);
      }, 5000);
      
      return; // Stop execution if user is not authenticated
    }
    
    if (!listing || isFavoriteLoading) return;
    
    try {
      setIsFavoriteLoading(true);
      
      // Toggle favorite status in Firebase
      await toggleFavorite(currentUser.id, listing.id);
      
      // Refresh favorites in context
      await refreshFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  
  const handleSignIn = () => {
    // Redirect to login page
    navigate('/login');
  };
  
  const goToFavorites = () => {
    navigate('/favorites');
  };
  
  // Check if this listing is in favorites
  const isFavorited = id ? favorites.includes(id) : false;
  
  if (loading) {
    return <div className="loading">Loading listing details...</div>;
  }
  
  if (!listing) {
    return (
      <div className="listing-detail-page">
        <div className="error-message">
          <h2>Listing not found</h2>
          <p>The listing you're looking for doesn't exist or has been removed.</p>
          <Link to="/listings" className="back-button">Back to Listings</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="listing-detail-page">
      <div className="listing-detail-header">
        <Link to="/listings" className="back-link">&larr; Back to Listings</Link>
        <div className="favorite-actions">
          <button 
            className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavorite}
            disabled={isFavoriteLoading}
          >
            {isFavoriteLoading ? 'Processing...' : (isFavorited ? 'Remove from Favorites' : 'Add to Favorites')}
          </button>
          {currentUser && isFavorited && (
            <button 
              className="view-favorites-button"
              onClick={goToFavorites}
            >
              View Favorites
            </button>
          )}
          {showAuthMessage && (
            <div className="auth-message-detail">
              <p>Please sign in to save favorites</p>
              <button onClick={handleSignIn}>Sign In</button>
            </div>
          )}
        </div>
      </div>
      
      <h1 className="listing-title">{listing.title}</h1>
      <p className="listing-location">{listing.location}</p>
      
      <div className="listing-price-banner">
        <span className="price">${listing.price}</span>
        <span className="per-month">per month</span>
      </div>
      
      <div className="listing-main-content">
        <div className="listing-images">
          <ImageGallery images={listing.imageURLs} />
        </div>
        
        <div className="listing-details">
          <div className="detail-group">
            <h2>Property Details</h2>
            <div className="property-features">
              <div className="feature">
                <span className="feature-label">Bedrooms</span>
                <span className="feature-value">{listing.bedrooms}</span>
              </div>
              <div className="feature">
                <span className="feature-label">Bathrooms</span>
                <span className="feature-value">{listing.bathrooms}</span>
              </div>
              <div className="feature">
                <span className="feature-label">Available From</span>
                <span className="feature-value">{new Date(listing.availableDate).toLocaleDateString()}</span>
              </div>
              <div className="feature">
                <span className="feature-label">Neighborhood</span>
                <span className="feature-value">{listing.neighborhood}</span>
              </div>
              <div className="feature">
                <span className="feature-label">On Campus</span>
                <span className="feature-value">{listing.onCampus ? 'Yes' : 'No'}</span>
              </div>
              <div className="feature">
                <span className="feature-label">Pet Friendly</span>
                <span className="feature-value">{listing.pets ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          <div className="detail-group">
            <h2>Description</h2>
            <p className="listing-description">{listing.description}</p>
          </div>
          
          <div className="detail-group">
            <h2>Amenities</h2>
            <ul className="amenities-list">
              {listing.amenities.map((amenity, index) => (
                <li key={index} className="amenity-item">{amenity}</li>
              ))}
            </ul>
          </div>
          
          <div className="detail-group">
            <h2>Utilities</h2>
            <ul className="utilities-list">
              {listing.utilities.map((utility, index) => (
                <li key={index} className="utility-item">{utility}</li>
              ))}
            </ul>
          </div>
          
          {listing.tags && Object.keys(listing.tags).length > 0 && (
            <div className="detail-group">
              <h2>Compatibility Information</h2>
              <div className="compatibility-tags">
                {Object.entries(listing.tags).map(([category, value]) => {
                  if (Array.isArray(value) && value.length > 0) {
                    return (
                      <div key={category} className="tag-item">
                        <span className="tag-label">
                          {category === 'sleepSchedule' ? 'Sleep Schedule' : 
                           category === 'wakeupSchedule' ? 'Wake-up Schedule' : 
                           category === 'noiseLevel' ? 'Noise Level' :
                           category === 'studyHabits' ? 'Study Habits' :
                           category}
                        </span>
                        <span className="tag-value">{value.join(', ')}</span>
                      </div>
                    );
                  } else if (typeof value === 'string' && value) {
                    return (
                      <div key={category} className="tag-item">
                        <span className="tag-label">
                          {category === 'sleepSchedule' ? 'Sleep Schedule' : 
                           category === 'wakeupSchedule' ? 'Wake-up Schedule' : 
                           category === 'noiseLevel' ? 'Noise Level' :
                           category === 'studyHabits' ? 'Study Habits' :
                           category}
                        </span>
                        <span className="tag-value">{value}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="contact-info">
        <h2>Contact Information</h2>
            {currentUser ? (
        ownerEmail ? (
          <p>Contact: {ownerEmail}</p>
        ) : (
          <p>Contact email not available.</p>
        )
      ) : (
        <p>Please sign in to view contact details.</p>
      )}
      </div>
    </div>
  );
} 