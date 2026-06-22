"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist/store";

interface MobileCompareBarProps {
  productName: string;
  productPrice: number;
  productSlug: string;
  productImage?: string;
  brandName?: string;
  primaryUrl?: string;
  className?: string;
}

/**
 * MobileCompareBar — Sticky mobile bottom bar with price and CTA.
 *
 * Fixed at the bottom of the viewport on mobile, showing the product name,
 * live-converted price, and action buttons. Disappears on desktop.
 * Matches the editorial look of Wirecutter-style sticky bars.
 *
 * Usage:
 *   <MobileCompareBar productName={product.name} productPrice={product.price} productSlug={product.slug} />
 */
export function MobileCompareBar({
  productName,
  productPrice,
  productSlug,
  productImage = "",
  brandName = "",
  primaryUrl,
  className = "",
}: MobileCompareBarProps) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(currentScrollY < lastScrollY || currentScrollY < 200);
      setLastScrollY(currentScrollY);
    };

    // Debounced scroll handler
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  const handleBuy = () => {
    if (primaryUrl) {
      window.open(primaryUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(`/products/${productSlug}`, "_self");
    }
  };

  // Sync saved state with wishlist on mount and on changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSaved(isInWishlist(productSlug));
    const handler = () => setSaved(isInWishlist(productSlug));
    window.addEventListener("wishlist-updated", handler);
    return () => window.removeEventListener("wishlist-updated", handler);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [productSlug]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      } ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-lg border-t border-[#E4DDD5] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[#5C5249] truncate tracking-wide">
              {productName}
            </div>
            <div className="font-medium text-[#26221E]">
              <PriceDisplay usdAmount={productPrice} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="h-10 w-10 rounded-full border border-[#E4DDD5] flex items-center justify-center hover:bg-[#FAF7F4] transition-colors"
              aria-label="Save to wishlist"
              onClick={() => {
                const nowSaved = toggleWishlist({
                  slug: productSlug,
                  name: productName,
                  price: productPrice,
                  image: productImage,
                  brandName,
                });
                setSaved(nowSaved);
              }}
            >
              <Heart size={16} className={`${saved ? "fill-rose-500 text-rose-500" : "text-[#6D655F]"} transition-colors`} />
            </button>
            <button
              onClick={handleBuy}
              className="h-10 px-5 rounded-full bg-[#7A6848] text-white text-xs font-medium tracking-wider hover:bg-[#B89A7A] transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              View Deal
            </button>
            <button
              onClick={() => setVisible(false)}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-[#FAF7F4] transition-colors"
              aria-label="Close"
            >
              <ChevronDown size={16} className="text-[#5C5249]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
