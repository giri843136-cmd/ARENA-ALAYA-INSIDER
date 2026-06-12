"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
  showRecent?: boolean;
}

/**
 * Debounced search bar with autocomplete suggestions and recent searches.
 * Supports keyboard navigation and voice/visual search triggers.
 */
export function SearchBar({
  placeholder = "Search products, articles, brands...",
  onSearch,
  className = "",
  autoFocus = false,
  showRecent = true,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecent) {
      try {
        const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        setRecentSearches(stored.slice(0, 5));
      } catch {}
    }
  }, [showRecent]);

  // Debounced suggestion lookup
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setSuggestions(json.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const saveSearch = useCallback((q: string) => {
    if (!showRecent || !q.trim()) return;
    try {
      const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      const updated = [q, ...stored.filter((s: string) => s !== q)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  }, [showRecent]);

  const executeSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveSearch(trimmed);
    setShowDropdown(false);
    onSearch?.(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [...suggestions, ...(query.length < 2 ? recentSearches : [])];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        executeSearch(items[selectedIndex]);
      } else {
        executeSearch(query);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const showSuggestions = showDropdown && (suggestions.length > 0 || (query.length < 2 && recentSearches.length > 0));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8178]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setSelectedIndex(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-[#26221E] border border-[#E4DDD5] dark:border-[#3D3530] rounded-xl focus:border-[#C5AA8A] focus:ring-1 focus:ring-[#C5AA8A] outline-none transition-colors"
          aria-label="Search"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#26221E] border border-[#E4DDD5] dark:border-[#3D3530] rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] tracking-[2px] text-[#8A8178] uppercase">Suggestions</div>
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => executeSearch(s)}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 transition-colors ${
                    i === selectedIndex ? "bg-[#EFE7DE] dark:bg-[#3D3530]" : "hover:bg-[#F5F0EA] dark:hover:bg-[#333]"
                  }`}
                  role="option"
                  aria-selected={i === selectedIndex}
                >
                  <TrendingUp size={14} className="text-[#8A8178]" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] tracking-[2px] text-[#8A8178] uppercase border-t border-[#E4DDD5] dark:border-[#3D3530]">
                Recent
              </div>
              {recentSearches.map((s, i) => (
                <button
                  key={s}
                  onClick={() => executeSearch(s)}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 transition-colors ${
                    (i + suggestions.length) === selectedIndex ? "bg-[#EFE7DE] dark:bg-[#3D3530]" : "hover:bg-[#F5F0EA] dark:hover:bg-[#333]"
                  }`}
                  role="option"
                  aria-selected={(i + suggestions.length) === selectedIndex}
                >
                  <Clock size={14} className="text-[#8A8178]" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
