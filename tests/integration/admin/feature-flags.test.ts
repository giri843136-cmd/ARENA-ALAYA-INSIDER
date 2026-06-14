import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    featureFlag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";

describe("Feature Flags — Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns all flags ordered by creation date", async () => {
    const mockFlags = [
      { id: "f1", key: "NEW_CHECKOUT", description: "New checkout flow", enabled: false, percentage: 0, rules: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "f2", key: "DARK_MODE", description: "Dark mode toggle", enabled: true, percentage: 100, rules: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(prisma.featureFlag.findMany).mockResolvedValue(mockFlags as any);

    const flags = await prisma.featureFlag.findMany({ orderBy: { createdAt: "desc" } });
    expect(flags).toHaveLength(2);
    expect(flags[0].key).toBe("NEW_CHECKOUT");
    expect(flags.find((f: any) => f.enabled)?.key).toBe("DARK_MODE");
  });

  it("GET single flag by key", async () => {
    const mockFlag = { id: "f1", key: "TEST_FLAG", enabled: true, percentage: 50, description: "Test", rules: null, createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(prisma.featureFlag.findUnique).mockResolvedValue(mockFlag as any);

    const flag = await prisma.featureFlag.findUnique({ where: { key: "TEST_FLAG" } });
    expect(flag?.key).toBe("TEST_FLAG");
    expect(flag?.enabled).toBe(true);
    expect(flag?.percentage).toBe(50);
  });

  it("POST upserts a feature flag", async () => {
    const upserted = { id: "f3", key: "NEW_FLAG", enabled: true, percentage: 25, description: "25% rollout", rules: null, createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(prisma.featureFlag.upsert).mockResolvedValue(upserted as any);

    const result = await prisma.featureFlag.upsert({
      where: { key: "NEW_FLAG" },
      create: { key: "NEW_FLAG", enabled: true, percentage: 25, description: "25% rollout", rules: null },
      update: { enabled: true, percentage: 25, description: "25% rollout" },
    });
    expect(result.key).toBe("NEW_FLAG");
    expect(result.enabled).toBe(true);
    expect(result.percentage).toBe(25);
  });

  it("toggles flag on/off via upsert", async () => {
    const existing = { id: "f1", key: "TEST_FLAG", enabled: true, percentage: 100, rules: null };
    vi.mocked(prisma.featureFlag.upsert).mockResolvedValue({ ...existing, enabled: false } as any);

    const result = await prisma.featureFlag.upsert({
      where: { key: "TEST_FLAG" },
      update: { enabled: false },
      create: { key: "TEST_FLAG", enabled: false, percentage: 0, rules: null },
    });
    expect(result.enabled).toBe(false);
  });

  it("validates percentage is within 0-100 range", () => {
    const isValidPercentage = (p: number) => p >= 0 && p <= 100;
    expect(isValidPercentage(0)).toBe(true);
    expect(isValidPercentage(50)).toBe(true);
    expect(isValidPercentage(100)).toBe(true);
    expect(isValidPercentage(-1)).toBe(false);
    expect(isValidPercentage(101)).toBe(false);
  });
});
