/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * ALAYA INSIDER — Predictive Inventory Service
 * Uses historical sales data, seasonality patterns, and trend analysis to
 * predict when products will go out of stock and recommend reorder points.
 *
 * In production, this would integrate with merchant APIs for real-time stock data.
 * This implementation provides the framework and simulation engine.
 */

import { prisma } from "@/lib/db/prisma";
import { publishEvent } from "@/lib/backend/events/eventBus";

// =============================================
// TYPES
// =============================================

export interface InventoryPrediction {
  productId: string;
  productName: string;
  productSlug: string;
  currentStock: number | null;
  dailySalesRate: number;
  daysUntilOutOfStock: number | null;
  predictedStockoutDate: string | null;
  reorderPoint: number;
  confidence: "high" | "medium" | "low";
  factors: {
    salesVelocity: "increasing" | "stable" | "declining";
    seasonality: string | null;
    trend: number; // positive = growing demand
    priceElasticity: number;
  };
  recommendations: string[];
}

export interface InventorySummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  predictedStockouts: number; // Next 30 days
  averageRestockDays: number;
  lastUpdated: string;
}

// =============================================
// PREDICTION ENGINE
// =============================================

/**
 * Calculate daily sales rate from historical order events
 */
async function calculateDailySalesRate(productId: string): Promise<{
  rate: number;
  velocity: "increasing" | "stable" | "declining";
  trend: number;
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000);

  // Get click/conversion events as a proxy for sales
  const [recentEvents, olderEvents] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        entityId: productId,
        entityType: "product",
        timestamp: { gte: thirtyDaysAgo },
      },
      select: { revenue: true, timestamp: true },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        entityId: productId,
        entityType: "product",
        timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
      select: { revenue: true, timestamp: true },
    }),
  ]);

  const recentCount = recentEvents.length;
  const olderCount = olderEvents.length;

  const dailyRate = recentCount / 30;
  const olderDailyRate = olderCount / 30;

  let velocity: "increasing" | "stable" | "declining" = "stable";
  if (dailyRate > olderDailyRate * 1.2) velocity = "increasing";
  else if (dailyRate < olderDailyRate * 0.8) velocity = "declining";

  // Trend: positive = growing, negative = shrinking
  const trend = olderDailyRate > 0
    ? ((dailyRate - olderDailyRate) / olderDailyRate) * 100
    : 0;

  return { rate: dailyRate, velocity, trend };
}

/**
 * Detect seasonality for a product based on category
 */
async function detectSeasonality(productId: string): Promise<{
  season: string | null;
  factor: number; // 0.5-2.0 multiplier
}> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      season: true,
      productCategories: {
        include: { category: { select: { name: true } } },
        take: 1,
      },
    },
  });

  if (!product) return { season: null, factor: 1.0 };

  const categoryName = product.season ||
    product.productCategories[0]?.category?.name || "";

  const now = new Date();
  const month = now.getMonth();
  const season = getSeason(month);

  // Seasonality multipliers by category
  const seasonalMultipliers: Record<string, Record<string, number>> = {
    bedding: { spring: 1.3, summer: 1.1, fall: 1.4, winter: 1.6 },
    throws: { spring: 0.8, summer: 0.6, fall: 1.5, winter: 1.8 },
    cookware: { spring: 1.1, summer: 1.3, fall: 1.2, winter: 1.0 },
    lighting: { spring: 1.0, summer: 0.9, fall: 1.1, winter: 1.3 },
    vases: { spring: 1.5, summer: 1.2, fall: 1.0, winter: 0.8 },
    // Default: no strong seasonality
  };

  const catLower = categoryName.toLowerCase();
  let factor = 1.0;

  for (const [cat, seasons] of Object.entries(seasonalMultipliers)) {
    if (catLower.includes(cat)) {
      factor = seasons[season] || 1.0;
      break;
    }
  }

  return { season, factor };
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

/**
 * Calculate reorder point based on lead time, safety stock, and demand
 */
function calculateReorderPoint(
  dailyRate: number,
  leadTimeDays: number = 7,
  safetyFactor: number = 1.5
): number {
  const leadTimeDemand = dailyRate * leadTimeDays;
  const safetyStock = dailyRate * safetyFactor;
  return Math.ceil(leadTimeDemand + safetyStock);
}

/**
 * Predict inventory status for a single product
 */
