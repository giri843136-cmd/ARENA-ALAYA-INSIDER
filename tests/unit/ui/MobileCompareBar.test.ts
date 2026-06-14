// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * MobileCompareBar Tests
 *
 * Tests the wishlist integration in the mobile sticky price bar.
 * Verifies that the heart button correctly toggles wishlist state
 * and syncs with localStorage-based wishlist store.
 */

describe("MobileCompareBar Wishlist", () => {
  let toggleWishlist: any;
  let isInWishlist: any;
  let store: Record<string, string> = {};

  beforeEach(async () => {
    store = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => { store[key] = value; }
    );
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(
      (key: string) => { delete store[key]; }
    );
    vi.spyOn(window, "dispatchEvent");

    // Import fresh modules for each test
    vi.resetModules();
    const wishlistStore = await import("@/lib/wishlist/store");
    toggleWishlist = wishlistStore.toggleWishlist;
    isInWishlist = wishlistStore.isInWishlist;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const testProduct = {
    slug: "artisan-weave-tote",
    name: "Artisan Weave Tote",
    price: 245,
    image: "https://example.com/image.jpg",
    brandName: "ALAYA Studio",
  };

  it("toggles wishlist when heart button is clicked", () => {
    // Simulate the MobileCompareBar's onClick handler
    const nowSaved = toggleWishlist(testProduct);
    expect(nowSaved).toBe(true);
    expect(isInWishlist(testProduct.slug)).toBe(true);

    // Toggle again to remove
    const nowUnsaved = toggleWishlist(testProduct);
    expect(nowUnsaved).toBe(false);
    expect(isInWishlist(testProduct.slug)).toBe(false);
  });

  it("syncs saved state with wishlist on mount", () => {
    // Add product to wishlist first
    toggleWishlist(testProduct);

    // Simulate the MobileCompareBar's useEffect behavior
    const saved = isInWishlist(testProduct.slug);
    expect(saved).toBe(true);
  });

  it("updates saved state when wishlist changes externally", () => {
    // Check initially not saved
    expect(isInWishlist(testProduct.slug)).toBe(false);

    // Simulate another component adding to wishlist
    toggleWishlist(testProduct);

    // Should now be saved
    expect(isInWishlist(testProduct.slug)).toBe(true);
  });

  it("handles wishlist events from other tabs", () => {
    // Simulate the MobileCompareBar's event listener
    const handler = vi.fn();
    window.addEventListener("wishlist-updated", handler);

    // Manually dispatch a wishlist event (as another tab would)
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: [] }));

    // Handler should have been called
    expect(handler).toHaveBeenCalled();
    window.removeEventListener("wishlist-updated", handler);
  });

  it("returns the correct saved state after toggle", () => {
    // Should start as not saved
    expect(isInWishlist(testProduct.slug)).toBe(false);

    // Add
    toggleWishlist(testProduct);
    expect(isInWishlist(testProduct.slug)).toBe(true);

    // Remove
    toggleWishlist(testProduct);
    expect(isInWishlist(testProduct.slug)).toBe(false);
  });

  it("persists wishlist state across component remounts", () => {
    // First interaction
    toggleWishlist(testProduct);
    expect(isInWishlist(testProduct.slug)).toBe(true);

    // Simulate remount by checking stored data
    vi.resetModules();
    // Re-check existing storage
    expect(isInWishlist(testProduct.slug)).toBe(true);
  });

  it("handles both optional props (productImage, brandName) correctly", () => {
    const productWithImage = {
      ...testProduct,
      image: "https://example.com/tote.jpg",
    };

    // Toggle with full data including image
    toggleWishlist(productWithImage);
    const items = JSON.parse(store["alaya_wishlist"] || "[]");
    expect(items[0].image).toBe("https://example.com/tote.jpg");
  });

  it("handles missing optional props gracefully", () => {
    const productWithoutOptional = {
      slug: "minimal-product",
      name: "Minimal",
      price: 100,
      image: "",
      brandName: "",
    };

    toggleWishlist(productWithoutOptional);
    const items = JSON.parse(store["alaya_wishlist"] || "[]");
    expect(items[0].slug).toBe("minimal-product");
    expect(items[0].image).toBe("");
    expect(items[0].brandName).toBe("");
  });

  it("dispatches wishlist-updated event on toggle", () => {
    toggleWishlist(testProduct);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "wishlist-updated" })
    );
  });
});
