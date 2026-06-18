/**
 * Coupon Auto-Fill Tests
 *
 * Tests the coupon auto-fill service: URL manipulation, coupon detection,
 * merchant-specific parameter mapping, and edge cases.
 * Pure functions are tested directly; Prisma-dependent functions are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    coupon: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

describe("Coupon Auto-Fill — applyCouponToUrl", () => {
  it("appends coupon parameter to a generic URL", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://example.com/product/123";
    const result = applyCouponToUrl(url, "SAVE20");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("coupon")).toBe("SAVE20");
  });

  it("uses amazon.com coupon parameter correctly", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://www.amazon.com/dp/B0EXAMPLE";
    const result = applyCouponToUrl(url, "AMZ10");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("coupon")).toBe("AMZ10");
  });

  it("uses walmart.com couponCode parameter", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://www.walmart.com/ip/product";
    const result = applyCouponToUrl(url, "WALMART5");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("couponCode")).toBe("WALMART5");
  });

  it("uses etsy.com code parameter", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://www.etsy.com/listing/123";
    const result = applyCouponToUrl(url, "ETSY20");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("code")).toBe("ETSY20");
  });

  it("uses shopify.com discount parameter", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://example.myshopify.com/products/item";
    const result = applyCouponToUrl(url, "SHOP10");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("discount")).toBe("SHOP10");
  });

  it("uses bestbuy.com couponcode parameter", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://www.bestbuy.com/product/123";
    const result = applyCouponToUrl(url, "BBY15");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("couponcode")).toBe("BBY15");
  });

  it("uses lowes.com promo parameter", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://www.lowes.com/pd/product";
    const result = applyCouponToUrl(url, "LOWES10");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("promo")).toBe("LOWES10");
  });

  it("uses target.com coupon parameter", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://www.target.com/p/product";
    const result = applyCouponToUrl(url, "TGT20");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("coupon")).toBe("TGT20");
  });

  it("replaces existing coupon parameter if present", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://example.com/product?coupon=OLDCODE";
    const result = applyCouponToUrl(url, "NEWCODE");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("coupon")).toBe("NEWCODE");
    expect(parsed.searchParams.getAll("coupon").length).toBe(1);
  });

  it("preserves existing query parameters", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://example.com/product?utm_source=alaya&ref=affiliate";
    const result = applyCouponToUrl(url, "SAVE20");

    const parsed = new URL(result);
    expect(parsed.searchParams.get("utm_source")).toBe("alaya");
    expect(parsed.searchParams.get("ref")).toBe("affiliate");
    expect(parsed.searchParams.get("coupon")).toBe("SAVE20");
  });

  it("handles URLs with no query string", async () => {
    const { applyCouponToUrl } = await import("@/lib/backend/affiliate/coupon-autofill");

    const url = "https://example.com";
    const result = applyCouponToUrl(url, "CODE");

    expect(result).toContain("coupon=CODE");
  });
});

describe("Coupon Auto-Fill — autoFillCoupon (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not applied when no productId provided", async () => {
    const { autoFillCoupon } = await import("@/lib/backend/affiliate/coupon-autofill");

    const result = await autoFillCoupon("https://example.com");

    expect(result.applied).toBe(false);
    expect(result.code).toBeNull();
    expect(result.merchantUrl).toBe("https://example.com");
  });

  it("returns not applied when no coupon found", async () => {
    const { autoFillCoupon } = await import("@/lib/backend/affiliate/coupon-autofill");

    const result = await autoFillCoupon("https://example.com", "product-123");

    expect(result.applied).toBe(false);
    expect(result.code).toBeNull();
  });
});

describe("Coupon Auto-Fill — cleanupExpiredCoupons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateMany on expired coupons", async () => {
    const { cleanupExpiredCoupons } = await import("@/lib/backend/affiliate/coupon-autofill");
    const { prisma } = await import("@/lib/db/prisma");

    const count = await cleanupExpiredCoupons();

    expect(prisma.coupon.updateMany).toHaveBeenCalledOnce();
    expect(prisma.coupon.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          active: true,
          expiresAt: expect.any(Object),
        }),
      })
    );
    expect(count).toBe(0);
  });
});
