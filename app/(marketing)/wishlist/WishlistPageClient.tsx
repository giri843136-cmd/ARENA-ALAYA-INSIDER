"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { getWishlist, removeFromWishlist, clearWishlist, type WishlistItem } from "@/lib/wishlist/store";

export function WishlistPageClient() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(getWishlist());
    setLoaded(true);

    // Listen for updates from other tabs
    const handler = () => setItems(getWishlist());
    window.addEventListener("wishlist-updated", handler);
    return () => window.removeEventListener("wishlist-updated", handler);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleRemove = (slug: string) => {
    removeFromWishlist(slug);
    setItems(getWishlist());
  };

  const handleClear = () => {
    if (confirm("Remove all items from your wishlist?")) {
      clearWishlist();
      setItems([]);
    }
  };

  if (!loaded) {
    return (
      <div className="container px-6 md:px-0 pb-24">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-[#E4DDD5] border-t-[#7A6848] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container px-6 md:px-0 pb-24">
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#EFE7DE] flex items-center justify-center mb-6">
            <Heart size={24} className="text-[#8A8178]" />
          </div>
          <h2 className="font-display text-2xl text-[#26221E] mb-3">Your wishlist is empty</h2>
          <p className="text-[#5C5249] text-[15px] mb-8">
            Save products you love by clicking the heart icon on any product card or detail page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#26221E] text-white text-sm font-medium rounded-full hover:bg-[#3D3530] transition-all"
          >
            <ArrowLeft size={15} />
            Discover products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 md:px-0 pb-24">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-[#5C5249]">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
        <button
          onClick={handleClear}
          className="text-xs text-[#8A8178] hover:text-rose-500 transition-colors tracking-wider"
        >
          Clear all
        </button>
      </div>

      {/* Wishlist grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => (
          <div key={item.slug} className="group relative bg-white rounded-2xl border border-[#E4DDD5] overflow-hidden transition-shadow hover:shadow-lg">
            {/* Product image */}
            <Link href={`/products/${item.slug}`} className="block aspect-[4/5] bg-[#EFE7DE] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Remove button */}
            <button
              onClick={() => handleRemove(item.slug)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
              aria-label={`Remove ${item.name} from wishlist`}
            >
              <Trash2 size={14} className="text-[#5C5249] hover:text-rose-500" />
            </button>

            {/* Product info */}
            <div className="p-4">
              <p className="text-[10px] tracking-[1.5px] text-[#8A8178] uppercase">{item.brandName}</p>
              <Link href={`/products/${item.slug}`} className="block mt-1">
                <h3 className="font-medium text-[#26221E] text-sm line-clamp-1 hover:text-[#C5AA8A] transition-colors">
                  {item.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-3">
                <span className="font-semibold text-[#26221E] tabular-nums">${item.price}</span>
                <span className="text-[10px] text-[#8A8178]">
                  Added {new Date(item.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
