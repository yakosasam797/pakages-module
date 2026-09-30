import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IconSearch } from "../icons";
import "./UniversalSearch.css";

export type UniversalSearchItem = {
  id: string;
  label: string;
  description: string;
  group: string;
  keywords?: string;
  featured?: boolean;
  onSelect: () => void;
};

export function UniversalSearch({
  items,
  onClose,
}: {
  items: UniversalSearchItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.filter((item) => item.featured).slice(0, 8);

    return items
      .filter((item) =>
        `${item.label} ${item.description} ${item.group} ${item.keywords ?? ""}`
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 20);
  }, [items, query]);

  const openResult = (item: UniversalSearchItem) => {
    item.onSelect();
    onClose();
  };

  const groups = results.reduce<Array<{ name: string; items: UniversalSearchItem[] }>>(
    (all, item) => {
      const existing = all.find((group) => group.name === item.group);
      if (existing) existing.items.push(item);
      else all.push({ name: item.group, items: [item] });
      return all;
    },
    [],
  );

  return createPortal(
    <div
      className="universal-search-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="universal-search"
        role="dialog"
        aria-modal="true"
        aria-label="Universal search"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
          }
          if (!results.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + results.length) % results.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            openResult(results[Math.min(activeIndex, results.length - 1)]);
          }
        }}
      >
        <div className="universal-search__input-row">
          <IconSearch size={18} />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search vendors, pages, or settings"
            aria-label="Universal search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="universal-search-results"
            aria-activedescendant={results[activeIndex] ? `universal-result-${results[activeIndex].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>

        <div id="universal-search-results" className="universal-search__results" role="listbox">
          {results.length ? (
            groups.map((group) => (
              <section key={group.name} className="universal-search__group" aria-label={group.name}>
                <div className="universal-search__group-label">{group.name}</div>
                {group.items.map((item) => {
                  const index = results.indexOf(item);
                  const active = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      id={`universal-result-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`universal-search__result${active ? " is-active" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => openResult(item)}
                    >
                      <span className="universal-search__result-copy">
                        <span className="universal-search__result-label">{item.label}</span>
                        <span className="universal-search__result-description">
                          {item.description}
                        </span>
                      </span>
                      <span className="universal-search__open">Open</span>
                    </button>
                  );
                })}
              </section>
            ))
          ) : (
            <div className="universal-search__empty">
              <strong>No results found</strong>
              <span>Try a vendor name, page, or workspace setting.</span>
            </div>
          )}
        </div>

        <div className="universal-search__footer" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
