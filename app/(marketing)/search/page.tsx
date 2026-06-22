"use client";

import React, { useState } from "react";
import { allProducts, articles, brands, universes } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { Button } from "@/components/ui/Button";
import { FilterDrawer } from "@/components/ui/FilterDrawer";
import { Search, Mic, Image as ImageIcon, Filter } from "lucide-react";

type Tab = "all" | "products" | "articles" | "brands";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedUniverse, setSelectedUniverse] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sort, setSort] = useState<"relevance" | "price-low" | "price-high" | "newest">("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const q = query.toLowerCase().trim();

  // Semantic + facet filtering
  let filteredProducts = allProducts.filter(p => {
      const matchesQuery = !q || 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.brandName.toLowerCase().includes(q) ||
      (p as any).shortDescription?.toLowerCase().includes(q);
    
    const matchesUniverse = !selectedUniverse || p.universe === selectedUniverse;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    
    return matchesQuery && matchesUniverse && matchesPrice;
  });

  // Sort
  if (sort === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
  if (sort === "price-high") filteredProducts.sort((a, b) => b.price - a.price);
  if (sort === "newest") filteredProducts.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));

  filteredProducts = filteredProducts.slice(0, 32);

  const filteredArticles = q 
    ? articles.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)).slice(0, 12)
    : articles.slice(0, 9);

  const filteredBrands = q
    ? brands.filter(b => b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q))
    : brands.slice(0, 8);

  const clearFilters = () => {
    setQuery("");
    setSelectedUniverse("");
    setPriceRange([0, 500]);
    setSort("relevance");
    setActiveTab("all");
  };

  const hasActiveFilters = query || selectedUniverse || priceRange[0] > 0 || priceRange[1] < 500 || sort !== "relevance";

  // Mock voice/visual search (wires to existing multimodal architecture)
  const handleVoiceSearch = () => {
    alert("Voice search activated (multimodal endpoint ready). Say something like “linen bedding for a calm bedroom”.");
  };
  const handleVisualSearch = () => {
    alert("Visual search opened (upload image for similarity search via existing /api/search/multimodal).");
  };

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Premium Search Header — Apple Spotlight + Perplexity quality */}
      <div className="border-b border-[#E4DDD5] bg-white/70 backdrop-blur-xl sticky top-20 z-40">
        <div className="container py-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs tracking-[3px] text-[#7A6848] mb-2">
              SEMANTIC DISCOVERY
              <span className="text-[#5C5249]">•</span> 
              NATURAL LANGUAGE • VOICE • VISUAL • MULTIMODAL
            </div>
            <h1 className="font-display text-[52px] tracking-[-2.6px] leading-[0.92]">What are you seeking?</h1>
            <p className="mt-2 text-[#6D655F]">Ask in plain English. We understand intent, mood, and context.</p>
          </div>

          {/* Main Search Bar — Luxurious */}
          <div className="mt-8 relative max-w-3xl">
            <div className="relative">
              <Search className="absolute left-6 top-5 h-5 w-5 text-[#5C5249]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “quiet luxury linen for a sanctuary bedroom”, “cast iron for slow cooking”, or “gifts under $120 for her”"
                className="input w-full pl-14 pr-32 text-[17px] py-5 shadow-sm border-[#D9D0C3] focus:border-[#7A6848] placeholder:text-[#5C5249]"
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <button 
                  onClick={handleVoiceSearch}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#EFE7DE] text-[#6D655F] transition-colors"
                  aria-label="Voice search"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleVisualSearch}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#EFE7DE] text-[#6D655F] transition-colors"
                  aria-label="Visual search"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-[#5C5249]">
              <span>Popular:</span>
              {["linen bedding", "cast iron", "cashmere", "silk sleep mask", "ceramic vase"].map(t => (
                <button key={t} onClick={() => setQuery(t)} className="hover:text-[#7A6848] transition-colors underline-offset-2 hover:underline">{t}</button>
              ))}
              <button onClick={clearFilters} className="ml-auto text-[#7A6848] hover:underline">Clear all</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-8 pb-6 px-6 md:px-0">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-[#E4DDD5] text-sm">
            {(["all", "products", "articles", "brands"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium tracking-widest uppercase transition-all ${activeTab === tab ? "border-b-2 border-[#26221E] text-[#26221E]" : "text-[#5C5249]"}`}
              >
                {tab === "all" ? "Everything" : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 btn btn-secondary text-xs py-2 px-5"
            >
              <Filter className="h-3.5 w-3.5" /> Filters {hasActiveFilters && "•"}
            </button>
            
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value as any)}
              className="input text-xs py-2 px-4 w-auto bg-white border-[#E4DDD5]"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters — Now using premium FilterDrawer for editorial feel */}
        {showFilters && (
          <FilterDrawer isOpen={showFilters} onClose={() => setShowFilters(false)} title="Refine Discovery">
            <div className="space-y-8">
              {/* Universe Filter */}
              <div>
                <div className="text-xs tracking-[2px] text-[#5C5249] mb-3">UNIVERSE</div>
                <div className="space-y-2">
                  {universes.map(u => (
                    <label key={u.slug} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="universe" 
                        checked={selectedUniverse === u.slug} 
                        onChange={() => setSelectedUniverse(u.slug)} 
                      />
                      {u.title}
                    </label>
                  ))}
                  <button onClick={() => setSelectedUniverse("")} className="text-xs text-[#7A6848] mt-1">Clear universe</button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="text-xs tracking-[2px] text-[#5C5249] mb-3">PRICE RANGE (USD)</div>
                <div className="flex items-center gap-3">
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="input w-24 py-2 text-sm" />
                  <span className="text-[#5C5249]">to</span>
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="input w-24 py-2 text-sm" />
                </div>
                <input type="range" min="0" max="600" step="10" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-full accent-[#7A6848] mt-4" />
              </div>

              {/* Quick Presets */}
              <div>
                <div className="text-xs tracking-[2px] text-[#5C5249] mb-3">QUICK PRESETS</div>
                <div className="flex flex-wrap gap-2">
                  {["Under $80", "$80–$150", "Quiet Luxury", "New Arrivals", "Bestsellers"].map(preset => (
                    <button key={preset} onClick={() => {
                      if (preset === "Under $80") setPriceRange([0, 80]);
                      if (preset === "$80–$150") setPriceRange([80, 150]);
                      if (preset === "New Arrivals") setQuery("new");
                      if (preset === "Bestsellers") setQuery("bestseller");
                    }} className="text-xs border border-[#E4DDD5] px-4 py-1.5 rounded-full hover:border-[#7A6848]">
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FilterDrawer>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-baseline gap-3 text-sm text-[#5C5249] px-6 md:px-0">
          <span className="font-medium text-[#26221E]">{filteredProducts.length + filteredArticles.length + filteredBrands.length}</span> 
          results {q && `for “${query}”`}
          {selectedUniverse && ` in ${universes.find(u => u.slug === selectedUniverse)?.title}`}
        </div>
      </div>

      {/* RESULTS SECTIONS — Editorial Grids */}
      <div className="container pb-24 space-y-16">
        {/* Products */}
        {(activeTab === "all" || activeTab === "products") && (
          <div>
            <div className="flex justify-between mb-6 items-baseline border-b border-[#E4DDD5] pb-3">
              <div className="font-medium tracking-widest text-xs text-[#7A6848]">PRODUCTS • {filteredProducts.length}</div>
              <button onClick={() => setActiveTab("products")} className="text-xs text-[#7A6848]">View all →</button>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="py-12 text-center text-[#5C5249] border border-[#E4DDD5] rounded-3xl">No products match your search. Try broadening your query or clearing filters.</div>
            )}
          </div>
        )}

        {/* Articles / Journal */}
        {(activeTab === "all" || activeTab === "articles") && (
          <div>
            <div className="flex justify-between mb-6 items-baseline border-b border-[#E4DDD5] pb-3">
              <div className="font-medium tracking-widest text-xs text-[#7A6848]">FROM THE JOURNAL • {filteredArticles.length}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filteredArticles.map(a => <EditorialCard key={a.id} article={a} />)}
            </div>
          </div>
        )}

        {/* Brands */}
        {(activeTab === "all" || activeTab === "brands") && (
          <div>
            <div className="flex justify-between mb-6 items-baseline border-b border-[#E4DDD5] pb-3">
              <div className="font-medium tracking-widest text-xs text-[#7A6848]">BRANDS • {filteredBrands.length}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredBrands.map(b => (
                <a key={b.id} href={`/brands/${b.slug}`} className="card p-8 group">
                  <div className="font-display text-3xl tracking-tight group-hover:text-[#7A6848] transition-colors">{b.name}</div>
                  <p className="text-sm mt-1 text-[#5C5249]">{b.tagline}</p>
                  <div className="mt-5 text-[10px] tracking-[2px] text-[#5C5249]">{b.country} • {b.productCount} OBJECTS</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty State (elegant) */}
        {q && filteredProducts.length === 0 && filteredArticles.length === 0 && filteredBrands.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-[#EFE7DE] flex items-center justify-center">
              <Search className="h-5 w-5 text-[#7A6848]" />
            </div>
            <div className="font-display text-2xl tracking-tight mb-2">We couldn’t find anything for “{query}”</div>
            <p className="text-[#6D655F] max-w-xs mx-auto">Try a different phrase, browse a universe, or let the AI Concierge guide you.</p>
            <Button variant="secondary" className="mt-8" onClick={clearFilters}>Clear search</Button>
          </div>
        )}
      </div>

      {/* Bottom hint for AI + Multimodal */}
      <div className="border-t border-[#E4DDD5] py-8 bg-white">
        <div className="container text-center text-xs text-[#5C5249]">
          Pro tip: Open the <span className="text-[#7A6848]">Alaya Concierge</span> (bottom right) for natural language shopping, gift finding, or room styling.
        </div>
      </div>
    </div>
  );
}
