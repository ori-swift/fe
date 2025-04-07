import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment-timezone';
import { updateClientSettings } from '../../../api/general_be_api';

const TimezoneSelector = ({
  selectedTimezone,
  onTimezoneChange,
  clientTimezone,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const timezones = moment.tz.names().filter(tz =>
    ["Asia", "Europe", "America", "Africa"].some(zone => tz.startsWith(zone))
  );

  useEffect(() => {
    // Filter timezones based on search term
    if (search) {
      setFilteredTimezones(
        timezones.filter(tz =>
          tz.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredTimezones(timezones);
    }
  }, [search]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (timezone) => {
    onTimezoneChange(timezone);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="timezone-selector-container" ref={dropdownRef}>
      <div
        className="timezone-selector-display"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="timezone-selector-value">
          {selectedTimezone || 'בחר אזור זמן'}
        </span>
        <span className="timezone-selector-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="timezone-selector-dropdown">
          <div className="timezone-selector-search">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש מדינה/עיר..."
              className="timezone-selector-search-input"
            />
          </div>

          <div className="timezone-selector-options">
            {filteredTimezones.length > 0 ? (
              filteredTimezones.map((tz, idx) => (
                <div
                  key={idx}
                  className={`timezone-selector-option ${tz === selectedTimezone ? 'selected' : ''}`}
                  onClick={() => handleSelect(tz)}
                >
                  {tz}
                </div>
              ))
            ) : (
              <div className="timezone-selector-no-results">לא נמצאו תוצאות</div>
            )}
          </div>
        </div>
      )}

      {selectedTimezone !== clientTimezone && (
        <button
          className="client-page-update-button timezone-selector-save-btn"
          onClick={async () => {
            await onSave()
          }}

        >
          שמור
        </button>
      )}
    </div>
  );
};

export default TimezoneSelector;