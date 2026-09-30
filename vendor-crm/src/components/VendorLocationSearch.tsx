import { useEffect, useRef, useState } from "react";
import type { LocationSuggestion } from "../data/locationSuggestions";
import { IconPin } from "../icons";

export function VendorLocationSearch({
  perspective,
  query,
  selected,
  suggestions,
  onQueryChange,
  onSelect,
}: {
  perspective: "vendors" | "services";
  query: string;
  selected: LocationSuggestion | null;
  suggestions: LocationSuggestion[];
  onQueryChange: (query: string) => void;
  onSelect: (place: LocationSuggestion | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const showSuggestions = open && Boolean(query.trim()) && !selected;

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  const selectPlace = (place: LocationSuggestion) => {
    onSelect(place);
    setOpen(false);
    setActiveIndex(0);
  };

  return <div className="vendors-page__location-search" ref={rootRef}>
    <div className="vendors-page__location">
      <span className="vendors-page__location-icon" aria-hidden="true"><IconPin size={16} /></span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Search location"
        aria-label={`Search ${perspective} by location`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls="vendor-location-suggestions"
        aria-activedescendant={showSuggestions && suggestions.length ? `vendor-location-suggestion-${activeIndex}` : undefined}
        onFocus={() => { if (query.trim() && !selected) setOpen(true); }}
        onChange={(event) => { onQueryChange(event.target.value); setActiveIndex(0); setOpen(Boolean(event.target.value.trim())); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { setOpen(false); return; }
          if (!showSuggestions || !suggestions.length) return;
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length); }
          if (event.key === "Enter") { event.preventDefault(); selectPlace(suggestions[activeIndex] || suggestions[0]); }
        }}
      />
      {query ? <button type="button" className="vendors-page__location-clear" aria-label="Clear location" onClick={() => { onSelect(null); setOpen(false); inputRef.current?.focus(); }}>×</button> : null}
    </div>
    {showSuggestions ? <div id="vendor-location-suggestions" className="vendors-page__location-suggestions" role="listbox" aria-label="Location suggestions">
      <div className="vendors-page__location-heading">Suggested places</div>
      {suggestions.length ? suggestions.map((place, index) => <button
        id={`vendor-location-suggestion-${index}`}
        key={place.id}
        type="button"
        role="option"
        aria-selected={activeIndex === index}
        className={activeIndex === index ? "is-active" : undefined}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => selectPlace(place)}
      >
        <span className="vendors-page__location-photo">{place.image ? <img src={place.image} alt="" /> : <IconPin size={18} />}</span>
        <span className="vendors-page__location-label"><strong>{place.name}</strong><small>{place.detail}</small></span>
      </button>) : <div className="vendors-page__location-empty">No matching place found.</div>}
    </div> : null}
  </div>;
}
