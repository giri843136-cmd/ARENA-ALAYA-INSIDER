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
    /* eslint-disable react-hooks/set-state-in-effect */
    refresh();
    window.addEventListener("wishlist-updated", refresh);
    return () => window.removeEventListener("wishlist-updated", refresh);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [refresh]);

  return { items, count, refresh };
}
