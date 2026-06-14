import { describe, it, expect, vi, afterEach } from "vitest";
import {
  IMPORT_PRESETS,
  getPreset,
  scorePreset,
  detectBestPreset,
  applyPresetMapping,
  createCustomPreset,
} from "@/lib/import/presets";

/**
 * Import Preset Tests
 *
 * Tests the preset detection, scoring, column mapping, and custom preset
 * creation logic used by the CSV import system.
 */

describe("Import Presets", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("IMPORT_PRESETS", () => {
    it("has 7 built-in presets", () => {
      expect(IMPORT_PRESETS).toHaveLength(7);
    });

    it("has the alaya preset as the first entry", () => {
      expect(IMPORT_PRESETS[0].id).toBe("alaya");
    });

    it("all presets have required fields", () => {
      for (const p of IMPORT_PRESETS) {
        expect(p.id).toBeDefined();
        expect(p.name).toBeDefined();
        expect(p.network).toBeDefined();
        expect(p.description).toBeDefined();
        expect(p.columns).toBeDefined();
      }
    });
  });

  describe("getPreset", () => {
    it("finds a preset by ID", () => {
      const impact = getPreset("impact");
      expect(impact).toBeDefined();
      expect(impact?.name).toBe("Impact Radius");
    });

    it("returns undefined for unknown IDs", () => {
      expect(getPreset("nonexistent")).toBeUndefined();
    });
  });

  describe("scorePreset", () => {
    it("returns 100 for a perfect match with all columns", () => {
      const preset = getPreset("impact")!;
      // Every column in the Impact preset mapping
      const impactColumns = Object.values(preset.columns).filter(Boolean) as string[];
      const score = scorePreset(preset, impactColumns);
      expect(score).toBe(100);
    });

    it("returns a partial score for some matching columns", () => {
      const preset = getPreset("impact")!;
      const headers = ["title", "merchant_name", "sale_price", "sku", "category"];
      const score = scorePreset(preset, headers);
      // 5 out of ~9 columns found
      expect(score).toBeGreaterThan(40);
      expect(score).toBeLessThan(100);
    });

    it("returns 0 for no match", () => {
      const preset = getPreset("impact")!;
      const headers = ["random", "headers", "not", "matching"];
      const score = scorePreset(preset, headers);
      expect(score).toBe(0);
    });

    it("returns 50 for the alaya preset (no columns to match)", () => {
      const preset = getPreset("alaya")!;
      const score = scorePreset(preset, ["any", "headers"]);
      expect(score).toBe(50);
    });

    it("is case-insensitive when matching headers", () => {
      const preset = getPreset("impact")!;
      const headers = ["TITLE", "MERCHANT_NAME", "SALE_PRICE"];
      const score = scorePreset(preset, headers);
      // 3 out of 12 columns matched => (3/12)*100 = 25
      expect(score).toBeGreaterThanOrEqual(20);
      expect(score).toBeLessThan(50);
    });
  });

  describe("detectBestPreset", () => {
    it("detects Impact preset from typical Impact headers", () => {
      const headers = [
        "title", "merchant_name", "sale_price", "sku",
        "description", "category", "image_url", "affiliate_url",
      ];
      const result = detectBestPreset(headers);
      expect(result.preset.id).toBe("impact");
      expect(result.score).toBeGreaterThan(60);
    });

    it("detects CJ preset from typical CJ headers", () => {
      const headers = ["title", "advertiser_name", "price", "sku", "description", "keywords"];
      const result = detectBestPreset(headers);
      expect(result.preset.id).toBe("cj");
    });

    it("detects Shopify preset from typical Shopify export headers", () => {
      const headers = [
        "title", "handle", "vendor", "price", "sku",
        "body_html", "type", "tags", "image_src",
      ];
      const result = detectBestPreset(headers);
      expect(result.preset.id).toBe("shopify");
    });

    it("falls back to alaya preset for unrecognizable headers", () => {
      const headers = ["col_a", "col_b", "col_c", "col_d"];
      const result = detectBestPreset(headers);
      expect(result.preset.id).toBe("alaya");
    });
  });

  describe("applyPresetMapping", () => {
    it("maps column names according to the preset", () => {
      const impactPreset = getPreset("impact")!;
      const row = {
        title: "Artisan Tote",
        merchant_name: "ALAYA Studio",
        sale_price: "245.00",
        sku: "TOTE-001",
      };

      const result = applyPresetMapping(row, impactPreset);
      expect(result.name).toBe("Artisan Tote");
      expect(result.brand).toBe("ALAYA Studio");
      expect(result.price).toBe("245.00");
      expect(result.sku).toBe("TOTE-001");
    });

    it("sets default network from preset", () => {
      const row = { title: "Test Product", sale_price: "50" };
      const result = applyPresetMapping(row, getPreset("impact")!);
      expect(result.affiliatenetwork).toBe("IMPACT");
    });

    it("sets default network for Shopify preset", () => {
      const row = { title: "Test Product", price: "100" };
      const result = applyPresetMapping(row, getPreset("shopify")!);
      expect(result.affiliatenetwork).toBe("BRAND_DIRECT");
    });

    it("preserves original unmapped fields", () => {
      const row = {
        title: "Test",
        sale_price: "50",
        extra_field: "value",
      };
      const result = applyPresetMapping(row, getPreset("impact")!);
      expect(result.extra_field).toBe("value");
    });

    it("handles an empty row", () => {
      const result = applyPresetMapping({}, getPreset("impact")!);
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("lowercases all keys in the result", () => {
      const row = { TITLE: "Test", SALE_PRICE: "50" };
      const result = applyPresetMapping(row, getPreset("impact")!);
      expect(result.title).toBe("Test");
      expect(result.sale_price).toBe("50");
    });
  });

  describe("createCustomPreset", () => {
    it("creates a preset with the given name and mapping", () => {
      const mapping = { name: "product_name", price: "product_price" };
      const custom = createCustomPreset("My Custom Feed", mapping, "BRAND_DIRECT");

      expect(custom.name).toBe("My Custom Feed");
      expect(custom.columns).toEqual(mapping);
      expect(custom.defaultNetwork).toBe("BRAND_DIRECT");
      expect(custom.id).toContain("custom-");
    });

    it("generates an ID with the custom- prefix and numeric suffix", () => {
      const custom = createCustomPreset("Test", {}, "NET");
      expect(custom.id).toMatch(/^custom-\d+$/);
    });

    it("describes the mapping in the preset description", () => {
      const custom = createCustomPreset("Test", { name: "n", price: "p" }, "NET");
      expect(custom.description).toContain("2 field mappings");
    });
  });
});
