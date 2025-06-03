import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  required?: boolean;
}

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter address",
  required = false 
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the autocomplete to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for addresses using Nominatim API
  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          countrycodes: 'us', // Limit to US addresses
          limit: 5,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'RoomMatchU/1.0' // Required by Nominatim usage policy
        }
      });

      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300); // Wait 300ms after user stops typing
  };

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    onChange(suggestion.display_name, lat, lng);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%' }}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginTop: '2px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {isLoading ? (
            <div style={{ padding: '10px', color: '#666' }}>Searching...</div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                  color: '#333'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {suggestion.display_name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 