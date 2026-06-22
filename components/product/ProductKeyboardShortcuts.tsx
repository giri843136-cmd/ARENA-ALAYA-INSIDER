"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { toggleWishlist } from "@/lib/wishlist/store";

interface ProductKeyboardShortcutsProps {
  slug: string;
  name: string;
  price: number;
  image: string;
  brandName: string;
  affiliateUrl?: string;
  compareUrl: string;
}

export function ProductKeyboardShortcuts({
  slug,
  name,
  price,
  image,
  brandName,
  affiliateUrl,
  compareUrl,
}: ProductKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "b": {
          // B = Buy from partner
          if (affiliateUrl) {
            e.preventDefault();
            window.open(affiliateUrl, "_blank", "noopener,noreferrer");
            toast.info("Opening partner store...", {
              description: `Redirecting to purchase ${name}.`,
            });
          }
          break;
        }
        case "w": {
          // W = Toggle wishlist
          e.preventDefault();
          const nowSaved = toggleWishlist({
            slug,
            name,
            price,
            image,
            brandName,
          });
          if (nowSaved) {
            toast.success("Saved to wishlist", {
              description: `Pressed W to save ${name}.`,
            });
          } else {
            toast.info("Removed from wishlist", {
              description: `${name} removed from your wishlist.`,
            });
          }
          break;
        }
        case "c": {
          // C = Add to compare
          if (compareUrl) {
            e.preventDefault();
            window.location.href = compareUrl;
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slug, name, price, image, brandName, affiliateUrl, compareUrl]);

  return (
    <div className="hidden lg:flex items-center gap-3 text-[10px] tracking-[1.5px] text-[#8A8178] border-t border-[#E4DDD5] pt-4 mt-6">
      <span className="font-medium text-[#5C5249]">Keyboard shortcuts:</span>
      <kbd className="px-1.5 py-0.5 rounded border border-[#E4DDD5] bg-white text-[10px] font-mono">B</kbd>
      <span>Buy</span>
      <kbd className="px-1.5 py-0.5 rounded border border-[#E4DDD5] bg-white text-[10px] font-mono">W</kbd>
      <span>Wishlist</span>
      <kbd className="px-1.5 py-0.5 rounded border border-[#E4DDD5] bg-white text-[10px] font-mono">C</kbd>
      <span>Compare</span>
    </div>
  );
}
