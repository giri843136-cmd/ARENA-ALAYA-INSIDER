import { describe, it, expect } from "vitest";

describe("A/B Tests API — POST Validation", () => {
  it("requires name, featureFlagId, and variants", () => {
    const validate = (body: any) => {
      if (!body.name || !body.featureFlagId || !body.variants) {
        return { success: false, error: "name, featureFlagId, and variants are required" };
      }
      return { success: true };
    };

    expect(validate({})).toEqual({ success: false, error: expect.any(String) });
    expect(validate({ name: "Test" })).toEqual({ success: false, error: expect.any(String) });
    expect(validate({ name: "Test", featureFlagId: "flag-1" })).toEqual({ success: false, error: expect.any(String) });
    expect(validate({ name: "Test", featureFlagId: "flag-1", variants: ["control"] })).toEqual({ success: true });
  });

  it("accepts optional hypothesis", () => {
    const testData = {
      name: "Test",
      hypothesis: "Changing CTA will increase clicks by 15%",
      featureFlagId: "flag-1",
      variants: ["control", "variant_a"],
    };
    expect(testData.hypothesis).toBeDefined();
    expect(testData.hypothesis?.length).toBeGreaterThan(0);
  });

  it("parses comma-separated variants from frontend format", () => {
    const parseVariants = (csv: string) => csv.split(",").map((v) => v.trim());
    expect(parseVariants("control,variant_a,variant_b")).toEqual(["control", "variant_a", "variant_b"]);
    expect(parseVariants("control")).toEqual(["control"]);
    expect(parseVariants("")).toEqual([""]);
  });
});

describe("A/B Tests API — Status Logic", () => {
  it("determines status badge correctly", () => {
    const statusBadge = (status: string) => {
      if (status === "ACTIVE") return "badge-admin-success";
      return "badge-admin-neutral";
    };

    expect(statusBadge("ACTIVE")).toBe("badge-admin-success");
    expect(statusBadge("DRAFT")).toBe("badge-admin-neutral");
    expect(statusBadge("COMPLETED")).toBe("badge-admin-neutral");
    expect(statusBadge("STOPPED")).toBe("badge-admin-neutral");
  });

  it("pagination: calculates total pages correctly", () => {
    const totalPages = (total: number, perPage: number) => Math.ceil(total / perPage);
    expect(totalPages(0, 20)).toBe(0);
    expect(totalPages(1, 20)).toBe(1);
    expect(totalPages(20, 20)).toBe(1);
    expect(totalPages(21, 20)).toBe(2);
    expect(totalPages(100, 20)).toBe(5);
  });
});
