// Matches.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingType, UserQuestionnaire } from '../types/index';
import ListingCard from '../components/ListingCard';
import ListingFilter, { FilterOptions } from '../components/ListingFilter';
import { filterListings, ListingWithScore, sortListingsByCompatibility } from '../utils/filterListings';
import { fetchListings, fetchQuestionnaireByUserId } from '../firebase/firebaseHelpers';
import { useAuth } from '../contexts/AuthContext';
import { calculateCompatibility } from '../utils/compatibilityScoring';
import { calculateDistanceFromUCSC } from '../utils/distanceCalculator';
import { getRoadDistanceFromUCSC } from '../utils/roadDistance';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default function Matches() {
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [listings, setListings] = useState<ListingType[]>([]);
  const [matches, setMatches] = useState<ListingWithScore[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [userQuestionnaire, setUserQuestionnaire] = useState<UserQuestionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterByDistance, setFilterByDistance] = useState(true);
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);


  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (currentUser) {
        try {
          if (currentUser.questionnaire) {
            setUserQuestionnaire(currentUser.questionnaire);
          } else {
            const response = await fetchQuestionnaireByUserId(currentUser.id);
            if (response) {
              setUserQuestionnaire(response);
            }
          }
        } catch (error) {
          console.error('Error fetching questionnaire:', error);
        }
      }
    };
    fetchQuestionnaire();
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData called with filterByDistance =", filterByDistance);
      if (!userQuestionnaire) return;

      try {
          const listingsData = await fetchListings();
          setListings(listingsData);

          // Prepare filters with distance if enabled
          const filtersWithDistance = {
            ...filters,
            // Only apply distance filter if filterByDistance is true and no manual filter is set
            maxDistance: filters.maxDistance || 
                        (filterByDistance && userQuestionnaire.maxDistanceFromCampus ? 
                         userQuestionnaire.maxDistanceFromCampus : undefined)
          };

          let { filteredListings } = await filterListings(
            listingsData,
            filtersWithDistance,
            userQuestionnaire
          );
          
          const scoredListings = filteredListings; // Use the already filtered listings
          console.log("scoredListings", scoredListings);

          const sorted = sortListingsByCompatibility(scoredListings);
          console.log("Scores before filtering:", sorted.map(l => l.compatibilityScore?.score));

          // Use minCompatibility from filters, defaulting to 60 if not set
          const minCompatibility = filters.minCompatibility || 60;
          
          const finalFiltered = sorted.filter(
            (listing) =>
              listing.compatibilityScore &&
              typeof listing.compatibilityScore.score === 'number' &&
              listing.compatibilityScore.score >= minCompatibility
          );

          setMatches(finalFiltered);

      } catch (error) {
          console.error('Error loading matches:', error);
      } finally {
          setLoading(false);
      }
    };


    fetchData();
  }, [userQuestionnaire, filters, filterByDistance]);

  const handleFavorite = async (listingId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await refreshFavorites();
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="listings-page">
      {isMobile && (
        <div className="mobile-filter-toggle">
          <button className="open-filter-btn" onClick={() => setShowMobileFilters(true)}>
            <span className="material-icon">filter_list</span>
          </button>
        </div>
      )}
      <div className="listings-content">
        {(!isMobile || showMobileFilters) && (
          <aside className={`filters-sidebar ${isMobile ? 'mobile-overlay' : ''}`}>
            {isMobile && (
              <div className="close-filter-header">
                <button className="close-filter-btn" onClick={() => setShowMobileFilters(false)}>
                  <span className="material-icon">close</span>
                </button>
              </div>
            )}

            <div className="mb-4 p-3 bg-indigo-100 rounded">
              <button
                onClick={() => navigate('/questionnaire')}
                className="mt-2 w-full p-2 rounded bg-indigo-600 text-white text-sm"
              >
                Update Questionnaire
              </button>
            </div>

            <ListingFilter
              onFilterChange={handleFilterChange}
              initialFilters={filters}
              minCompatibilityLimit={60}
            />

            {currentUser && favorites.length > 0 && (
              <div className="favorites-shortcut mt-4">
                <button
                  onClick={() => navigate('/favorites')}
                  className="w-full p-3 rounded bg-rose-100 text-rose-600 hover:bg-rose-200"
                >
                  View Your Favorites ({favorites.length})
                </button>
              </div>
            )}
          </aside>
        )}

        <main className="listings-main">
          <div className="listings-header">
            <h1>Your Top Matches!</h1>
            <p>
                Showing matches with {filters.minCompatibility || 60}%+ compatibility!
            </p>
          </div>

            {userQuestionnaire?.maxDistanceFromCampus && (
                <div className="distance-filter-toggle mb-4 p-4 bg-gray-100 rounded">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={filterByDistance}
                      onChange={(e) => {
                        console.log("📦 Distance filter toggled:", e.target.checked);
                        setFilterByDistance(e.target.checked);
                      }}
                    />
                    Only show listings within {filters.maxDistance || userQuestionnaire.maxDistanceFromCampus} miles of campus
                    {filters.maxDistance && filters.maxDistance !== userQuestionnaire.maxDistanceFromCampus && (
                      <span className="text-xs text-gray-500 ml-1">(filter overrides questionnaire)</span>
                    )}
                    </label>
                </div>
            )}

          <div className="listings-count">
            <p>{matches.length} matches found</p>

            {matches.length === 0 && (
                <>
                <p className="text-sm text-gray-600 mt-1">
                    But check out the rest of our{' '}
                    <button onClick={() => navigate('/listings')} className="listings-link">
                    listings
                    </button> or {' '}
                    <button onClick={() => navigate('/questionnaire')} className="quest-link">
                    update your questionnaire
                    </button>
                    .
                </p>
                </>
            )}
          </div>

          <div className="listings-grid listings-page-grid">
            {matches.length > 0 ? (
              matches.map((listing) => {
                const isFavorited = favorites.includes(listing.id);
                return (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={isFavorited}
                    onFavorite={handleFavorite}
                    compatibilityScore={listing.compatibilityScore}
                    showCompatibilityScore={true}
                  />
                );
              })
            ) : (
              <div className="no-listings text-center p-6 bg-gray-100 rounded shadow-sm">
                <p className="text-lg font-medium"></p>
              </div>
            )}
          </div>

          {matches.length >= 12 && (
            <div className="load-more">
              <button>Load More</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
