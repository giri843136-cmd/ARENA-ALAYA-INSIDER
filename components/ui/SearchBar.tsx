"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock, TrendingUp, Package } from "lucide-react";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AutocompleteProduct {
  slug: string;
  name: string;
  brandName: string;
  price: number;
  image: string;
}

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
  const [productResults, setProductResults] = useState<AutocompleteProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]").slice(0, 5);
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced suggestion + product lookup
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (query.length < 2) {
      setSuggestions([]);
      setProductResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [suggestRes, productRes] = await Promise.all([
          fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`),
          fetch(`/api/v1/products?q=${encodeURIComponent(query)}&limit=4`),
        ]);
        const suggestJson = await suggestRes.json();
        setSuggestions(suggestJson.suggestions || []);

        try {
          const productJson = await productRes.json();
          const products = productJson.success
            ? (Array.isArray(productJson.data) ? productJson.data : productJson.data?.products || productJson.data?.items || [])
              .slice(0, 4)
              .map((p: any) => ({
                slug: p.slug,
                name: p.name,
                brandName: p.brandName,
                price: p.price,
                image: Array.isArray(p.images) ? p.images[0] : p.image || "",
              }))
            : [];
          setProductResults(products);
        } catch {
          setProductResults([]);
        }
      } catch {
        setSuggestions([]);
        setProductResults([]);
      }
    /* eslint-enable react-hooks/set-state-in-effect */
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
    const textItems = [...suggestions, ...(query.length < 2 ? recentSearches : [])];
    const totalItems = textItems.length + productResults.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < textItems.length) {
        executeSearch(textItems[selectedIndex]);
      } else if (selectedIndex >= textItems.length) {
        const productIdx = selectedIndex - textItems.length;
        const product = productResults[productIdx];
        if (product) {
          setShowDropdown(false);
          router.push(`/products/${product.slug}`);
        }
      } else {
        executeSearch(query);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const hasSuggestions = suggestions.length > 0;
  const hasProducts = productResults.length > 0;
  const hasRecent = query.length < 2 && recentSearches.length > 0;
  const showSuggestions = showDropdown && (hasSuggestions || hasProducts || hasRecent);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C5249]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setSelectedIndex(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-[#26221E] border border-[#E4DDD5] dark:border-[#3D3530] rounded-xl focus:border-[#7A6848] focus:ring-1 focus:ring-[#7A6848] outline-none transition-colors"
          aria-label="Search"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-controls={showSuggestions ? "search-autocomplete-results" : undefined}
          role="combobox"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); setProductResults([]); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showSuggestions && (
        <div id="search-autocomplete-results" className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#26221E] border border-[#E4DDD5] dark:border-[#3D3530] rounded-xl shadow-lg z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
          {/* Products (inline cards) */}
          {hasProducts && (
            <div>
              <div className="px-4 py-2 text-[10px] tracking-[2px] text-[#5C5249] uppercase border-b border-[#E4DDD5] dark:border-[#3D3530] flex items-center gap-1.5">
                <Package size={10} /> Products
              </div>
              {productResults.map((p, i) => {
                const globalIdx = suggestions.length + (query.length < 2 ? recentSearches.length : 0) + i;
                return (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      globalIdx === selectedIndex ? "bg-[#EFE7DE] dark:bg-[#3D3530]" : "hover:bg-[#F5F0EA] dark:hover:bg-[#333]"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#EFE7DE] overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#26221E] dark:text-[#EDE6DC] truncate">{p.name}</div>
                      <div className="text-xs text-[#5C5249]">{p.brandName} • <PriceDisplay usdAmount={p.price} /></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {hasSuggestions && (
            <div>
              <div className="px-4 py-2 text-[10px] tracking-[2px] text-[#5C5249] uppercase">Suggestions</div>
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
                  <TrendingUp size={14} className="text-[#5C5249]" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {hasRecent && (
            <div>
              <div className="px-4 py-2 text-[10px] tracking-[2px] text-[#5C5249] uppercase border-t border-[#E4DDD5] dark:border-[#3D3530]">
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
                  <Clock size={14} className="text-[#5C5249]" />
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
