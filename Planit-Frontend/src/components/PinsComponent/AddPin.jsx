import React, { useRef, useState, useEffect } from 'react';

/**
 * AddPin component. Triggers pin placement modes.
 * Firestore saving is handled in Map.jsx (addPinToMap), so no Firestore logic here.
 */
const AddPin = ({ onSelectMode }) => {
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const toggleDropdown = () => {
    setShowOptions((prev) => !prev);
  };

  return (
    <div className="add-pin-container" ref={dropdownRef}>
      <button className="add-pin-button" onClick={toggleDropdown}>
        +
      </button>
      {showOptions && (
        <div className="pin-options-dropdown">
          <button
            onClick={() => {
              onSelectMode('search');
              setShowOptions(false);
            }}
          >
            Add Pin by Search
          </button>
          <button
            onClick={() => {
              onSelectMode('manual');
              setShowOptions(false);
            }}
          >
            Add Pin Manually
          </button>
        </div>
      )}
    </div>
  );
};

export default AddPin;
