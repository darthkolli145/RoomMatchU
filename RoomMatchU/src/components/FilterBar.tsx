import { useState } from 'react';

type FilterValues = {
  onCampus: string;
  houseType: string;
  neighborhood: string;
  priceMin: string;
  priceMax: string;
  rooms: string;
  utilities: string;
  rentPeriod: string;
  pets: string;
};

type FilterBarProps = {
  onFilterChange: (filters: FilterValues) => void;
};

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    onCampus: '',
    houseType: '',
    neighborhood: '',
    priceMin: '',
    priceMax: '',
    rooms: '',
    utilities: '',
    rentPeriod: '',
    pets: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="filter-bar">
      <h3>Filters:</h3>
      
      <div className="filter-group">
        <label>On or Off Campus:</label>
        <select 
          name="onCampus" 
          value={filters.onCampus}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="on">On Campus</option>
          <option value="off">Off Campus</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>House Type:</label>
        <select 
          name="houseType" 
          value={filters.houseType}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="duplex">Duplex</option>
          <option value="studio">Studio</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Neighborhoods:</label>
        <select 
          name="neighborhood" 
          value={filters.neighborhood}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="westside">Westside</option>
          <option value="eastside">Eastside</option>
          <option value="downtown">Downtown</option>
          <option value="midtown">Midtown</option>
          <option value="seabright">Seabright</option>
          <option value="scotts-valley">Scotts Valley</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Price:</label>
        <div className="price-inputs">
          <input 
            type="number" 
            name="priceMin" 
            placeholder="min" 
            value={filters.priceMin}
            onChange={(e) => {
              const updatedFilters = { ...filters, priceMin: e.target.value };
              setFilters(updatedFilters);
              onFilterChange(updatedFilters);
            }}
          />
          <span>-</span>
          <input 
            type="number" 
            name="priceMax" 
            placeholder="max" 
            value={filters.priceMax}
            onChange={(e) => {
              const updatedFilters = { ...filters, priceMax: e.target.value };
              setFilters(updatedFilters);
              onFilterChange(updatedFilters);
            }}
          />
        </div>
      </div>
      
      <div className="filter-group">
        <label>Rooms:</label>
        <select 
          name="rooms" 
          value={filters.rooms}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Utilities Included:</label>
        <select 
          name="utilities" 
          value={filters.utilities}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Rent Period:</label>
        <select 
          name="rentPeriod" 
          value={filters.rentPeriod}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="short">Short-term</option>
          <option value="long">Long-term</option>
          <option value="academic">Academic Year</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Pets:</label>
        <select 
          name="pets" 
          value={filters.pets}
          onChange={handleFilterChange}
        >
          <option value="">Any</option>
          <option value="yes">Allowed</option>
          <option value="no">Not Allowed</option>
        </select>
      </div>
    </div>
  );
} 