import { useState } from 'react';
import { QuestionnaireCategory } from '../types/index';

type FilterProps = {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  minCompatibilityLimit?: number; // Add this prop (optional)
};

export type FilterOptions = {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  onCampus?: boolean;
  maxDistance?: number;
  minCompatibility?: number;
  pets?: boolean;
  priorityCategories?: QuestionnaireCategory[];
};

export default function ListingFilter({ onFilterChange, initialFilters = {}, minCompatibilityLimit = 0 }: FilterProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const minScore = minCompatibilityLimit;
  const currentScore = filters.minCompatibility ?? minScore;


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    
    // Convert string values to appropriate types
    if (type === 'number') {
      newValue = value ? Number(value) : undefined;
    } else if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    setFilters(prev => {
      const newFilters = { ...prev, [name]: newValue };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const category = value as QuestionnaireCategory;
    
    setFilters(prev => {
      let priorityCategories = [...(prev.priorityCategories || [])];
      
      if (checked) {
        priorityCategories.push(category);
      } else {
        priorityCategories = priorityCategories.filter(c => c !== category);
      }
      
      const newFilters = { ...prev, priorityCategories };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleReset = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="listing-filter">
      <h2 className="filter-heading">Filter Listings</h2>
      
      <div className="filter-group">
        <h3>Price Range</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="minPrice">Min $</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="maxPrice">Max $</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        </div>
      </div>
      
      <div className="filter-group">
        <h3>Room Configuration</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="bedrooms">Bedrooms</label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="bathrooms">Bathrooms</label>
            <select
              id="bathrooms"
              name="bathrooms"
              value={filters.bathrooms || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="1.5">1.5+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="filter-group">
        <h3>Location</h3>
        <div className="mb-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="onCampus"
              checked={filters.onCampus || false}
              onChange={handleInputChange}
              className="mr-2"
            />
            On Campus
          </label>
        </div>
      </div>
      
      <div className="filter-group">
        <h3>Distance</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="maxDistance">Max Distance (miles)</label>
            <input
              type="number"
              id="maxDistance"
              name="maxDistance"
              placeholder="e.g. 5"
              min="0"
              value={filters.maxDistance || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            {filters.maxDistance && (
              <p className="text-sm text-gray-600 mt-1">
                {initialFilters?.maxDistance === filters.maxDistance 
                  ? "Using your preferred distance from questionnaire"
                  : "Filtering by distance"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="filter-group">
        <h3>Pets</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="pets"
            checked={filters.pets || false}
            onChange={handleInputChange}
            className="mr-2"
          />
          Pet Friendly
        </label>
      </div>
      
      <div className="filter-group">
        <h3>Compatibility</h3>
        <label htmlFor="minCompatibility">Minimum Compatibility Score</label>
        <p className="text-sm text-gray-600 mb-2">
          Set to 0 to see all listings sorted by compatibility. Higher values will filter out listings below that score.
        </p>
        <div className="flex items-center">
          <input
            type="range"
            id="minCompatibility"
            name="minCompatibility"
            min={minScore}
            max={100}
            step={10}
            value={currentScore}
            onChange={handleInputChange}
            className="w-full"
          />
          <span className="ml-2">{currentScore}%</span>
        </div>
      </div>
      
      <div className="filter-group">
        <h3>Priority Categories</h3>
        <p className="text-sm text-gray-600 mb-2">Only show listings that match these categories from your questionnaire</p>
        
        <div className="space-y-1">
          <label className="flex items-center">
            <input
              type="checkbox"
              value="sleepSchedule"
              checked={filters.priorityCategories?.includes('sleepSchedule') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Sleep Schedule
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="cleanliness"
              checked={filters.priorityCategories?.includes('cleanliness') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Cleanliness
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="noiseLevel"
              checked={filters.priorityCategories?.includes('noiseLevel') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Noise Level
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="visitors"
              checked={filters.priorityCategories?.includes('visitors') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Visitors Policy
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="pets"
              checked={filters.priorityCategories?.includes('pets') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Pet Preferences
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="lifestyle"
              checked={filters.priorityCategories?.includes('lifestyle') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Lifestyle
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="studyHabits"
              checked={filters.priorityCategories?.includes('studyHabits') || false}
              onChange={handlePriorityChange}
              className="mr-2"
            />
            Study Habits
          </label>
        </div>
      </div>
      
      <button
        onClick={handleReset}
        className="reset-filters-btn w-full p-2 bg-gray-200 rounded mt-4 hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </div>
  );
} 