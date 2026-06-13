/**
 * ALAYA INSIDER — Client-side Wishlist Store
 *
 * Uses localStorage to persist wishlist (saved products) across sessions.
 * Provides React hooks for components to read/write the wishlist.
 */

const STORAGE_KEY = "alaya_wishlist";

export interface WishlistItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  brandName: string;
  addedAt: string;
}

function getStored(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setStored(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Dispatch custom event so other tabs/components can react
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: items }));
  } catch {
    // Silently fail
  }
}

/**
 * Check if a product slug is in the wishlist.
 */
export function isInWishlist(slug: string): boolean {
  return getStored().some((item) => item.slug === slug);
}

/**
 * Toggle a product in the wishlist. Returns the new state.
 */
export function toggleWishlist(product: {
  slug: string;
  name: string;
  price: number;
  image: string;
  brandName: string;
}): boolean {
  const items = getStored();
  const exists = items.findIndex((i) => i.slug === product.slug);
  if (exists >= 0) {
    items.splice(exists, 1);
    setStored(items);
    return false;
  } else {
    items.unshift({
      ...product,
      addedAt: new Date().toISOString(),
    });
    setStored(items);
    return true;
  }
}

/**
 * Remove a product from the wishlist.
 */
export function removeFromWishlist(slug: string): void {
  const items = getStored().filter((i) => i.slug !== slug);
  setStored(items);
}

/**
 * Get all wishlist items.
 */
export function getWishlist(): WishlistItem[] {
  return getStored();
}

/**
 * Get the count of items in the wishlist.
 */
export function getWishlistCount(): number {
  return getStored().length;
}

/**
 * Clear the entire wishlist.
 */
export function clearWishlist(): void {
  setStored([]);
}
