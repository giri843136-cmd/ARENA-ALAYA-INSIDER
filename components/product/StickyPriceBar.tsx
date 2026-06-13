"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowUp } from "lucide-react";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import type { Product } from "@/lib/types";

/**
 * StickyPriceBar — A premium sticky bottom bar with price & CTA.
 *
 * Appears after the user scrolls past the main purchase section.
 * Shows the current price, a "Shop Now" CTA, and a "Back to top" button.
 * Designed for mobile-first but visible on all screen sizes.
 *
 * Usage:
 *   <StickyPriceBar product={product} affiliateUrl={product.affiliateLinks?.[0]?.url} />
 */
export function StickyPriceBar({
  product,
  affiliateUrl,
  className = "",
}: {
  product: Product;
  affiliateUrl?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) /
          product.originalPrice!) *
          100
      )
    : 0;

  useEffect(() => {
    const purchaseSection = document.getElementById("purchase-card");
    if (!purchaseSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when purchase card scrolls out of view
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );

    observer.observe(purchaseSection);
    return () => observer.disconnect();
  }, []);

  const handleShop = () => {
    if (affiliateUrl) {
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      } ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#E4DDD5] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Price info */}
          <div className="flex items-baseline gap-2 min-w-0">
            <PriceDisplay
              usdAmount={product.price}
              className="text-xl font-semibold tabular-nums tracking-tight text-[#26221E]"
            />
            {hasDiscount && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[#8A8178] line-through tabular-nums hidden sm:inline">
                  ${product.originalPrice}
                </span>
                <span className="text-[10px] font-medium text-white bg-rose-600 px-1.5 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </div>
            )}
            <span className="text-[11px] text-[#8A8178] hidden sm:inline ml-1">
              + Free shipping
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={scrollToTop}
              className="h-10 w-10 rounded-full border border-[#E4DDD5] flex items-center justify-center text-[#5C5249] hover:bg-[#EFE7DE] transition-colors active:scale-95"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={handleShop}
              className="h-10 px-6 rounded-full bg-[#26221E] text-white text-sm font-medium hover:bg-[#3D3530] transition-all active:scale-[0.97] flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Shop Now</span>
              <PriceDisplay
                usdAmount={product.price}
                className="sm:hidden font-medium"
              />
            </button>
          </div>
        </div>
      </div>
      {/* Bottom spacing for mobile safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-white/95" />
    </div>
  );
}
