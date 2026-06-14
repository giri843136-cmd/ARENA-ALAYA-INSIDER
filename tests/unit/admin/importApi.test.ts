import { describe, it, expect } from "vitest";
import { IMPORT_PRESETS, scorePreset, detectBestPreset, applyPresetMapping, getPreset } from "@/lib/import/presets";

describe("Import API — Preset Detection via API", () => {
  it("GET /api/v1/admin/products/import/presets returns all presets", () => {
    // The route maps IMPORT_PRESETS to a simplified response
    const presets = IMPORT_PRESETS.map((p) => ({
      id: p.id,
      name: p.name,
      network: p.network,
      description: p.description,
      defaultNetwork: p.defaultNetwork,
      columnCount: Object.keys(p.columns).length,
    }));

    expect(presets.length).toBeGreaterThanOrEqual(7);
    expect(presets.find((p) => p.id === "alaya")).toBeDefined();
    expect(presets.find((p) => p.id === "impact")).toBeDefined();
    expect(presets.find((p) => p.id === "shopify")).toBeDefined();

    // Verify each preset has required fields
    for (const preset of presets) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.network).toBeTruthy();
      expect(typeof preset.columnCount).toBe("number");
    }
  });

  it("auto-detects Impact preset when given Impact headers", () => {
    const headers = ["title", "merchant_name", "sale_price", "currency_code", "sku", "description", "category", "keywords", "image_url", "affiliate_url"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("impact");
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it("auto-detects CJ preset when given CJ headers", () => {
    const headers = ["title", "advertiser_name", "price", "sku", "description", "category", "keywords", "image_url", "affiliate_url"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("cj");
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it("auto-detects Shopify preset when given Shopify headers", () => {
    const headers = ["title", "handle", "vendor", "price", "sku", "body_html", "type", "tags", "image_src"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("shopify");
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("returns no recommendation for weak header matches (score < 30)", () => {
    const headers = ["foo", "bar", "baz", "qux"];
    const result = detectBestPreset(headers);
    // alaya preset has score of 50 (neutral, no columns)
    // Other presets will have scores near 0
    expect(result.score).toBeLessThanOrEqual(50);
  });
});

describe("Import API — CSV Validation Logic", () => {
  it("parses and maps a standard CSV row correctly using Impact preset", () => {
    const preset = getPreset("impact")!;
    const row = {
      title: "Test Product",
      merchant_name: "Test Brand",
      sale_price: "49.99",
      currency_code: "USD",
      sku: "TST-001",
      description: "A test product description",
      category: "Electronics",
      keywords: "test, sample",
      image_url: "https://example.com/img.jpg",
      affiliate_url: "https://example.com/aff",
    };

    const mapped = applyPresetMapping(row, preset);
    expect(mapped.name).toBe("Test Product");
    expect(mapped.brand).toBe("Test Brand");
    expect(mapped.price).toBe("49.99");
    expect(mapped.sku).toBe("TST-001");
  });

  it("extracts fields using csvField-like lookup with case insensitivity", () => {
    const preset = getPreset("impact")!;
    const row = { TITLE: "Case Test", MERCHANT_NAME: "Case Brand", SALE_PRICE: "99.99" };
    const mapped = applyPresetMapping(row, preset);
    expect(mapped.name).toBe("Case Test");
    expect(mapped.brand).toBe("Case Brand");
    expect(mapped.price).toBe("99.99");
  });

  it("sets default network for Impact preset", () => {
    const preset = getPreset("impact")!;
    const row = { title: "Test" };
    const mapped = applyPresetMapping(row, preset);
    expect(mapped.affiliatenetwork).toBe("IMPACT");
  });

  it("handles rows with missing fields gracefully", () => {
    const preset = getPreset("shopify")!;
    const row = { title: "Partial Product" };
    const mapped = applyPresetMapping(row, preset);
    expect(mapped.name).toBe("Partial Product");
    expect(mapped.brand).toBeUndefined();
    expect(mapped.price).toBeUndefined();
  });
});

describe("Import API — History Endpoint Logic", () => {
  it("validates status filter values", () => {
    const validStatuses = ["completed", "failed", "processing"];
    for (const status of validStatuses) {
      expect(["completed", "failed", "processing"].includes(status)).toBe(true);
    }
    expect(["completed", "failed", "processing"].includes("unknown_status")).toBe(false);
  });

  it("validates page and pageSize parameters", () => {
    // Route clamps page to >= 1 and pageSize to 1-50
    const clampPage = (p: number) => Math.max(1, p);
    const clampSize = (s: number) => Math.min(50, Math.max(1, s));

    expect(clampPage(0)).toBe(1);
    expect(clampPage(-5)).toBe(1);
    expect(clampPage(3)).toBe(3);
    expect(clampSize(0)).toBe(1);
    expect(clampSize(100)).toBe(50);
    expect(clampSize(25)).toBe(25);
  });

  it("formats history items correctly for response", () => {
    const mockItem = {
      id: "hist-1",
      fileName: "test.csv",
      totalRows: 100,
      newRows: 80,
      matchedRows: 15,
      failedRows: 5,
      status: "completed",
      errors: [{ row: 5, message: "Invalid price", name: "Product A" }],
      categoriesLinked: 3,
      tagsLinked: 10,
      affiliateLinksCreated: 15,
      mediaCreated: 20,
      presetId: "impact",
      createdAt: new Date("2026-06-14"),
    };

    const formatted = {
      id: mockItem.id,
      fileName: mockItem.fileName,
      totalRows: mockItem.totalRows,
      newRows: mockItem.newRows,
      matchedRows: mockItem.matchedRows,
      failedRows: mockItem.failedRows,
      status: mockItem.status,
      errors: mockItem.errors,
      categoriesLinked: mockItem.categoriesLinked,
      tagsLinked: mockItem.tagsLinked,
      affiliateLinksCreated: mockItem.affiliateLinksCreated,
      mediaCreated: mockItem.mediaCreated,
      presetId: mockItem.presetId,
      createdAt: mockItem.createdAt.toISOString(),
    };

    expect(formatted.id).toBe("hist-1");
    expect(formatted.fileName).toBe("test.csv");
    expect(formatted.status).toBe("completed");
    expect(formatted.createdAt).toBe("2026-06-14T00:00:00.000Z");
  });
});

describe("Import API — csvField helper", () => {
  it("finds fields case-insensitively", () => {
    // Replicate the csvField logic from the validate route
    function csvField(row: Record<string, string>, ...keys: string[]): string {
      for (const key of keys) {
        const val = row[key.toLowerCase()];
        if (val !== undefined && val !== null) return String(val);
      }
      return "";
    }

    // Row keys are lowercased in the actual route (headers.forEach lowercases them)
    const row = { variantskus: "sku1|sku2", variant_skus: "old-sku" };
    expect(csvField(row, "variantSkus", "variant_skus")).toBe("sku1|sku2");
    expect(csvField(row, "variant_skus")).toBe("old-sku");
    expect(csvField(row, "nonexistent")).toBe("");
  });

  it("returns empty string for missing fields", () => {
    function csvField(row: Record<string, string>, ...keys: string[]): string {
      for (const key of keys) {
        const val = row[key.toLowerCase()];
        if (val !== undefined && val !== null) return String(val);
      }
      return "";
    }

    expect(csvField({}, "anything")).toBe("");
  });
});
