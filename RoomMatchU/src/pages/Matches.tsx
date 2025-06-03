import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchListings } from '../firebase/firebaseHelpers';
import { Listing } from '../firebase/firebaseHelpers';
import ListingCard from '../components/ListingCard';
import { calculateCompatibility } from '../utils/compatibilityScoring';
import { calculateDistanceFromUCSC } from '../utils/distanceCalculator';
import { CompatibilityScore } from '../types/index';

// Type for listings with compatibility scores
type ListingWithScore = Listing & { compatibilityScore?: CompatibilityScore };

export default function Matches() {
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [matchedListings, setMatchedListings] = useState<ListingWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterByDistance, setFilterByDistance] = useState(true);

  useEffect(() => {
    // Redirect to questionnaire if user hasn't completed it
    if (currentUser && !currentUser.questionnaire) {
      navigate('/questionnaire');
      return;
    }
    
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchAndSortListings = async () => {
      try {
        const listingsData = await fetchListings();
        
        if (listingsData.length && currentUser.questionnaire) {
          // Add compatibility scores to all listings
          const listingsWithScores = listingsData.map(listing => {
            const compatibilityScore = calculateCompatibility(currentUser.questionnaire!, listing);
            return { ...listing, compatibilityScore };
          });
          
          // Filter by user's preferred max distance if enabled
          let filteredListings = listingsWithScores;
          if (filterByDistance && currentUser.questionnaire.maxDistanceFromCampus) {
            filteredListings = listingsWithScores.filter(listing => {
              if (listing.lat !== undefined && listing.lng !== undefined) {
                const distance = calculateDistanceFromUCSC(listing.lat, listing.lng);
                if (distance === null) return true;
                return distance <= currentUser.questionnaire!.maxDistanceFromCampus!;
              }
              return true;
            });
          }
          
          // Sort by compatibility score (highest first)
          const sortedByCompatibility = [...filteredListings].sort((a, b) => {
            const scoreA = a.compatibilityScore?.score || 0;
            const scoreB = b.compatibilityScore?.score || 0;
            return scoreB - scoreA;
          });
          
          setMatchedListings(sortedByCompatibility);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading matches:', error);
        setLoading(false);
      }
    };
    
    fetchAndSortListings();
  }, [currentUser, navigate, filterByDistance]);

  const handleFavorite = async (listingId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await refreshFavorites();
  };

  if (loading) {
    return <div className="loading">Loading your matches...</div>;
  }

  if (!currentUser) {
    return null; // Will redirect
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <Link to="/" className="back-link">&larr; Back to Home</Link>
        <h1>Your Matches</h1>
        <p className="subtitle">
          Listings sorted by compatibility with your questionnaire preferences
        </p>
      </div>

      {currentUser.questionnaire?.maxDistanceFromCampus && (
        <div className="distance-filter-toggle">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterByDistance}
              onChange={(e) => setFilterByDistance(e.target.checked)}
              className="mr-2"
            />
            Only show listings within {currentUser.questionnaire.maxDistanceFromCampus} miles of campus
          </label>
        </div>
      )}

      <div className="matches-stats">
        <p>Found {matchedListings.length} compatible listings</p>
      </div>

      <div className="listings-grid matches-grid">
        {matchedListings.length > 0 ? (
          matchedListings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              onFavorite={handleFavorite}
              isFavorited={favorites.includes(listing.id)}
              compatibilityScore={listing.compatibilityScore}
              showCompatibilityScore={true}
            />
          ))
        ) : (
          <div className="no-matches">
            <h2>No matches found</h2>
            <p>
              {filterByDistance && currentUser.questionnaire?.maxDistanceFromCampus
                ? 'Try unchecking the distance filter to see more listings.'
                : 'Check back later for new listings that match your preferences.'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .matches-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .matches-header {
          margin-bottom: 2rem;
        }

        .matches-header h1 {
          font-size: 2rem;
          margin: 1rem 0 0.5rem;
          color: #1f2937;
        }

        .subtitle {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .back-link {
          color: #6366f1;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .distance-filter-toggle {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .matches-stats {
          margin-bottom: 2rem;
          font-size: 1rem;
          color: #6b7280;
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .no-matches {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .no-matches h2 {
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .no-matches p {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
} 