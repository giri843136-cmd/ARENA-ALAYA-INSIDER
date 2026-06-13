"use client";

import { useState, useEffect, useCallback } from "react";
import { getWishlist, getWishlistCount, type WishlistItem } from "./store";

/**
 * React hook for reading the wishlist state.
 * Re-renders components when the wishlist changes (even across tabs).
 */
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    setItems(getWishlist());
    setCount(getWishlistCount());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("wishlist-updated", refresh);
    return () => window.removeEventListener("wishlist-updated", refresh);
  }, [refresh]);

  return { items, count, refresh };
}
