/**
 * ALAYA INSIDER — Coupon Auto-Fill Service
 * Automatically detects and applies available coupon codes when users
 * click affiliate links. Integrates with the redirect system to pass
 * coupon parameters to merchant URLs.
 */

import { prisma } from "@/lib/db/prisma";
import { cacheAside, cacheInvalidatePattern } from "@/lib/backend/cache/redis-cache";

export interface CouponAutoFillResult {
  applied: boolean;
  code: string | null;
  discount: number | null;
  discountType: "percent" | "fixed" | null;
  merchantUrl: string;
  expiresAt: string | null;
  savings: number | null;
}

/**
 * Find the best available coupon for a product based on:
 * - Active status
 * - Not expired
 * - Highest discount value
 */
export async function findBestCoupon(productId: string): Promise<{
  code: string;
  discount: number | null;
  type: string;
  expiresAt: Date | null;
} | null> {
  return cacheAside(
    `coupon:best:${productId}`,
    async () => findBestCouponFromDB(productId),
    { ttl: 120, keyPrefix: "alaya" } // 2 min TTL — coupons change less frequently
  );
}

/**
 * Internal: queries DB for best coupon
 */
async function findBestCouponFromDB(productId: string): Promise<{
  code: string;
  discount: number | null;
  type: string;
  expiresAt: Date | null;
} | null> {
  const now = new Date();

  // Find coupons that are directly linked to this product
  const productCoupons = await prisma.coupon.findMany({
    where: {
      active: true,
      products: { some: { id: productId } },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { discount: "desc" },
    take: 5,
  });

  if (productCoupons.length > 0) {
    const best = productCoupons[0];
    return {
      code: best.code,
      discount: Number(best.discount),
      type: best.type,
      expiresAt: best.expiresAt,
    };
  }

  // Fallback: find any active global coupon
  const globalCoupon = await prisma.coupon.findFirst({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { discount: "desc" },
  });

  if (globalCoupon) {
    return {
      code: globalCoupon.code,
      discount: Number(globalCoupon.discount),
      type: globalCoupon.type,
      expiresAt: globalCoupon.expiresAt,
    };
  }

  return null;
}

/**
 * Apply coupon code to a merchant URL.
 * Appends coupon parameter based on known merchant URL patterns.
 */
export function applyCouponToUrl(url: string, couponCode: string): string {
  const urlObj = new URL(url);

  // Network-specific coupon parameter patterns
  const couponParams: Record<string, string> = {
    "amazon.com": "coupon",
    "amazon.": "coupon",
    "walmart.com": "couponCode",
    "target.com": "coupon",
    "ebay.com": "coupon",
    "etsy.com": "code",
    "shopify.com": "discount",
    "bestbuy.com": "couponcode",
    "homedepot.com": "coupon",
    "lowes.com": "promo",
  };

  // Detect merchant from URL
  const hostname = urlObj.hostname.toLowerCase();
  let paramName = "coupon"; // Default parameter

  for (const [domain, param] of Object.entries(couponParams)) {
    if (hostname.includes(domain)) {
      paramName = param;
      break;
    }
  }

  // Append or update the coupon parameter
  urlObj.searchParams.set(paramName, couponCode);

  return urlObj.toString();
}

/**
 * Auto-fill a coupon for a product's affiliate link.
 * Returns the updated URL with coupon appended and coupon details.
 */
export async function autoFillCoupon(
  affiliateUrl: string,
  productId?: string
): Promise<CouponAutoFillResult> {
  const result: CouponAutoFillResult = {
    applied: false,
    code: null,
    discount: null,
    discountType: null,
    merchantUrl: affiliateUrl,
    expiresAt: null,
    savings: null,
  };

  if (!productId) {
    return result;
  }

  const coupon = await findBestCoupon(productId);

  if (!coupon) {
    return result;
  }

  const updatedUrl = applyCouponToUrl(affiliateUrl, coupon.code);

  return {
    applied: true,
    code: coupon.code,
    discount: coupon.discount,
    discountType: coupon.type as "percent" | "fixed",
    merchantUrl: updatedUrl,
    expiresAt: coupon.expiresAt?.toISOString() || null,
    savings: coupon.discount || null,
  };
}

/**
 * Clear expired coupons in bulk (for cron job)
 */
export async function cleanupExpiredCoupons(): Promise<number> {
  const result = await prisma.coupon.updateMany({
    where: {
      active: true,
      expiresAt: { lt: new Date() },
    },
    data: { active: false },
  });

  // Invalidate all cached coupon results after cleanup
  await cacheInvalidatePattern(`coupon:best:*`, { keyPrefix: "alaya" }).catch(() => {});

  return result.count;
}
