/**
 * ListingFilter component - provides advanced filtering interface for housing listings
 * Handles price, location, compatibility, and lifestyle filtering options
 * Integrates with the user's questionnaire for personalized filtering
 */

import React, { useState, useEffect } from 'react';
import { QuestionnaireCategory, UserQuestionnaire } from '../types/index';
import { useAuth } from '../contexts/AuthContext';

// Interface defining all possible filter options
export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  onCampus?: boolean;
  pets?: boolean;
  maxDistance?: number;
  minCompatibility?: number;
  priorityCategories?: QuestionnaireCategory[];
}

interface ListingFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  showCompatibilityFilters?: boolean;
}

export default function ListingFilter({ 
  onFilterChange, 
  onClearFilters, 
  showCompatibilityFilters = true 
}: ListingFilterProps) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Priority categories that can be filtered on
  const PRIORITY_CATEGORIES: { value: QuestionnaireCategory; label: string }[] = [
    { value: 'sleepSchedule', label: 'Sleep Schedule' },
    { value: 'wakeupSchedule', label: 'Wake-up Schedule' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'noiseLevel', label: 'Noise Level' },
    { value: 'visitors', label: 'Visitors' },
    { value: 'pets', label: 'Pets' },
    { value: 'studyHabits', label: 'Study Habits' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  /**
   * Notifies parent component whenever filters change
   * Triggers the filtering logic in the parent component
   */
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  /**
   * Updates a specific filter value and triggers re-filtering
   * @param key - The filter property to update
   * @param value - The new value for the filter
   */
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  /**
   * Handles changes to priority category checkboxes
   * Manages the array of selected priority categories for filtering
   * @param category - The category being toggled
   * @param checked - Whether the category is now checked
   */
  const handlePriorityCategoryChange = (category: QuestionnaireCategory, checked: boolean) => {
    setFilters(prev => {
      const currentCategories = prev.priorityCategories || [];
      
      if (checked) {
        // Add category if not already present
        if (!currentCategories.includes(category)) {
          return {
            ...prev,
            priorityCategories: [...currentCategories, category]
          };
        }
      } else {
        // Remove category if present
        return {
          ...prev,
          priorityCategories: currentCategories.filter(cat => cat !== category)
        };
      }
      
      return prev;
    });
  };

  /**
   * Clears all applied filters and resets the form
   * Calls the parent component's clear filters callback
   */
  const handleClearFilters = () => {
    setFilters({});
    onClearFilters();
  };

  /**
   * Checks if any filters are currently applied
   * Used to show/hide the clear filters button
   * @returns boolean - True if any filter has a value
   */
  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof FilterOptions];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    });
  };

  /**
   * Gets the count of active filters for display purposes
   * @returns number - Number of active filters
   */
  const getActiveFilterCount = () => {
    let count = 0;
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof FilterOptions];
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) count++;
        } else {
          count++;
        }
      }
    });
    return count;
  };

  return (
    <div className="listing-filter">
      {/* Filter Toggle Button */}
      <button
        className={`filter-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-icon">tune</span>
        <span>Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="filter-count">{getActiveFilterCount()}</span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter Listings</h3>
            {hasActiveFilters() && (
              <button 
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="filter-sections">
            {/* Price Range */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || undefined)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            {/* Room Configuration */}
            <div className="filter-section">
              <h4>Room Configuration</h4>
              <div className="room-selects">
                <select
                  value={filters.bedrooms || ''}
                  onChange={(e) => updateFilter('bedrooms', parseInt(e.target.value) || undefined)}
                >
                  <option value="">Any bedrooms</option>
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}+ bedroom{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <select
                  value={filters.bathrooms || ''}
                  onChange={(e) => updateFilter('bathrooms', parseInt(e.target.value) || undefined)}
                >
                  <option value="">Any bathrooms</option>
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num}+ bathroom{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="filter-section">
              <h4>Location</h4>
              <div className="location-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.onCampus === true}
                    onChange={(e) => updateFilter('onCampus', e.target.checked ? true : undefined)}
                  />
                  On Campus Only
                </label>
                <div className="distance-input">
                  <label>Max distance from campus (miles):</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    placeholder="Any distance"
                    value={filters.maxDistance || ''}
                    onChange={(e) => updateFilter('maxDistance', parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="filter-section">
              <h4>Amenities</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.pets === true}
                  onChange={(e) => updateFilter('pets', e.target.checked ? true : undefined)}
                />
                Pet-Friendly
              </label>
            </div>

            {/* Compatibility Filters - Only show if user has questionnaire */}
            {showCompatibilityFilters && currentUser?.questionnaire && (
              <>
                <div className="filter-section">
                  <h4>Compatibility</h4>
                  <div className="compatibility-input">
                    <label>Minimum compatibility score:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={filters.minCompatibility || 0}
                      onChange={(e) => updateFilter('minCompatibility', parseInt(e.target.value) || undefined)}
                    />
                    <span>{filters.minCompatibility || 0}%</span>
                  </div>
                </div>

                <div className="filter-section">
                  <h4>Priority Categories</h4>
                  <p className="filter-description">
                    Only show listings that match your preferences in these categories:
                  </p>
                  <div className="priority-checkboxes">
                    {PRIORITY_CATEGORIES.map(({ value, label }) => (
                      <label key={value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.priorityCategories?.includes(value) || false}
                          onChange={(e) => handlePriorityCategoryChange(value, e.target.checked)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 