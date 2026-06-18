/**
 * Commission Splitting Tests
 *
 * Tests the commission splitting engine: split calculation, rule management,
 * validation, and edge cases. Pure functions tested directly.
 * Prisma-dependent functions are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    analyticsEvent: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@/lib/backend/security/audit", () => ({
  logSecurityEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock eventBus
vi.mock("@/lib/backend/events/eventBus", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("Commission Splitting — getSplitRules", () => {
  it("returns default split rules", async () => {
    const { getSplitRules } = await import("@/lib/backend/affiliate/commission-splitting");

    const rules = getSplitRules();
    expect(rules.length).toBeGreaterThanOrEqual(3);
  });

  it("each rule has required fields", async () => {
    const { getSplitRules } = await import("@/lib/backend/affiliate/commission-splitting");

    const rules = getSplitRules();
    for (const rule of rules) {
      expect(rule.id).toBeDefined();
      expect(rule.name).toBeDefined();
      expect(rule.splits).toBeInstanceOf(Array);
      expect(rule.type).toMatch(/^(percentage|fixed)$/);
      expect(typeof rule.isActive).toBe("boolean");
    }
  });

  it("percentage rules have splits that sum to 100", async () => {
    const { getSplitRules } = await import("@/lib/backend/affiliate/commission-splitting");

    const rules = getSplitRules().filter((r) => r.type === "percentage");
    for (const rule of rules) {
      const total = rule.splits.reduce((s, e) => s + e.share, 0);
      expect(total).toBe(100);
    }
  });

  it("default rule is Standard 70/20/10", async () => {
    const { getSplitRules } = await import("@/lib/backend/affiliate/commission-splitting");

    const defaultRule = getSplitRules().find((r) => r.id === "default-70-20-10");
    expect(defaultRule).toBeDefined();
    expect(defaultRule!.name).toContain("70/20/10");
  });
});

describe("Commission Splitting — calculateSplit", () => {
  it("calculates 70/20/10 split correctly", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = calculateSplit(100);

    expect(result.totalCommission).toBe(100);
    expect(result.splits).toHaveLength(3);
    expect(result.splits[0].amount).toBe(70);
    expect(result.splits[1].amount).toBe(20);
    expect(result.splits[2].amount).toBe(10);
  });

  it("calculates 80/20 split correctly", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = calculateSplit(200, "default-80-20");

    expect(result.splits).toHaveLength(2);
    expect(result.splits[0].amount).toBe(160);
    expect(result.splits[1].amount).toBe(40);
  });

  it("calculates 50/30/20 split correctly", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = calculateSplit(1000, "default-50-30-20");

    expect(result.splits).toHaveLength(3);
    expect(result.splits[0].amount).toBe(500);
    expect(result.splits[1].amount).toBe(300);
    expect(result.splits[2].amount).toBe(200);
  });

  it("handles zero commission gracefully", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = calculateSplit(0);

    expect(result.totalCommission).toBe(0);
    expect(result.splits.every((s) => s.amount === 0)).toBe(true);
  });

  it("handles fractional commission amounts", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = calculateSplit(99.99, "default-70-20-10");

    expect(result.splits[0].amount).toBe(69.99);
    expect(result.splits[1].amount).toBe(20);
    expect(result.splits[2].amount).toBe(10);
  });

  it("includes rule name in result", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = calculateSplit(100, "default-80-20");

    expect(result.ruleName).toBe("Author Preferred 80/20");
    expect(result.calculatedAt).toBeDefined();
  });

  it("throws error for unknown rule", async () => {
    const { calculateSplit } = await import("@/lib/backend/affiliate/commission-splitting");

    expect(() => calculateSplit(100, "non-existent-rule")).toThrow();
  });
});

describe("Commission Splitting — addSplitRule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a valid percentage split rule", async () => {
    const { addSplitRule, getSplitRules } = await import("@/lib/backend/affiliate/commission-splitting");

    const rule = addSplitRule({
      name: "Test 50/50",
      description: "Test rule",
      splits: [
        { recipientId: "author", recipientType: "author", share: 50 },
        { recipientId: "platform", recipientType: "platform", share: 50 },
      ],
      type: "percentage",
      isActive: true,
    });

    expect(rule.id).toContain("custom-");
    expect(rule.name).toBe("Test 50/50");
    expect(rule.splits).toHaveLength(2);

    // Should appear in getSplitRules
    const rules = getSplitRules();
    expect(rules.find((r) => r.id === rule.id)).toBeDefined();
  });

  it("rejects percentage splits that don't sum to 100", async () => {
    const { addSplitRule } = await import("@/lib/backend/affiliate/commission-splitting");

    expect(() =>
      addSplitRule({
        name: "Invalid Split",
        splits: [
          { recipientId: "author", recipientType: "author", share: 50 },
          { recipientId: "platform", recipientType: "platform", share: 30 },
        ],
        type: "percentage",
        isActive: true,
      })
    ).toThrow("Percentage splits must sum to 100");
  });

  it("allows fixed type splits to have any total", async () => {
    const { addSplitRule } = await import("@/lib/backend/affiliate/commission-splitting");

    const rule = addSplitRule({
      name: "Fixed Split",
      splits: [
        { recipientId: "author", recipientType: "author", share: 10 },
        { recipientId: "platform", recipientType: "platform", share: 5 },
      ],
      type: "fixed",
      isActive: true,
    });

    expect(rule).toBeDefined();
    expect(rule.type).toBe("fixed");
  });
});

describe("Commission Splitting — deactivateSplitRule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deactivates an existing rule", async () => {
    const { deactivateSplitRule, getSplitRules } = await import(
      "@/lib/backend/affiliate/commission-splitting"
    );

    const result = deactivateSplitRule("default-80-20");
    expect(result).toBe(true);

    const rules = getSplitRules();
    expect(rules.find((r) => r.id === "default-80-20")).toBeUndefined();
  });

  it("returns false for non-existent rule", async () => {
    const { deactivateSplitRule } = await import("@/lib/backend/affiliate/commission-splitting");

    const result = deactivateSplitRule("non-existent");
    expect(result).toBe(false);
  });
});

describe("Commission Splitting — getCommissionSummary (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns summary shape with no data", async () => {
    const { getCommissionSummary } = await import("@/lib/backend/affiliate/commission-splitting");

    const summary = await getCommissionSummary(30);

    expect(summary.totalCommission).toBe(0);
    expect(summary.totalEvents).toBe(0);
    expect(summary.periodDays).toBe(30);
    expect(summary.byNetwork).toBeInstanceOf(Array);
    expect(summary.lastUpdated).toBeDefined();
  });
});
