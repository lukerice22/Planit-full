import { useState } from "react";
import { BASE_URL } from "../../lib/api";
import pinsvg from '../../assets/suggestion-pin.svg';
import searchIcon from '../../assets/search.svg';
import recentsvg from '../../assets/recent.svg';

const RECENT_KEY = "planit_recent_searches";
const MAX_RECENT = 5;

const SearchBar = ({ onPlaceSelect, inputRef }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);


  const loadRecent = () => {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const saveRecent = (item) => {
    if (!item?.placeId || !item?.description) return;
    const current = loadRecent();
    const next = [item, ...current.filter(i => i.placeId !== item.placeId)];
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, MAX_RECENT)));
  };

  const fetchSuggestions = async (input) => {
    if (!input.trim()) {
      setResults(loadRecent());
      return;
    }
    try {
      const res = await fetch(
        `${BASE_URL}/api/autocomplete?input=${encodeURIComponent(input)}`
      );
      const data = await res.json();
      setResults(data.status === "OK" ? data.predictions : []);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setResults([]);
    }
  };

  const handleSelect = async (id, description) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/autocomplete/place-details?placeId=${id}`
      );
      const data = await res.json();
      if (data.status === "OK") {
        const { lat, lng } = data.result.geometry.location;
        onPlaceSelect({ lat, lng, name: description });
        setQuery(description);
        setResults([]);
        saveRecent({ placeId: id, description });
      } else {
        console.error("Place details failed:", data);
      }
    } catch (err) {
      console.error("Place details fetch error:", err);
    }
  };

  const selectTop = () => {
    if (!results.length) return;
    const first = results[0];
    const id = first.placeId || first.place_id;
    const description = first.description || "";
    handleSelect(id, description);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          className="search-input"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={e => {
            if (e.key === "Enter") selectTop();
          }}
          onFocus={() => {
            setIsFocused(true);
            if (!query.trim()) fetchSuggestions("");
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          placeholder="Search here"
        />
        <img
          src={searchIcon}
          alt="Search"
          className="search-icon-inside"
          onClick={selectTop}
        />
      </div>

      {isFocused && results.length > 0 && (
        <ul className="suggestions-list">
          {results.map(res => {
            const isRecent = !!res.placeId;
            const desc = res.description || "";
            const match = query.trim().toLowerCase();
            const idx = desc.toLowerCase().indexOf(match);
            let before = desc, matched = "", after = "";
            if (idx !== -1 && match) {
              before = desc.slice(0, idx);
              matched = desc.slice(idx, idx + match.length);
              after = desc.slice(idx + match.length);
            }
            const id = isRecent ? res.placeId : res.place_id;
            return (
              <li
                key={id}
                onMouseDown={() => handleSelect(id, desc)}
                className="suggestion-item"
              >
                <img
                  src={isRecent ? recentsvg : pinsvg}
                  alt=""
                  className="pin-suggestion-icon"
                />
                <span>
                  {before}
                  <strong>{matched}</strong>
                  {after}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;