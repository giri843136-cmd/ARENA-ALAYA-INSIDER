"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { brands } from "@/lib/data/seed";
import { Search, SlidersHorizontal, ArrowUpDown, X, Globe, Sparkles } from "lucide-react";

type SortKey = "name" | "productCount" | "founded" | "featured";

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const countries = useMemo(() => {
    const set = new Set(brands.map(b => b.country));
    return Array.from(set).sort();
  }, []);

  const featuredBrands = useMemo(() => brands.filter(b => b.featured), []);

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q)
      );
    }

    // Country filter
    if (countryFilter) {
      result = result.filter(b => b.country === countryFilter);
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "productCount":
        result.sort((a, b) => b.productCount - a.productCount);
        break;
      case "founded":
        result.sort((a, b) => b.founded - a.founded);
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [search, countryFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCountryFilter("");
    setSortBy("featured");
  };

  const hasFilters = search || countryFilter || sortBy !== "featured";

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Hero Header */}
      <div className="border-b border-[#E4DDD5] bg-white/80 backdrop-blur-sm">
        <div className="container py-12 md:py-16 px-6 md:px-0">
          <div className="flex items-center gap-2 text-xs tracking-[3px] text-[#6D5C3E] mb-3">
            <Sparkles size={14} />
            THE BRAND VAULT
          </div>
          <h1 className="font-display text-5xl md:text-7xl tracking-[-2.6px] leading-[0.92]">
            Partners in <span className="text-[#C5AA8A]">Craft</span>
          </h1>
          <p className="mt-4 text-base md:text-xl text-[#5C5249] max-w-2xl leading-relaxed">
            We only work with makers we would buy from ourselves. Each brand on this page has been visited, tested, and loved by the Alaya team.
          </p>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8178]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands by name, style, or origin..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#E4DDD5] bg-white text-sm text-[#26221E] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#C5AA8A]/30 focus:border-[#C5AA8A] transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8178] hover:text-[#26221E] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container px-6 md:px-0">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-[#E4DDD5]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-xs font-medium tracking-wider px-4 py-2 rounded-full border transition-all ${
                showFilters || hasFilters
                  ? "bg-[#26221E] text-white border-[#26221E]"
                  : "bg-white text-[#5C5249] border-[#E4DDD5] hover:border-[#6D5C3E]"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasFilters && <span className="ml-1">•</span>}
            </button>

            {/* Country quick filters */}
            {!showFilters && countries.slice(0, 5).map(country => (
              <button
                key={country}
                onClick={() => setCountryFilter(country === countryFilter ? "" : country)}
                className={`text-xs px-4 py-2 rounded-full border transition-all ${
                  countryFilter === country
                    ? "bg-[#6D5C3E] text-white border-[#6D5C3E]"
                    : "bg-white text-[#5C5249] border-[#E4DDD5] hover:border-[#6D5C3E]"
                }`}
              >
                <Globe size={12} className="inline mr-1" />
                {country}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8A8178]">
              {filteredBrands.length} {filteredBrands.length === 1 ? "brand" : "brands"}
            </span>
            <div className="relative">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="text-xs pl-9 pr-8 py-2 rounded-full border border-[#E4DDD5] bg-white text-[#5C5249] appearance-none cursor-pointer focus:outline-none focus:border-[#6D5C3E]"
              >
                <option value="featured">Featured</option>
                <option value="name">Name A–Z</option>
                <option value="productCount">Most Objects</option>
                <option value="founded">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="py-6 border-b border-[#E4DDD5] bg-[#FAF7F4] rounded-b-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] tracking-[2px] text-[#5C5249] font-medium uppercase mr-2">Country:</span>
              <button
                onClick={() => setCountryFilter("")}
                className={`text-xs px-4 py-2 rounded-full border transition-all ${
                  !countryFilter
                    ? "bg-[#26221E] text-white border-[#26221E]"
                    : "bg-white text-[#5C5249] border-[#E4DDD5] hover:border-[#6D5C3E]"
                }`}
              >
                All
              </button>
              {countries.map(country => (
                <button
                  key={country}
                  onClick={() => setCountryFilter(country === countryFilter ? "" : country)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all ${
                    countryFilter === country
                      ? "bg-[#6D5C3E] text-white border-[#6D5C3E]"
                      : "bg-white text-[#5C5249] border-[#E4DDD5] hover:border-[#6D5C3E]"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-xs text-[#6D5C3E] hover:underline flex items-center gap-1"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Featured Brands Row */}
        {!hasFilters && featuredBrands.length > 0 && (
          <div className="py-10">
            <div className="text-[10px] tracking-[2px] text-[#C5AA8A] font-medium uppercase mb-5 flex items-center gap-2">
              <Sparkles size={12} />
              Featured Partners
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex-shrink-0 w-[200px] rounded-2xl border border-[#E4DDD5] bg-white p-6 hover:border-[#6D5C3E] hover:shadow-lg transition-all"
                >
                  <div className="h-12 w-12 rounded-full bg-[#F1EDE6] overflow-hidden relative mb-3">
                    <Image src={brand.logo} alt={brand.name} width={48} height={48} className="h-full w-full object-cover" />
                  </div>
                  <div className="font-display text-lg tracking-tight group-hover:text-[#6D5C3E] transition-colors">{brand.name}</div>
                  <div className="text-[10px] text-[#5C5249] tracking-widest mt-1">{brand.country}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredBrands.length === 0 && (
          <div className="py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-[#EFE7DE] flex items-center justify-center mx-auto mb-6">
              <Search size={24} className="text-[#8A8178]" />
            </div>
            <h3 className="font-display text-2xl tracking-tight text-[#26221E] mb-2">No brands found</h3>
            <p className="text-[#5C5249] text-sm max-w-md mx-auto mb-6">
              {search
                ? `We couldn't find any brands matching "${search}". Try a different search term.`
                : "No brands match your current filters. Try adjusting or clearing them."}
            </p>
            <button
              onClick={clearFilters}
              className="text-sm px-6 py-2.5 rounded-full bg-[#26221E] text-white hover:bg-[#3D3530] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Brands Grid */}
      {filteredBrands.length > 0 && (
        <div className="container pb-20 px-6 md:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mt-8">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group block rounded-3xl border border-[#E8E2D9] bg-white p-8 hover:border-[#6D5C3E] hover:shadow-lg transition-all duration-300 active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#F1EDE6] flex-shrink-0 overflow-hidden relative ring-1 ring-[#E4DDD5] group-hover:ring-[#6D5C3E] transition-all">
                    <Image src={brand.logo} alt={brand.name} width={56} height={56} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-2xl md:text-3xl tracking-tight group-hover:text-[#6D5C3E] transition-colors truncate">
                      {brand.name}
                    </div>
                    <div className="text-[11px] text-[#5C5249] tracking-widest flex items-center gap-1.5">
                      <Globe size={10} />
                      {brand.country} • FOUNDED {brand.founded}
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-[#5C5249] text-[15px] leading-relaxed line-clamp-2">{brand.tagline}</p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-[#6D5C3E] tracking-widest flex items-center gap-2">
                    {brand.productCount} OBJECTS
                    <span className="text-base leading-none group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                  {brand.featured && (
                    <span className="text-[9px] tracking-[2px] uppercase bg-[#C5AA8A]/10 text-[#6D5C3E] px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Values tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {brand.values.slice(0, 3).map((v, i) => (
                    <span key={i} className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-[#F1EDE6] text-[#5C5249]">
                      {v}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom editorial note */}
      <div className="border-t border-[#E4DDD5] bg-[#FAF7F4] py-10">
        <div className="container text-center text-xs text-[#8A8178] max-w-lg mx-auto px-6">
          Every brand featured on ALAYA INSIDER has been personally vetted by our editorial team. We only partner with makers whose work we would buy for ourselves.{" "}
          <Link href="/how-we-test" className="text-[#6D5C3E] hover:underline">Learn about our vetting process →</Link>
        </div>
      </div>
    </div>
  );
}
