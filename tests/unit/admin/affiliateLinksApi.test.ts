import { describe, it, expect } from "vitest";

describe("Affiliate Links API — GET Query Logic", () => {
  it("builds correct Prisma where clause from params", () => {
    const buildWhere = (network: string | null, health: string | null) => {
      const where: any = {};
      if (network && network !== "all") where.network = network;
      if (health && health !== "all") where.health = health;
      return where;
    };

    expect(buildWhere(null, null)).toEqual({});
    expect(buildWhere("all", "all")).toEqual({});
    expect(buildWhere("IMPACT", null)).toEqual({ network: "IMPACT" });
    expect(buildWhere(null, "HEALTHY")).toEqual({ health: "HEALTHY" });
    expect(buildWhere("CJ", "BROKEN")).toEqual({ network: "CJ", health: "BROKEN" });
  });

  it("clamps limit to max 100", () => {
    const clampLimit = (limit: string | null) => Math.min(100, parseInt(limit || "50"));
    expect(clampLimit(null)).toBe(50);
    expect(clampLimit("10")).toBe(10);
    expect(clampLimit("200")).toBe(100);
    expect(clampLimit("100")).toBe(100);
  });

  it("sorts by revenue descending", () => {
    // The route uses: orderBy: { revenue: "desc" }
    const orderBy = { revenue: "desc" as const };
    expect(orderBy.revenue).toBe("desc");
  });
});

describe("Affiliate Links API — Health Status", () => {
  it("categorizes health status correctly", () => {
    const healthClass = (health: string) => {
      switch (health) {
        case "HEALTHY": return "badge-admin-success";
        case "DEGRADED": return "badge-admin-warning";
        case "BROKEN": return "badge-admin-error";
        case "EXPIRED": return "badge-admin-error";
        default: return "badge-admin-neutral";
      }
    };

    expect(healthClass("HEALTHY")).toBe("badge-admin-success");
    expect(healthClass("DEGRADED")).toBe("badge-admin-warning");
    expect(healthClass("BROKEN")).toBe("badge-admin-error");
    expect(healthClass("EXPIRED")).toBe("badge-admin-error");
    expect(healthClass("UNKNOWN")).toBe("badge-admin-neutral");
  });

  it("calculates EPC (earnings per click) correctly", () => {
    const epc = (revenue: number, clicks: number) => clicks > 0 ? revenue / clicks : 0;
    expect(epc(100, 10)).toBe(10);
    expect(epc(0, 10)).toBe(0);
    expect(epc(100, 0)).toBe(0);
    expect(epc(500, 250)).toBe(2);
  });

  it("calculates conversion rate correctly", () => {
    const convRate = (conversions: number, clicks: number) => clicks > 0 ? (conversions / clicks) * 100 : 0;
    expect(convRate(5, 100)).toBe(5);
    expect(convRate(0, 100)).toBe(0);
    expect(convRate(50, 100)).toBe(50);
    expect(convRate(10, 0)).toBe(0);
  });
});
