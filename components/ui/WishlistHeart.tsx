"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist/useWishlist";

/**
 * WishlistHeart — Navigation heart icon with live count badge.
 * Pulls count from localStorage wishlist store.
 */
export function WishlistHeart() {
  const { count } = useWishlist();

  return (
    <Link href="/wishlist" className="hidden md:flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EFE7DE] text-[#5C5249] transition-colors relative" aria-label="View your wishlist">
      <Heart className="h-4 w-4" />
      {count > 0 && (
        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#B89B7A] text-[9px] flex items-center justify-center text-[#26221E] font-medium">
          {count > 9 ? "9+" : count}
        </div>
      )}
    </Link>
  );
}
