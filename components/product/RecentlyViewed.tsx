"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";
import { allProducts } from "@/lib/data/seed";

const MAX_RECENT = 8;
const STORAGE_KEY = "alaya_recently_viewed";

function getStoredSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addToStorage(slug: string) {
  try {
    const existing = getStoredSlugs().filter((s) => s !== slug);
    const updated = [slug, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail
  }
}

/**
 * Track a product view — call this on product detail page mount.
 */
export function trackProductView(slug: string) {
  addToStorage(slug);
}

/**
 * RecentlyViewed — Horizontal scrolling carousel of recently viewed products.
 *
 * Tracks product views via localStorage and displays them in a
 * horizontal scrollable row. Only renders when there are 2+ items.
 *
 * Usage:
 *   <RecentlyViewed currentProductSlug={product.slug} />
 */
export function RecentlyViewed({
  currentProductSlug,
  className = "",
}: {
  currentProductSlug?: string;
  className?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const slugs = getStoredSlugs().filter(
      (s) => s !== currentProductSlug
    );
    if (slugs.length < 2) return;

    const found = slugs
      .map((slug) => allProducts.find((p) => p.slug === slug))
      .filter((p): p is Product => !!p)
      .slice(0, 6);

    setProducts(found);
  }, [currentProductSlug]);

  if (products.length < 2) return null;

  return (
    <section className={`py-12 ${className}`}>
      <div className="container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-[3px] text-[var(--accent-gold,#7A6848)] uppercase mb-1">
              <Clock size={12} /> Recently Viewed
            </div>
            <h3 className="font-display text-3xl tracking-tight">
              Continue Browsing
            </h3>
          </div>
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--accent-gold,#7A6848)] hover:underline"
          >
            Browse all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin"
          style={{ scrollbarWidth: "thin" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[240px] sm:w-[280px]"
            >
              <ProductCard product={product} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
