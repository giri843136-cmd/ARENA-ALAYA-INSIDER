/**
 * ALAYA INSIDER — Auto Best Merchant Selector
 * Automatically selects the optimal affiliate link for a product based on:
 * - Commission rate (higher is better)
 * - Link health (healthy > degraded > broken)
 * - Performance metrics (click-through rate, conversion rate)
 * - Merchant priority (configured via affiliatePriority field)
 * - Historical revenue generated
 *
 * Enterprise-grade merchant selection modeled on Skyscanner/Kayak's routing engines.
 */

import { prisma } from "@/lib/db/prisma";
import { cacheAside, cacheInvalidate } from "@/lib/backend/cache/redis-cache";

// =============================================
// TYPES
// =============================================

export interface MerchantScore {
  linkId: string;
  network: string;
  url: string;
  label: string;
  commissionRate: number | null;
  score: number;
  confidence: "high" | "medium" | "low";
  factors: {
    commissionScore: number;
    healthScore: number;
    performanceScore: number;
    priorityScore: number;
    revenueScore: number;
  };
}

export interface BestMerchantResult {
  primary: MerchantScore | null;
  fallback: MerchantScore[];
  alternatives: MerchantScore[];
  selectionMethod: "auto" | "manual" | "fallback";
  selectedAt: string;
}

// =============================================
// SCORING CONFIGURATION
// =============================================

const SCORING_WEIGHTS = {
  commissionRate: 0.30,  // 30% weight
  linkHealth: 0.25,      // 25% weight
  performance: 0.20,     // 20% weight
  priority: 0.15,        // 15% weight
  revenue: 0.10,         // 10% weight
};

const HEALTH_SCORES = {
  HEALTHY: 100,
  DEGRADED: 50,
  NEEDS_REVIEW: 25,
  EXPIRED: 0,
  BROKEN: -50,
};

const MINIMUM_HEALTH_SCORE = 25; // Below this, link is not eligible as primary

// =============================================
// SCORING ENGINE
// =============================================

/**
 * Calculate commission score (0-100)
 * Normalizes commission rate across available links
 */
function calculateCommissionScore(
  rate: number | null,
  maxRate: number
): number {
  if (!rate || maxRate === 0) return 50; // Default middle score if no rate data
  return Math.min(100, (rate / maxRate) * 100);
}

/**
 * Calculate health score (0-100)
 * Based on link health status
 */
function calculateHealthScore(health: string): number {
  const rawScore = HEALTH_SCORES[health as keyof typeof HEALTH_SCORES] ?? 0;
  // Clamp: BROKEN/EXPIRED links get 0, not negative (we filter by MINIMUM_HEALTH_SCORE below)
  return Math.max(0, rawScore);
}

/**
 * Calculate performance score (0-100)
 * Based on click-through rate and conversion metrics
 */
function calculatePerformanceScore(
  clicks: number,
  conversions: number
): number {
  if (clicks === 0) return 50; // Default for new/unused links

  const conversionRate = conversions / clicks;
  const clickVolume = Math.min(100, (clicks / 1000) * 100); // Scale up to 100 at 1000+ clicks

  // Weight: conversion rate 60%, click volume 40%
  return Math.min(100, conversionRate * 60 + clickVolume * 0.4);
}

/**
 * Calculate priority score (0-100)
 * Based on explicit affiliate priority set by admin
 */
function calculatePriorityScore(priority: number): number {
  return Math.min(100, Math.max(0, priority * 10)); // priority 0-10 → score 0-100
}

/**
 * Calculate revenue score (0-100)
 * Based on historical revenue generated through this link
 */
function calculateRevenueScore(revenue: number, maxRevenue: number): number {
  if (maxRevenue === 0) return 50;
  return Math.min(100, (revenue / maxRevenue) * 100);
}

/**
 * Calculate overall merchant score (0-100)
 * Weighted combination of all scoring factors
 */
function calculateOverallScore(factors: {
  commissionScore: number;
  healthScore: number;
  performanceScore: number;
  priorityScore: number;
  revenueScore: number;
}): number {
  return (
    factors.commissionScore * SCORING_WEIGHTS.commissionRate +
    factors.healthScore * SCORING_WEIGHTS.linkHealth +
    factors.performanceScore * SCORING_WEIGHTS.performance +
    factors.priorityScore * SCORING_WEIGHTS.priority +
    factors.revenueScore * SCORING_WEIGHTS.revenue
  );
}

/**
 * Determine confidence level based on score and data quality
 */
