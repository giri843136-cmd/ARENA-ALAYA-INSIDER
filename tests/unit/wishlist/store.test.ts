// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Wishlist Store Tests
 *
 * Tests the client-side wishlist storage module which uses localStorage
 * for persistence and dispatches CustomEvents for cross-tab sync.
 */

describe("useWishlist Store", () => {
  let wishlist: typeof import("@/lib/wishlist/store");
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
    vi.spyOn(window, "dispatchEvent").mockImplementation(vi.fn());

    vi.resetModules();
    wishlist = await import("@/lib/wishlist/store");
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

  describe("isInWishlist", () => {
    it("returns false for an empty wishlist", () => {
      expect(wishlist.isInWishlist("any-product")).toBe(false);
    });

    it("returns true for a product that has been added", () => {
      wishlist.toggleWishlist(testProduct);
      expect(wishlist.isInWishlist(testProduct.slug)).toBe(true);
    });

    it("returns false after a product is removed", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.removeFromWishlist(testProduct.slug);
      expect(wishlist.isInWishlist(testProduct.slug)).toBe(false);
    });
  });

  describe("toggleWishlist", () => {
    it("adds a product and returns true", () => {
      const result = wishlist.toggleWishlist(testProduct);
      expect(result).toBe(true);
    });

    it("removes a product and returns false on second toggle", () => {
      wishlist.toggleWishlist(testProduct);
      const result = wishlist.toggleWishlist(testProduct);
      expect(result).toBe(false);
    });

    it("prepends new items to the wishlist", () => {
      const secondProduct = { ...testProduct, slug: "second-product", name: "Second Product" };
      wishlist.toggleWishlist(testProduct);
      wishlist.toggleWishlist(secondProduct);

      const items = wishlist.getWishlist();
      expect(items[0].slug).toBe("second-product");
    });

    it("dispatches a wishlist-updated event on toggle", () => {
      wishlist.toggleWishlist(testProduct);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "wishlist-updated" })
      );
    });
  });

  describe("getWishlist", () => {
    it("returns an empty array initially", () => {
      expect(wishlist.getWishlist()).toEqual([]);
    });

    it("returns all items after adding", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.toggleWishlist({ ...testProduct, slug: "item-2", name: "Item 2" });

      const items = wishlist.getWishlist();
      expect(items).toHaveLength(2);
    });

    it("includes the addedAt timestamp on each item", () => {
      wishlist.toggleWishlist(testProduct);
      const items = wishlist.getWishlist();
      expect(items[0].addedAt).toBeDefined();
      expect(() => new Date(items[0].addedAt)).not.toThrow();
    });
  });

  describe("getWishlistCount", () => {
    it("returns 0 for an empty wishlist", () => {
      expect(wishlist.getWishlistCount()).toBe(0);
    });

    it("returns the correct count after adding items", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.toggleWishlist({ ...testProduct, slug: "item-2", name: "Item 2" });
      expect(wishlist.getWishlistCount()).toBe(2);
    });
  });

  describe("removeFromWishlist", () => {
    it("removes the specified product", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.toggleWishlist({ ...testProduct, slug: "other-item", name: "Other" });
      wishlist.removeFromWishlist(testProduct.slug);

      const items = wishlist.getWishlist();
      expect(items).toHaveLength(1);
      expect(items[0].slug).toBe("other-item");
    });

    it("does nothing if the product is not in the wishlist", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.removeFromWishlist("non-existent-product");
      expect(wishlist.getWishlistCount()).toBe(1);
    });

    it("dispatches a wishlist-updated event on remove", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.removeFromWishlist(testProduct.slug);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "wishlist-updated" })
      );
    });
  });

  describe("clearWishlist", () => {
    it("removes all items", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.toggleWishlist({ ...testProduct, slug: "other", name: "Other" });
      wishlist.clearWishlist();
      expect(wishlist.getWishlistCount()).toBe(0);
    });

    it("dispatches a wishlist-updated event", () => {
      wishlist.toggleWishlist(testProduct);
      wishlist.clearWishlist();
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "wishlist-updated" })
      );
    });
  });

  describe("Persistence (localStorage)", () => {
    it("persists items across operations", () => {
      wishlist.toggleWishlist(testProduct);
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].slug).toBe(testProduct.slug);
    });

    it("handles corrupted localStorage gracefully", () => {
      store["alaya_wishlist"] = "invalid json{";
      expect(wishlist.isInWishlist("anything")).toBe(false);
    });
  });
});
