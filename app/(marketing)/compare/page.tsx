"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, X, Star, ShoppingBag, Share2, Check } from "lucide-react";
import { allProducts } from "@/lib/data/seed";
import type { Product } from "@/lib/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

const COMPARISON_FEATURES = [
  { key: "price", label: "Price", render: (p: Product) => <PriceDisplay usdAmount={p.price} className="font-medium tabular-nums text-[#26221E]" /> },
  { key: "description", label: "Description", render: (p: Product) => <span className="text-xs text-[#5C5249] line-clamp-3">{p.description}</span> },
  { key: "rating", label: "Rating", render: (p: Product) => <div className="flex items-center gap-1"><Star size={14} className="text-[#6D5C3E]" /> {p.rating} ({p.reviewCount})</div> },
  { key: "category", label: "Category", render: (p: Product) => <span className="text-sm">{p.category}</span> },
  { key: "brandName", label: "Brand", render: (p: Product) => <span className="text-sm font-medium">{p.brandName}</span> },
  { key: "inStock", label: "In Stock", render: (p: Product) => <span className={p.inStock ? "text-green-600 text-sm" : "text-rose-500 text-sm"}>{p.inStock ? "✓ Yes" : "✗ Limited"}</span> },
  { key: "bestseller", label: "Bestseller", render: (p: Product) => <span className={p.bestseller ? "text-[#6D5C3E]" : "text-[#8A8178]"}>{p.bestseller ? "★ Bestseller" : "—"}</span> },
  { key: "perfectFor", label: "Perfect For", render: (p: Product) => <div className="flex flex-wrap gap-1">{p.perfectFor.slice(0, 3).map((pf, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE7DE] text-[#5C5249]">{pf}</span>)}</div> },
  { key: "pros", label: "Pros", render: (p: Product) => <ul className="text-xs space-y-1">{p.pros.slice(0, 3).map((pro, i) => <li key={i} className="flex gap-1">✓ {pro}</li>)}</ul> },
  { key: "cons", label: "Cons", render: (p: Product) => <ul className="text-xs space-y-1">{p.cons.slice(0, 2).map((con, i) => <li key={i} className="flex gap-1">• {con}</li>)}</ul> },
];

export default function ComparePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Read slugs from URL ?slugs= param on initial mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (initialized) return;
    const params = new URLSearchParams(window.location.search);
    const slugsParam = params.get("slugs");
    const addParam = params.get("add");

    let slugs: string[] = [];

    if (slugsParam) {
      slugs = slugsParam
        .split(",")
        .filter((s) => s && allProducts.find((p) => p.slug === s))
        .slice(0, 4);
    }

    if (addParam && allProducts.find((p) => p.slug === addParam) && !slugs.includes(addParam)) {
      slugs.push(addParam);
    }

    if (slugs.length > 0) {
      setSelectedSlugs(slugs);
    }
    setInitialized(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initialized]);

  // Sync URL query params whenever selectedSlugs changes (after initial hydration)
  useEffect(() => {
    if (!initialized) return;
    const url = new URL(window.location.href);
    if (selectedSlugs.length > 0) {
      url.searchParams.set("slugs", selectedSlugs.join(","));
    } else {
      url.searchParams.delete("slugs");
    }
    url.searchParams.delete("add");
    window.history.replaceState({}, "", url.toString());
  }, [selectedSlugs, initialized]);

  const selectedProducts = useMemo(
    () => selectedSlugs.map((slug) => allProducts.find((p) => p.slug === slug)).filter(Boolean) as Product[],
    [selectedSlugs]
  );

  const searchResults = useMemo(
    () =>
      searchQuery.trim()
        ? allProducts
            .filter(
              (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brandName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter((p) => !selectedSlugs.includes(p.slug))
            .slice(0, 8)
        : [],
    [searchQuery, selectedSlugs]
  );

  const addProduct = useCallback((slug: string) => {
    if (selectedSlugs.length < 4) {
      setSelectedSlugs((prev) => [...prev, slug]);
      setSearchQuery("");
      setShowSearch(false);
    }
  }, [selectedSlugs.length]);

  const removeProduct = useCallback((slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const copyShareLink = useCallback(() => {
    const url = new URL(window.location.href);
    if (selectedSlugs.length > 0) {
      url.searchParams.set("slugs", selectedSlugs.join(","));
    }
    url.searchParams.delete("add");
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedSlugs]);

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E4DDD5] bg-white">
        <div className="container py-10 px-6 md:px-0">
          <Link href="/" className="text-xs text-[#6D655F] hover:text-[#6D5C3E] flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[42px] tracking-[-2px] leading-[0.92] mb-2">Compare Products</h1>
              <p className="text-[#5C5249] max-w-xl">Select 2–4 products to see them side by side. Compare features, prices, ratings, and more.</p>
            </div>
            {selectedProducts.length >= 2 && (
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E4DDD5] bg-white text-sm text-[#5C5249] hover:border-[#6D5C3E] hover:text-[#6D5C3E] transition-all flex-shrink-0 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share this comparison</span>
                    <span className="sm:hidden">Share</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 px-6 md:px-0">
        {/* Search / Add Products */}
        <div className="mb-8">
          {selectedSlugs.length < 4 && (
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-[#D9D0C3] rounded-2xl text-sm text-[#6D655F] hover:border-[#6D5C3E] hover:text-[#6D5C3E] transition-all w-full sm:w-auto"
              >
                <Plus size={16} />
                Add a product to compare
              </button>

              {showSearch && (
                <div className="mt-3 relative z-20">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name or brand..."
                    className="w-full max-w-lg px-5 py-3 rounded-2xl border border-[#E4DDD5] bg-white text-sm focus:border-[#6D5C3E] outline-none shadow-lg"
                    autoFocus
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 max-w-lg bg-white border border-[#E4DDD5] rounded-2xl shadow-xl overflow-hidden z-30">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addProduct(product.slug)}
                          className="w-full flex items-center gap-4 px-5 py-3 hover:bg-[#FAF7F4] transition-colors text-left border-b border-[#E4DDD5]/50 last:border-none"
                        >
                          <div className="h-10 w-10 rounded-xl bg-[#EFE7DE] overflow-hidden flex-shrink-0 relative">
                            <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#26221E] truncate">{product.name}</div>
                            <div className="text-xs text-[#5C5249]">{product.brandName} • ${product.price}</div>
                          </div>
                          <Plus size={16} className="text-[#6D5C3E] flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery.trim() && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 max-w-lg bg-white border border-[#E4DDD5] rounded-2xl shadow-xl p-6 text-center text-sm text-[#5C5249] z-30">
                      No products found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <Link href={`/products/${product.slug}`} className="block bg-white rounded-2xl border border-[#E4DDD5] p-5 hover:border-[#6D5C3E] transition-all">
                    <div className="aspect-square rounded-xl bg-[#EFE7DE] overflow-hidden mb-4">
                      <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                    </div>
                    <div className="font-display text-sm tracking-tight text-[#26221E] line-clamp-2 mb-1">{product.name}</div>
                    <div className="text-xs text-[#5C5249] mb-2">{product.brandName}</div>
                    <PriceDisplay usdAmount={product.price} className="text-base font-semibold tabular-nums text-[#26221E]" />
                  </Link>
                  <button
                    onClick={() => removeProduct(product.slug)}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-[#E4DDD5] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50 hover:border-rose-200"
                    aria-label={`Remove ${product.name} from comparison`}
                  >
                    <X size={12} className="text-rose-500" />
                  </button>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: 4 - selectedProducts.length }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#FAF7F4] rounded-2xl border-2 border-dashed border-[#E4DDD5] p-5 flex items-center justify-center min-h-[220px]">
                  <div className="text-center">
                    <Plus size={24} className="text-[#B8AFA3] mx-auto mb-2" />
                    <div className="text-xs text-[#8A8178]">Add product</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedProducts.length >= 2 && (
          <div className="bg-white rounded-3xl border border-[#E4DDD5] overflow-hidden mt-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF7F4] border-b border-[#E4DDD5]">
                    <th className="p-5 text-left text-[10px] tracking-[2px] text-[#5C5249] font-medium w-40">FEATURE</th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="p-5 text-center min-w-[180px]">
                        <div className="font-display text-sm tracking-tight text-[#26221E]">{product.name}</div>
                        <PriceDisplay usdAmount={product.price} className="text-xs text-[#5C5249] mt-0.5" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feature, idx) => (
                    <tr key={feature.key} className={`border-b border-[#E4DDD5]/50 ${idx % 2 === 0 ? "bg-white" : "bg-[#FAF7F4]/50"}`}>
                      <td className="p-5 text-[10px] tracking-[1.5px] text-[#5C5249] font-medium uppercase">{feature.label}</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-5 text-center">
                          {feature.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E4DDD5]">
              <div className="bg-[#F5F0EA] p-4 flex items-center">
                <span className="text-[10px] tracking-[2px] text-[#5C5249] font-medium uppercase">Shop</span>
              </div>
              {selectedProducts.map((product) => (
                <div key={product.id} className="bg-white p-4 flex items-center justify-center">
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#26221E] px-4 py-2 rounded-full hover:bg-[#3D3530] transition-colors"
                  >
                    <ShoppingBag size={12} />
                    View Deal
                  </Link>
                </div>
              ))}
            </div>

            {/* Share footer */}
            <div className="bg-[#FAF7F4] px-5 py-4 flex items-center justify-between border-t border-[#E4DDD5]">
              <span className="text-[10px] tracking-[1.5px] text-[#5C5249]">
                Comparing {selectedProducts.length} products
              </span>
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1.5 text-xs text-[#6D5C3E] hover:underline"
              >
                {copied ? (
                  <><Check size={12} className="text-green-600" /> Link copied!</>
                ) : (
                  <><Share2 size={12} /> Copy comparison link</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {selectedProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-[#EFE7DE] flex items-center justify-center mx-auto mb-6">
              <Plus size={24} className="text-[#8A8178]" />
            </div>
            <h3 className="font-display text-2xl tracking-tight text-[#26221E] mb-2">Select products to compare</h3>
            <p className="text-[#5C5249] text-sm max-w-md mx-auto">
              Add 2–4 products to see their features, prices, and ratings side by side. Make informed decisions with ALAYA.
            </p>
          </div>
        )}

        {selectedProducts.length === 1 && (
          <div className="text-center py-10 text-sm text-[#5C5249]">
            Add at least one more product to see the comparison table.
          </div>
        )}
      </div>
    </div>
  );
}
