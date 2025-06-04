// Matches.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingType, UserQuestionnaire, PriorityLevel } from '../types/index';
import ListingCard from '../components/ListingCard';
import ListingFilter, { FilterOptions } from '../components/ListingFilter';
import { filterListings, ListingWithScore, sortListingsByCompatibility } from '../utils/filterListings';
import { fetchListings, fetchQuestionnaireByUserId } from '../firebase/firebaseHelpers';
import { useAuth } from '../contexts/AuthContext';
import { calculateCompatibility } from '../utils/compatibilityScoring';
import { calculateDistanceFromUCSC } from '../utils/distanceCalculator';
import { getRoadDistanceFromUCSC } from '../utils/roadDistance';


export default function Matches() {
  const navigate = useNavigate();
  const { currentUser, favorites, refreshFavorites } = useAuth();
  const [listings, setListings] = useState<ListingType[]>([]);
  const [matches, setMatches] = useState<ListingWithScore[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [userQuestionnaire, setUserQuestionnaire] = useState<UserQuestionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterByDistance, setFilterByDistance] = useState(true);

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
        if (!userQuestionnaire) return;

        try {
            const listingsData = await fetchListings();
            setListings(listingsData);

            const { filteredListings, listingsWithScores } = filterListings(
              listingsData,
              filters,
              userQuestionnaire
            );
            const listingsWithScores = await Promise.all(
              listingsData.map(async (listing) => {
                const compatibilityScore = await calculateCompatibility(userQuestionnaire, listing);
                return { ...listing, compatibilityScore };
              })
            );

            // Distance filter
            let distanceFiltered = filteredListings;
            if (filterByDistance && userQuestionnaire.maxDistanceFromCampus) {
              distanceFiltered = filteredListings.filter((listing) => {
                if (listing.lat !== undefined && listing.lng !== undefined) {
                  const distance = calculateDistanceFromUCSC(listing.lat, listing.lng);
                  return distance === null || distance <= userQuestionnaire.maxDistanceFromCampus!;
                }
                return true;
              });
              const distanceChecks = await Promise.all(
                listingsWithScores.map(async (listing) => {
                  if (listing.lat !== undefined && listing.lng !== undefined) {
                    const distance = await getRoadDistanceFromUCSC(listing.lat, listing.lng);
                    return distance === null || distance <= userQuestionnaire.maxDistanceFromCampus!;
                  }
                  return true;
                })
              );
              
              filteredListings = listingsWithScores.filter((_, i) => distanceChecks[i]);
              
            }

            const sorted = sortListingsByCompatibility(distanceFiltered);
            const finalFiltered = sorted.filter(
              (listing) =>
                listing.compatibilityScore &&
                typeof listing.compatibilityScore.score === 'number' &&
                listing.compatibilityScore.score >= 60
            );

            setMatches(finalFiltered);

        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setLoading(false);
        }
    };


    fetchData();
  }, [userQuestionnaire, filters]);

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
      <div className="listings-content">
        <aside className="filters-sidebar">
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

        <main className="listings-main">
          <div className="listings-header">
            <h1>Your Top Matches!</h1>
            <p>
                Showing matches with 60%+ compatibility!
            </p>
          </div>

            {userQuestionnaire?.maxDistanceFromCampus && (
                <div className="distance-filter-toggle mb-4 p-4 bg-gray-100 rounded">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={filterByDistance}
                        onChange={(e) => setFilterByDistance(e.target.checked)}
                    />
                    Only show listings within {userQuestionnaire.maxDistanceFromCampus} miles of campus
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
