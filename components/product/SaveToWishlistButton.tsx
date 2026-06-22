"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist/store";

interface SaveToWishlistButtonProps {
  slug: string;
  name: string;
  price: number;
  image: string;
  brandName: string;
}

export function SaveToWishlistButton({
  slug,
  name,
  price,
  image,
  brandName,
}: SaveToWishlistButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSaved(isInWishlist(slug));

    // Listen for wishlist changes from other components (keyboard shortcuts, other tabs)
    const handler = () => setSaved(isInWishlist(slug));
    window.addEventListener("wishlist-updated", handler);
    return () => window.removeEventListener("wishlist-updated", handler);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [slug]);

  const handleSave = () => {
    const nowSaved = toggleWishlist({ slug, name, price, image, brandName });
    setSaved(nowSaved);
    if (nowSaved) {
      toast.success("Saved to wishlist", {
        description: `${name} has been added to your wishlist.`,
      });
    } else {
      toast.info("Removed from wishlist", {
        description: `${name} has been removed from your wishlist.`,
      });
    }
  };

  return (
    <button
      onClick={handleSave}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition-all active:scale-[0.95] ${
        saved
          ? "border-rose-200 bg-rose-50 text-rose-500"
          : "border-[#E4DDD5] bg-white text-[#5C5249] hover:border-rose-300 hover:text-rose-500"
      }`}
    >
      {saved ? "♥ Saved" : "♡ Save to Wishlist"}
    </button>
  );
}