function determineConfidence(score: number, hasCommissionData: boolean, hasPerformanceData: boolean): "high" | "medium" | "low" {
  if (score >= 70 && hasCommissionData && hasPerformanceData) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// =============================================
// MAIN SELECTION FUNCTION
// =============================================

/**
 * Select the best merchant for a product based on all scoring factors.
 * Returns the primary link, fallback chain, and alternative options.
 * Results are cached in Redis for 5 minutes.
 */
export async function selectBestMerchant(productId: string): Promise<BestMerchantResult> {
  return cacheAside(
    `merchant:best:${productId}`,
    async () => selectBestMerchantFromDB(productId),
    { ttl: 300, keyPrefix: "alaya" }
  );
}

/**
 * Internal: fetches and scores merchants directly from DB
 */
async function selectBestMerchantFromDB(productId: string): Promise<BestMerchantResult> {
  // Fetch product-level priority alongside affiliate links
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { affiliatePriority: true },
  });

  // Fetch all affiliate links for this product with health data
  const links = await prisma.affiliateLink.findMany({
    where: { productId },
    include: {
      healthLogs: {
        orderBy: { lastChecked: "desc" },
        take: 1,
      },
    },
    orderBy: { version: "desc" },
  });

  const productAffiliatePriority = product?.affiliatePriority || 0;

  if (links.length === 0) {
    return {
      primary: null,
      fallback: [],
      alternatives: [],
      selectionMethod: "manual",
      selectedAt: new Date().toISOString(),
    };
  }

  // Calculate scoring bounds for normalization
  const maxCommissionRate = Math.max(...links.map((l) => Number(l.commissionRate || 0)));
  const maxRevenue = Math.max(...links.map((l) => Number(l.revenue || 0)));

  // Score each merchant link
  const scored: MerchantScore[] = links.map((link) => {
    const health = link.healthLogs[0]?.isWorking === false ? "BROKEN" : link.health;

    const commissionScore = calculateCommissionScore(
      Number(link.commissionRate),
      maxCommissionRate
    );
    const healthScore = calculateHealthScore(health);
    const performanceScore = calculatePerformanceScore(
      link.clicks,
      link.conversions
    );
    const priorityScore = calculatePriorityScore(productAffiliatePriority); // Uses product-level affiliatePriority
    const revenueScore = calculateRevenueScore(
      Number(link.revenue),
      maxRevenue
    );

    const factors = {
      commissionScore,
      healthScore,
      performanceScore,
      priorityScore,
      revenueScore,
    };

    const score = calculateOverallScore(factors);

    return {
      linkId: link.id,
      network: link.network,
      url: link.url,
      label: link.label,
      commissionRate: Number(link.commissionRate),
      score: Math.round(score * 100) / 100,
      confidence: determineConfidence(
        score,
        link.commissionRate !== null,
        link.clicks > 0
      ),
      factors,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Separate into eligible and ineligible
  const eligible = scored.filter((s) => s.factors.healthScore >= MINIMUM_HEALTH_SCORE);
  const ineligible = scored.filter((s) => s.factors.healthScore < MINIMUM_HEALTH_SCORE);

  // Determine selection method
  let selectionMethod: "auto" | "manual" | "fallback" = "auto";

  if (eligible.length === 0 && scored.length > 0) {
    // All links are unhealthy — use best of what's available as fallback
    selectionMethod = "fallback";
    eligible.push(scored[0]); // Highest-scoring link regardless of health
  }

  return {
    primary: eligible[0] || null,
    fallback: eligible.slice(1, 3), // Top 2 fallbacks
    alternatives: ineligible, // Links that need attention
    selectionMethod,
    selectedAt: new Date().toISOString(),
  };
}

/**
 * Get the best available URL for a product — convenience wrapper
 */
export async function getBestAffiliateUrl(productId: string): Promise<{
  url: string;
  label: string;
  network: string;
  score: number;
} | null> {
  const result = await selectBestMerchant(productId);
  if (!result.primary) return null;

  return {
    url: result.primary.url,
    label: result.primary.label,
    network: result.primary.network,
    score: result.primary.score,
  };
}

/**
 * Refresh the best merchant selection for a product and invalidate cache.
 */
export async function refreshBestMerchant(productId: string): Promise<void> {
  // Invalidate stale cache first
  await cacheInvalidate(`merchant:best:${productId}`, { keyPrefix: "alaya" });
  const result = await selectBestMerchantFromDB(productId);

  // Update the product's affiliatePriority to reflect the best merchant score
  if (result.primary) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        affiliatePriority: Math.round(result.primary.score / 10),
      },
    });
  }

  // Log unhealthy links for attention
  for (const alt of result.alternatives) {
    if (alt.factors.healthScore < MINIMUM_HEALTH_SCORE) {
      console.warn(
        `[MerchantSelector] Unhealthy link: ${alt.network} (${alt.linkId}) — score: ${alt.score}`
      );
    }
  }
}

/**
 * Batch refresh best merchants for all products (for cron jobs)
 */
/**
 * Process products in batches with concurrency control
 */
async function processBatch<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>
): Promise<string[]> {
  const warnings: string[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((item) => fn(item))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "rejected") {
        const item = batch[j];
        warnings.push(`Failed: ${JSON.stringify(item)}: ${result.reason}`);
      }
    }
  }

  return warnings;
}

/**
 * Batch refresh best merchants for all products (for cron jobs)
 * Processes in batches of 10 to balance speed and DB load
 */
export async function refreshAllBestMerchants(): Promise<{
  updated: number;
  warnings: string[];
}> {
  const products = await prisma.product.findMany({
    where: {
      affiliateLinks: { some: {} },
      status: "PUBLISHED",
    },
    select: { id: true, slug: true },
  });

  let updated = 0;

  const warnings = await processBatch(products, 10, async (product) => {
    await refreshBestMerchant(product.id);
    updated++;
  });

  return { updated, warnings };
}

/**
 * Recommendation: Cache results in Redis with 5-minute TTL.
 * Key pattern: `product:best-merchant:{productId}`
 * Invalidate on: affiliate link update, price change, health check
 */
