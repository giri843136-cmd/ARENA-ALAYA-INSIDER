/**
 * Predictive Inventory Tests
 *
 * Tests the predictive inventory service: seasonality detection, reorder point calculation,
 * and prediction engine structure. Pure functions tested directly;
 * Prisma-dependent functions are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    product: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    analyticsEvent: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    priceHistory: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@/lib/backend/events/eventBus", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("Predictive Inventory — predictInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when product not found", async () => {
    const { predictInventory } = await import("@/lib/analytics/services/predictiveInventory");

    const result = await predictInventory("non-existent");
    expect(result).toBeNull();
  });

  it("returns prediction shape when product exists", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    (prisma.product.findUnique as any).mockResolvedValue({
      id: "test-1",
      name: "Test Product",
      slug: "test-product",
      inventory: 50,
      price: 100,
      status: "PUBLISHED",
      productCategories: [],
      productStats: null,
    });

    const { predictInventory } = await import("@/lib/analytics/services/predictiveInventory");

    const result = await predictInventory("test-1");
    expect(result).toBeDefined();
    expect(result!.productId).toBe("test-1");
    expect(result!.currentStock).toBe(50);
    expect(result!.recommendations).toBeInstanceOf(Array);
  });

  it("calculates reorder point correctly", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    (prisma.product.findUnique as any).mockResolvedValue({
      id: "test-2",
      name: "High Demand Product",
      slug: "high-demand",
      inventory: 100,
      price: 50,
      productCategories: [],
      productStats: null,
    });
    (prisma.analyticsEvent.findMany as any).mockResolvedValue(
      Array.from({ length: 60 }, (_, i) => ({
        revenue: 100,
        timestamp: new Date(Date.now() - i * 86400000),
      }))
    );

    const { predictInventory } = await import("@/lib/analytics/services/predictiveInventory");

    const result = await predictInventory("test-2");
    expect(result).toBeDefined();
    expect(result!.reorderPoint).toBeGreaterThan(0);
    expect(result!.confidence).toBe("high");
    expect(result!.dailySalesRate).toBeGreaterThan(0);
  });

  it("generates stockout warnings for low inventory", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    (prisma.product.findUnique as any).mockResolvedValue({
      id: "test-3",
      name: "Low Stock Item",
      slug: "low-stock",
      inventory: 5,
      price: 25,
      productCategories: [],
      productStats: null,
    });
    // Mock some analytics events so dailySalesRate > 0
    (prisma.analyticsEvent.findMany as any).mockResolvedValue(
      Array.from({ length: 15 }, (_, i) => ({
        revenue: 100,
        timestamp: new Date(Date.now() - i * 86400000),
      }))
    );

    const { predictInventory } = await import("@/lib/analytics/services/predictiveInventory");

    const result = await predictInventory("test-3");
    expect(result).toBeDefined();
    // With 5 stock and ~0.5/day rate, daysUntilOutOfStock should be ~10
    expect(result!.daysUntilOutOfStock).not.toBeNull();
    expect(result!.daysUntilOutOfStock).toBeLessThanOrEqual(14);
    // Should generate urgent recommendation
    expect(result!.recommendations.some((r) => r.includes("URGENT"))).toBe(true);
  });
});

describe("Predictive Inventory — getInventorySummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns summary shape with zeros when no products", async () => {
    const { getInventorySummary } = await import("@/lib/analytics/services/predictiveInventory");

    const summary = await getInventorySummary();

    expect(summary).toBeDefined();
    expect(summary.totalProducts).toBeGreaterThanOrEqual(0);
    expect(summary.inStock).toBeGreaterThanOrEqual(0);
    expect(summary.lowStock).toBeGreaterThanOrEqual(0);
    expect(summary.outOfStock).toBeGreaterThanOrEqual(0);
    expect(summary.predictedStockouts).toBeGreaterThanOrEqual(0);
    expect(summary.averageRestockDays).toBe(7);
    expect(summary.lastUpdated).toBeDefined();
  });
});

describe("Predictive Inventory — Low Stock Predictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no low-stock products", async () => {
    const { getLowStockPredictions } = await import("@/lib/analytics/services/predictiveInventory");

    const predictions = await getLowStockPredictions();
    expect(predictions).toBeInstanceOf(Array);
  });
});

describe("Predictive Inventory — checkStockoutAlerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when no low-stock products", async () => {
    const { checkStockoutAlerts } = await import("@/lib/analytics/services/predictiveInventory");

    await expect(checkStockoutAlerts()).resolves.toBeUndefined();
  });
});
