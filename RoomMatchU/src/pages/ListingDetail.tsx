import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ListingType, UserQuestionnaire } from '../types/index';
import ImageGallery from '../components/ImageGallery';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../firebase/favoritesService';
import { fetchListings, fetchUserEmail, fetchQuestionnaireByUserId} from '../firebase/firebaseHelpers';
import { calculateDistanceFromUCSC, formatDistance } from '../utils/distanceCalculator';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [listing, setListing] = useState<ListingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [posterEmail, setPosterEmail] = useState<string | null>(null);
  const [posterData, setPosterData] = useState<UserQuestionnaire | null>(null);

  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingsData = await fetchListings();
        const listingData = listingsData.find(item => item.id === id);

        if (listingData) {
          setListing(listingData);

          // 🔥 Get poster email
          const email = await fetchUserEmail(listingData.ownerId);
          setPosterEmail(email);

          // 🔥 Get poster questionnaire
          const questionnaire = await fetchQuestionnaireByUserId(listingData.ownerId);
          console.log("QUESTIONNAIRE DATA:", questionnaire); // ⬅️ Add this
          setPosterData(questionnaire);
          // ✅ Set actual data
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
      
      <div className="listing-price-banner">
        <span className="price">${listing.price}</span>
        <span className="per-month">per month</span>
      </div>
      
      <div className="listing-main-content">
        <div className="listing-images">
          <ImageGallery images={listing.imageURLs} />

          <div className="description">
            <h2>Description</h2>
            <p
              className="listing-description"
              dangerouslySetInnerHTML={{ __html: listing.description.replace(/\n/g, '<br />') }}
            ></p>
        </div>
        </div>
        
        <div className="listing-details">
          <div className="detail-group">
            <h2>Property Details</h2>
            <div className="compatibility-tags">
              <div className="tag-item">
                <span className="tag-label">Bedrooms</span>
                <span className="tag-value">{listing.bedrooms}</span>
              </div>
              <div className="tag-item">
                <span className="tag-label">Bathrooms</span>
                <span className="tag-value">{listing.bathrooms}</span>
              </div>
              <div className="tag-item">
                <span className="tag-label">Location</span>
                <span className="tag-value">{listing.onCampus ? 'On Campus' : 'Off Campus'}</span>
              </div>
              <div className="tag-item">
                <span className="tag-label">Pet Friendly</span>
                <span className="tag-value">{listing.pets ? 'Yes' : 'No'}</span>
              </div>
              <div className="tag-item">
                <span className="tag-label">Available Date</span>
                <span className="tag-value">{new Date(listing.availableDate).toLocaleDateString()}</span>
              </div>
              <div className="tag-item">
                <span className="tag-label">Distance from UCSC</span>
                <span className="tag-value">{formatDistance(calculateDistanceFromUCSC(listing.lat, listing.lng))}</span>
              </div>
            </div>
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
                           category === 'visitors' ? 'Visitors' :
                           category === 'cleanliness' ? 'Cleanliness' :
                           category === 'lifestyle' ? 'Lifestyle' :
                           category === 'prefGender' ? 'Preferred Roommate Gender' :
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
                           category === 'visitors' ? 'Visitors' :
                           category === 'cleanliness' ? 'Cleanliness' :
                           category === 'lifestyle' ? 'Lifestyle' :
                           category === 'prefGender' ? 'Preferred Roommate Gender' :
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

          <div className="contact-info">
          <h2>About the Poster</h2>

          {currentUser ? (
            posterData ? (
              <div className="property-features">
                <div className="feature">
                  <span className="feature-label">Name</span>
                  <span className="feature-value">
                    {posterData.fullname?.length > 0 ? posterData.fullname.join(" ") : "Not provided"}
                  </span>
                </div>
                <div className="feature">
                  <span className="feature-label">Major</span>
                  <span className="feature-value">{posterData.Major?.join(', ') || 'N/A'}</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Year</span>
                  <span className="feature-value">{posterData.yearlvl || 'N/A'}</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Gender</span>
                  <span className="feature-value">{posterData.Gender || 'N/A'}</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Contact</span>
                  <span className="feature-value">{ownerEmail || 'Not available'}</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Dealbreakers / Must-Haves</span>
                  <span className="feature-value">{posterData.dealMust?.join(', ') || 'N/A'}</span>
                </div>
                <div className="feature">
                  <span className="feature-label">About Them</span>
                  <span className="feature-value">{posterData.sharing?.join(' ') || 'N/A'}</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Hobbies</span>
                  <span className="feature-value">{posterData.Hobbies?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <p>Poster information not available.</p>
            )
          ) : (
            <p>Please {' '}
                <button onClick={() => navigate('/login')} className="listings-link">
                sign in
                </button> to view the poster's information.
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
} 