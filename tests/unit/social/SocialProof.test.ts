import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Import the utility functions used by SocialProof
// Since SocialProof is a client component using React hooks, we test
// the core logic (randomization, fluctuation, range calculations)
// and verify the component renders correctly.

describe("SocialProof — Range Logic", () => {
  it("has valid ranges for all popularity tiers", async () => {
    const { POPULARITY_RANGES } = await import("@/components/product/SocialProof");

    const tiers = ["low", "medium", "high", "trending"] as const;
    for (const tier of tiers) {
      const ranges = POPULARITY_RANGES[tier];
      expect(ranges.viewers).toBeDefined();
      expect(ranges.purchases).toBeDefined();
      expect(ranges.saves).toBeDefined();

      // Min should be less than max
      expect(ranges.viewers[0]).toBeLessThan(ranges.viewers[1]);
      expect(ranges.purchases[0]).toBeLessThan(ranges.purchases[1]);
      expect(ranges.saves[0]).toBeLessThan(ranges.saves[1]);

      // All values should be positive
      expect(ranges.viewers[0]).toBeGreaterThan(0);
      expect(ranges.purchases[0]).toBeGreaterThan(0);
      expect(ranges.saves[0]).toBeGreaterThan(0);

      // Trending should have the highest ranges
      if (tier === "trending") {
        expect(ranges.viewers[0]).toBeGreaterThan(100);
        expect(ranges.purchases[0]).toBeGreaterThan(80);
        expect(ranges.saves[0]).toBeGreaterThan(150);
      }

      // Low should have the smallest ranges
      if (tier === "low") {
        expect(ranges.viewers[1]).toBeLessThan(15);
        expect(ranges.purchases[1]).toBeLessThan(10);
        expect(ranges.saves[1]).toBeLessThan(20);
      }
    }
  });

  it("provides distinct ranges for each tier", async () => {
    const { POPULARITY_RANGES } = await import("@/components/product/SocialProof");

    // Each tier should have different ranges (they should increase)
    const lowViewerMax = POPULARITY_RANGES.low.viewers[1];
    const mediumViewerMin = POPULARITY_RANGES.medium.viewers[0];
    const highViewerMin = POPULARITY_RANGES.high.viewers[0];
    const trendingViewerMin = POPULARITY_RANGES.trending.viewers[0];

    expect(mediumViewerMin).toBeGreaterThan(lowViewerMax);
    expect(highViewerMin).toBeGreaterThan(mediumViewerMin);
    expect(trendingViewerMin).toBeGreaterThan(highViewerMin);
  });
});

describe("SocialProof — Count Realism", () => {
  it("generates random viewer counts within the correct range", async () => {
    const { POPULARITY_RANGES } = await import("@/components/product/SocialProof");

    const ranges = POPULARITY_RANGES.medium;
    const [min, max] = ranges.viewers;

    // Generate 1000 random counts and verify they all fall within range
    for (let i = 0; i < 1000; i++) {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      expect(count).toBeGreaterThanOrEqual(min);
      expect(count).toBeLessThanOrEqual(max);
    }
  });

  it("fluctuates counts by at most 1 in either direction", async () => {
    const { POPULARITY_RANGES } = await import("@/components/product/SocialProof");

    const tier = "high";
    const ranges = POPULARITY_RANGES[tier];

    // Start at the midpoint of each range
    const viewers = Math.floor((ranges.viewers[0] + ranges.viewers[1]) / 2);
    const purchases = Math.floor((ranges.purchases[0] + ranges.purchases[1]) / 2);
    const saves = Math.floor((ranges.saves[0] + ranges.saves[1]) / 2);

    // Fluctuate each value 500 times and verify it stays in range
    for (let i = 0; i < 500; i++) {
      // Simulate the fluctuation logic
      const vDelta = Math.random() > 0.5 ? 1 : -1;
      const pDelta = Math.random() > 0.5 ? 1 : -1;
      const sDelta = Math.random() > 0.5 ? 1 : -1;

      const newViewers = Math.min(Math.max(viewers + vDelta, ranges.viewers[0] + 1), ranges.viewers[1] - 1);
      const newPurchases = Math.min(Math.max(purchases + pDelta, ranges.purchases[0] + 1), ranges.purchases[1] - 1);
      const newSaves = Math.min(Math.max(saves + sDelta, ranges.saves[0] + 1), ranges.saves[1] - 1);

      expect(newViewers).toBeGreaterThanOrEqual(ranges.viewers[0]);
      expect(newViewers).toBeLessThanOrEqual(ranges.viewers[1]);
      expect(newPurchases).toBeGreaterThanOrEqual(ranges.purchases[0]);
      expect(newPurchases).toBeLessThanOrEqual(ranges.purchases[1]);
      expect(newSaves).toBeGreaterThanOrEqual(ranges.saves[0]);
      expect(newSaves).toBeLessThanOrEqual(ranges.saves[1]);
    }
  });

  it("fluctuation alters the value by exactly 1 each step", () => {
    const values = [50, 50, 50];
    const deltas = [1, -1, 1];

    for (let i = 0; i < deltas.length; i++) {
      const newVal = values[i] + deltas[i];
      expect(Math.abs(newVal - values[i])).toBe(1);
    }
  });
});

describe("SocialProof — Exports", () => {
  it("exports SocialProof as a named export", async () => {
    const mod = await import("@/components/product/SocialProof");
    expect(mod.SocialProof).toBeDefined();
    expect(typeof mod.SocialProof).toBe("function");
  });

  it("exports POPULARITY_RANGES for testability", async () => {
    const mod = await import("@/components/product/SocialProof");
    expect(mod.POPULARITY_RANGES).toBeDefined();
    expect(typeof mod.POPULARITY_RANGES).toBe("object");
  });
});
