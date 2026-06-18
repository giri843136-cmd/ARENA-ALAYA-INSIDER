"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Minus, Star, ExternalLink, ShoppingBag, BarChart3 } from "lucide-react";
import Link from "next/link";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface CompareProduct {
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  affiliateUrl?: string;
  availability: string;
}

export default function ComparePage() {
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get product slugs from URL params
    const params = new URLSearchParams(window.location.search);
    const slugs = params.get("slugs")?.split(",") || [];

    if (slugs.length > 0) {
      fetchCompareData(slugs);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCompareData = async (slugs: string[]) => {
    try {
      const results = await Promise.all(
        slugs.map(async (slug) => {
          const res = await fetch(`/api/v1/products/${slug}`);
          if (!res.ok) return null;
          const json = await res.json();
          return json.data;
        })
      );
      setProducts(results.filter(Boolean) as CompareProduct[]);
    } catch {
      // Fallback to empty
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (slug: string) => {
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
    // Update URL
    const remaining = products.filter((p) => p.slug !== slug).map((p) => p.slug);
    const url = new URL(window.location.href);
    if (remaining.length > 0) {
      url.searchParams.set("slugs", remaining.join(","));
    } else {
      url.searchParams.delete("slugs");
    }
    window.history.replaceState({}, "", url.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 size={32} className="mx-auto mb-4 text-[#C5A26F] animate-pulse" />
          <p className="text-sm text-[#8A8178]">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center">
        <div className="text-center max-w-md">
          <BarChart3 size={48} className="mx-auto mb-4 text-[#C5A26F]/50" />
          <h1 className="text-xl font-semibold text-[#2C2522] mb-2">No Products to Compare</h1>
          <p className="text-sm text-[#8A8178] mb-6">
            Browse our curated collection and use the "Compare" button on any product to add it here.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Collect all unique spec keys across products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs || {})))
  );

  return (
    <div className="min-h-screen bg-[#F5F0EA]">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#2C2522] mb-6">Product Comparison</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Product headers */}
            <thead>
              <tr>
                <th className="w-48 text-left text-xs text-[#8A8178] font-medium pb-4 pr-4">Feature</th>
                {products.map((product) => (
                  <th key={product.slug} className="text-center pb-4 px-3 min-w-[220px]">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.slug)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm"
                      >
                        <X size={12} className="text-[#8A8178]" />
                      </button>
                      <div className="aspect-[4/3] bg-[#E8E2D9] rounded-lg mb-3 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-sm font-medium text-[#2C2522] line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-[#8A8178] mt-0.5">{product.brand}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star size={12} className="text-[#C5A26F] fill-[#C5A26F]" />
                        <span className="text-xs text-[#5C5249]">{product.rating}</span>
                        <span className="text-xs text-[#8A8178]">({product.reviewCount})</span>
                      </div>
                      <div className="mt-2">
                        <PriceDisplay usdAmount={product.price} className="text-lg font-semibold" />
                      </div>
                      {product.affiliateUrl && (
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#7A6848] text-white text-xs rounded-full hover:bg-[#B89A7A] transition-colors"
                        >
                          <ShoppingBag size={12} />
                          Best Price
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Rating row */}
              <tr className="border-t border-[#E4DDD5]">
                <td className="py-3 pr-4 text-xs font-medium text-[#5C5249]">Rating</td>
                {products.map((p) => (
                  <td key={p.slug} className="text-center py-3 px-3">
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.round(p.rating) ? "text-[#C5A26F] fill-[#C5A26F]" : "text-[#E4DDD5]"}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Availability row */}
              <tr className="border-t border-[#E4DDD5]">
                <td className="py-3 pr-4 text-xs font-medium text-[#5C5249]">Availability</td>
                {products.map((p) => (
                  <td key={p.slug} className="text-center py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.availability === "IN_STOCK" ? "bg-emerald-100 text-emerald-700" :
                      p.availability === "LOW_STOCK" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {p.availability.replace(/_/g, " ")}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Price row */}
              <tr className="border-t border-[#E4DDD5]">
                <td className="py-3 pr-4 text-xs font-medium text-[#5C5249]">Price</td>
                {products.map((p) => (
                  <td key={p.slug} className="text-center py-3 px-3 font-semibold text-sm">
                    {p.salePrice ? (
                      <>
                        <span className="line-through text-[#8A8178] text-xs mr-1">
                          <PriceDisplay usdAmount={p.price} />
                        </span>
                        <span className="text-rose-600">
                          <PriceDisplay usdAmount={p.salePrice} />
                        </span>
                      </>
                    ) : (
                      <PriceDisplay usdAmount={p.price} />
                    )}
                  </td>
                ))}
              </tr>

              {/* Description row */}
              <tr className="border-t border-[#E4DDD5]">
                <td className="py-3 pr-4 text-xs font-medium text-[#5C5249]">Description</td>
                {products.map((p) => (
                  <td key={p.slug} className="py-3 px-3 text-xs text-[#5C5249] leading-relaxed">{p.description}</td>
                ))}
              </tr>

              {/* Pros rows */}
              <tr className="border-t border-[#E4DDD5]">
                <td className="py-3 pr-4 text-xs font-medium text-[#5C5249] align-top">Pros</td>
                {products.map((p) => (
                  <td key={p.slug} className="py-3 px-3 align-top">
                    <ul className="space-y-1">
                      {(p.pros || []).slice(0, 5).map((pro, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700">
                          <Check size={12} className="mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Cons rows */}
              <tr className="border-t border-[#E4DDD5]">
                <td className="py-3 pr-4 text-xs font-medium text-[#5C5249] align-top">Cons</td>
                {products.map((p) => (
                  <td key={p.slug} className="py-3 px-3 align-top">
                    <ul className="space-y-1">
                      {(p.cons || []).slice(0, 5).map((con, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-red-600">
                          <Minus size={12} className="mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Specs rows */}
              {allSpecKeys.map((key) => (
                <tr key={key} className="border-t border-[#E4DDD5]">
                  <td className="py-3 pr-4 text-xs font-medium text-[#5C5249] capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                  {products.map((p) => (
                    <td key={p.slug} className="text-center py-3 px-3 text-xs text-[#5C5249]">
                      {p.specs?.[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length < 4 && (
          <div className="mt-8 text-center">
            <Link href="/products" className="text-xs text-[#C5A26F] hover:underline">
              + Add more products to compare (up to 4)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
