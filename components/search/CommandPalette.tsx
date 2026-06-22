"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search, ArrowRight, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { allProducts, articles, brands, universes } from "@/lib/data/seed";
import type { SearchResult } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Fuse-style simple search across everything
  const results: SearchResult[] = React.useMemo(() => {
    if (!search.trim()) return [];

    const q = search.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Products
    allProducts.slice(0, 40).forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q)) {
        results.push({
          type: "product",
          id: p.id,
          title: p.name,
          subtitle: p.brandName,
          image: p.images[0],
          url: `/products/${p.slug}`,
        });
      }
    });

    // Articles
    articles.slice(0, 20).forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)) {
        results.push({
          type: "article",
          id: a.id,
          title: a.title,
          subtitle: a.authorName,
          image: a.coverImage,
          url: `/journal/${a.slug}`,
        });
      }
    });

    // Brands
    brands.slice(0, 15).forEach((b) => {
      if (b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q)) {
        results.push({
          type: "brand",
          id: b.id,
          title: b.name,
          subtitle: b.tagline,
          image: b.logo,
          url: `/brands/${b.slug}`,
        });
      }
    });

    // Universes
    universes.forEach((u) => {
      if (u.title.toLowerCase().includes(q) || u.subtitle.toLowerCase().includes(q)) {
        results.push({
          type: "universe",
          id: u.id,
          title: u.title,
          subtitle: u.subtitle,
          image: u.heroImage,
          url: `/universes/${u.slug}`,
        });
      }
    });

    return results.slice(0, 12);
  }, [search]);

  const popularSearches = [
    "linen bedding", "cast iron skillet", "cashmere sweater", "silk sleep mask", "ceramic vase"
  ];

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setSearch("");
    router.push(url);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="command-overlay" onClick={() => onOpenChange(false)}>
      <div 
        className="command-dialog w-[calc(100%-2rem)] max-w-[640px] mx-4 md:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="bg-white rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden" shouldFilter={false}>
          <div className="flex items-center gap-3 border-b border-[#E8E2D9] px-5 py-4">
            <Search className="h-4 w-4 text-[#8A8178]" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search universes, products, articles, brands..."
              className="flex-1 bg-transparent text-[17px] placeholder:text-[#8A8178] outline-none font-light tracking-[-0.2px]"
              autoFocus
            />
            <kbd className="hidden sm:block text-[10px] font-mono bg-[#F1EDE6] px-2 py-px rounded text-[#8A8178]">ESC</kbd>
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            {!search && (
              <>
                <div className="px-4 pt-3 pb-1 text-[10px] tracking-[1.5px] text-[#8A8178] font-medium">TRENDING SEARCHES</div>
                {popularSearches.map((term, idx) => (
                  <Command.Item
                    key={idx}
                    onSelect={() => {
                      setSearch(term);
                    }}
                    className="flex items-center gap-3 px-4 py-[13px] rounded-2xl cursor-pointer hover:bg-[#F8F5F0] text-sm"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-[#C5A26F]" />
                    {term}
                  </Command.Item>
                ))}
              </>
            )}

            {results.length > 0 && (
              <div className="px-2">
                {results.map((result) => (
                  <Command.Item
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer hover:bg-[#F8F5F0] group"
                  >
                    {result.image && (
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#F1EDE6] flex-shrink-0">
                        <img src={result.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#2C2522] group-hover:text-[#C5A26F] transition-colors">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-[#8A8178] truncate">{result.subtitle}</div>
                      )}
                    </div>
                    <div className="text-[10px] uppercase tracking-[1.5px] text-[#8A8178] font-medium">{result.type}</div>
                    <ArrowRight className="h-4 w-4 text-[#C5A26F] opacity-0 group-hover:opacity-100 transition-all" />
                  </Command.Item>
                ))}
              </div>
            )}

            {search && results.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[#8A8178]">No results for “{search}”</p>
                <p className="text-xs mt-1 text-[#C5A26F]">Try a broader search or browse universes</p>
              </div>
            )}
          </Command.List>

          <div className="border-t border-[#E8E2D9] px-5 py-3 text-[10px] text-[#8A8178] flex items-center justify-between">
            <div>Tip: Use ↑↓ to navigate • ↵ to select</div>
            <div className="hidden sm:block">Semantic search powered by Alaya</div>
          </div>
        </Command>
      </div>
    </div>
  );
}