export async function predictInventory(
  productId: string
): Promise<InventoryPrediction | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      productStats: true,
    },
  });

  if (!product) return null;

  const currentStock = product.inventory ?? 0;
  const { rate, velocity, trend } = await calculateDailySalesRate(productId);
  const { season, factor } = await detectSeasonality(productId);

  // Adjust sales rate for seasonality
  const adjustedRate = rate * factor;

  // Calculate days until stockout
  const daysUntilOutOfStock =
    adjustedRate > 0 ? Math.floor(currentStock / adjustedRate) : null;

  const predictedStockoutDate =
    daysUntilOutOfStock !== null && daysUntilOutOfStock < 365
      ? new Date(Date.now() + daysUntilOutOfStock * 86400000).toISOString()
      : null;

  const reorderPoint = calculateReorderPoint(adjustedRate);

  // Confidence based on data quality
  const confidence: "high" | "medium" | "low" =
    rate > 1 && currentStock > 0
      ? "high"
      : rate > 0
        ? "medium"
        : "low";

  // Generate recommendations
  const recommendations: string[] = [];

  if (daysUntilOutOfStock !== null && daysUntilOutOfStock <= 14) {
    recommendations.push(
      `URGENT: Restock within ${daysUntilOutOfStock} days — current stock (${currentStock}) will sell out at current rate (${adjustedRate.toFixed(1)}/day)`
    );
  } else if (daysUntilOutOfStock !== null && daysUntilOutOfStock <= 30) {
    recommendations.push(
      `Restock within ${daysUntilOutOfStock} days to avoid stockout`
    );
  }

  if (currentStock <= reorderPoint && currentStock > 0) {
    recommendations.push(
      `Below reorder point (${currentStock} < ${reorderPoint}) — consider ordering now`
    );
  }

  if (velocity === "increasing" && season) {
    recommendations.push(
      `Demand growing (${trend.toFixed(1)}% increase) — consider increasing safety stock for ${season} season`
    );
  }

  if (currentStock === 0) {
    recommendations.push("Product is out of stock — prioritize restock");
  }

  if (factor > 1.2) {
    recommendations.push(
      `Seasonal demand detected (${season}: ${(factor * 100).toFixed(0)}% of baseline) — plan inventory accordingly`
    );
  }

  // Price elasticity: estimate how price changes affect demand
  const priceElasticity = product.price
    ? await calculatePriceElasticity(productId, Number(product.price))
    : 0;

  return {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    currentStock,
    dailySalesRate: Math.round(adjustedRate * 100) / 100,
    daysUntilOutOfStock,
    predictedStockoutDate,
    reorderPoint,
    confidence,
    factors: {
      salesVelocity: velocity,
      seasonality: season,
      trend: Math.round(trend * 100) / 100,
      priceElasticity,
    },
    recommendations,
  };
}

/**
 * Estimate price elasticity by comparing historical price changes to sales
 */
async function calculatePriceElasticity(
  productId: string,
  _currentPrice: number
): Promise<number> {
  const priceHistory = await prisma.priceHistory.findMany({
    where: { productId },
    orderBy: { recordedAt: "desc" },
    take: 10,
  });

  if (priceHistory.length < 4) return 0; // Not enough data

  // Simple elasticity: % change in demand / % change in price
  // Using events as demand proxy
  let count = 0;

  for (let i = 0; i < priceHistory.length - 1; i++) {
    const oldPrice = Number(priceHistory[i + 1].price);
    const newPrice = Number(priceHistory[i].price);
    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100;

    if (Math.abs(priceChange) < 1) continue; // Skip negligible changes

    // Estimate demand from events between the two price points
    count++;
  }

  // TODO: Implement full price elasticity calculation using demand events
  // For now, return a neutral value indicating unit elasticity
  return count > 0 ? -1.0 : 0;
}

/**
 * Get inventory summary for admin dashboard
 */
export async function getInventorySummary(): Promise<InventorySummary> {
  const [totalProducts, inStock, lowStock, outOfStock, predictions] =
    await Promise.all([
      prisma.product.count({
        where: { status: "PUBLISHED", deletedAt: null },
      }),
      prisma.product.count({
        where: {
          status: "PUBLISHED",
          inventory: { gt: 10 },
          deletedAt: null,
        },
      }),
      prisma.product.count({
        where: {
          status: "PUBLISHED",
          inventory: { gt: 0, lte: 10 },
          deletedAt: null,
        },
      }),
      prisma.product.count({
        where: {
          OR: [
            { inventory: 0 },
            { availability: "OUT_OF_STOCK" },
          ],
          deletedAt: null,
        },
      }),
      // Predict stockouts for next 30 days
      prisma.product.findMany({
        where: { inventory: { gt: 0 }, deletedAt: null },
        select: { id: true, name: true, inventory: true },
      }),
    ]);

  let predictedStockouts = 0;
  for (const p of predictions) {
    const pred = await predictInventory(p.id);
    if (pred && pred.daysUntilOutOfStock !== null && pred.daysUntilOutOfStock <= 30) {
      predictedStockouts++;
    }
  }

  return {
    totalProducts,
    inStock,
    lowStock,
    outOfStock,
    predictedStockouts,
    averageRestockDays: 7, // Configurable default
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get predictions for all low-stock products
 */
export async function getLowStockPredictions(): Promise<InventoryPrediction[]> {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      inventory: { not: null, lte: 20 },
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: { inventory: "asc" },
    take: 50,
  });

  const predictions: InventoryPrediction[] = [];

  for (const product of lowStockProducts) {
    const prediction = await predictInventory(product.id);
    if (prediction) predictions.push(prediction);
  }

  return predictions.sort(
    (a, b) => (a.daysUntilOutOfStock ?? 999) - (b.daysUntilOutOfStock ?? 999)
  );
}

/**
 * Trigger alerts for products predicted to stock out soon
 */
export async function checkStockoutAlerts(): Promise<void> {
  const lowStock = await getLowStockPredictions();

  for (const pred of lowStock) {
    if (pred.daysUntilOutOfStock !== null && pred.daysUntilOutOfStock <= 7) {
      await (publishEvent as any)("inventory.stockout_warning", {
        productId: pred.productId,
        productName: pred.productName,
        daysUntilOutOfStock: pred.daysUntilOutOfStock,
        currentStock: pred.currentStock,
        dailySalesRate: pred.dailySalesRate,
      });
    }
  }
}
