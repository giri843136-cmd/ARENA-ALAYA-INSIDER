import { describe, it, expect, vi } from "vitest";
import {
  IMPORT_PRESETS,
  scorePreset,
  detectBestPreset,
  applyPresetMapping,
  createCustomPreset,
  getPreset,
  STANDARD_FIELDS,
} from "@/lib/import/presets";

describe("FeedManager — Import Presets", () => {
  it("exports all expected built-in presets", () => {
    const ids = IMPORT_PRESETS.map((p) => p.id);
    expect(ids).toContain("alaya");
    expect(ids).toContain("impact");
    expect(ids).toContain("cj");
    expect(ids).toContain("shareasale");
    expect(ids).toContain("amazon");
    expect(ids).toContain("walmart");
    expect(ids).toContain("shopify");
  });

  it("each preset has required fields", () => {
    for (const preset of IMPORT_PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.network).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.columns).toBeDefined();
    }
  });

  it("getPreset returns the correct preset by id", () => {
    const cj = getPreset("cj");
    expect(cj).toBeDefined();
    expect(cj?.name).toBe("CJ Affiliate");
    expect(cj?.network).toBe("CJ");
  });

  it("getPreset returns undefined for unknown id", () => {
    expect(getPreset("nonexistent")).toBeUndefined();
  });
});

describe("FeedManager — scorePreset", () => {
  it("returns 100 for a perfect match", () => {
    const preset = IMPORT_PRESETS.find((p) => p.id === "impact")!;
    const headers = Object.values(preset.columns).filter(Boolean) as string[];
    const score = scorePreset(preset, headers);
    expect(score).toBe(100);
  });

  it("returns 50 for alaya preset (no column mappings)", () => {
    const preset = IMPORT_PRESETS.find((p) => p.id === "alaya")!;
    const score = scorePreset(preset, ["name", "brand", "price"]);
    expect(score).toBe(50);
  });

  it("returns 0 for no matching headers", () => {
    const preset = IMPORT_PRESETS.find((p) => p.id === "impact")!;
    const score = scorePreset(preset, ["foo", "bar", "baz"]);
    expect(score).toBe(0);
  });

  it("returns partial score for partial match", () => {
    const preset = IMPORT_PRESETS.find((p) => p.id === "impact")!;
    const headers = ["title", "merchant_name", "foo", "bar", "baz"];
    const score = scorePreset(preset, headers);
    // 2 out of ~12 mapped columns matched
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it("is case insensitive", () => {
    const preset = IMPORT_PRESETS.find((p) => p.id === "cj")!;
    const headers = ["TITLE", "ADVERTISER_NAME", "PRICE"];
    const score = scorePreset(preset, headers);
    expect(score).toBeGreaterThan(0);
  });
});

describe("FeedManager — detectBestPreset", () => {
  it("detects Impact preset from its column headers", () => {
    const headers = ["title", "merchant_name", "sale_price", "currency_code", "sku", "description", "category", "keywords", "image_url", "affiliate_url"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("impact");
    expect(result.score).toBeGreaterThan(80);
  });

  it("detects CJ preset from its column headers", () => {
    const headers = ["title", "advertiser_name", "price", "sku", "description", "category", "keywords", "image_url", "affiliate_url"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("cj");
    expect(result.score).toBeGreaterThan(80);
  });

  it("detects Shopify preset from its column headers", () => {
    const headers = ["title", "handle", "vendor", "price", "sku", "body_html", "type", "tags", "image_src"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("shopify");
    expect(result.score).toBeGreaterThan(70);
  });

  it("falls back to first preset (alaya) when no good match", () => {
    const headers = ["foo", "bar", "baz", "qux"];
    const result = detectBestPreset(headers);
    expect(result.preset.id).toBe("alaya");
    // alaya has no column mappings, so scorePreset returns 50 (neutral)
    expect(result.score).toBe(50);
  });
});

describe("FeedManager — applyPresetMapping", () => {
  it("maps Impact Radius columns to standard fields", () => {
    const preset = getPreset("impact")!;
    const row = {
      title: "Great Product",
      merchant_name: "Acme Co",
      sale_price: "29.99",
      currency_code: "USD",
      sku: "SKU123",
      description: "A great product description",
      category: "Electronics",
      keywords: "gadget, tech",
      image_url: "https://example.com/img.jpg",
      affiliate_url: "https://click.example.com/123",
    };

    const mapped = applyPresetMapping(row, preset);
    expect(mapped.name).toBe("Great Product");
    expect(mapped.brand).toBe("Acme Co");
    expect(mapped.price).toBe("29.99");
    expect(mapped.currency).toBe("USD");
    expect(mapped.sku).toBe("SKU123");
    expect(mapped.shortdescription).toBe("A great product description");
    expect(mapped.category).toBe("Electronics");
    expect(mapped.tags).toBe("gadget, tech");
    expect(mapped.imageurl).toBe("https://example.com/img.jpg");
    expect(mapped.affiliateurl).toBe("https://click.example.com/123");
    expect(mapped.affiliatenetwork).toBe("IMPACT");
  });

  it("maps Shopify columns to standard fields", () => {
    const preset = getPreset("shopify")!;
    const row = {
      title: "Cool Sneakers",
      handle: "cool-sneakers",
      vendor: "Nike",
      price: "89.99",
      sku: "NIKE-001",
      body_html: "<p>Comfortable running shoes</p>",
      type: "Shoes",
      tags: "running, athletic",
      image_src: "https://example.com/shoes.jpg",
    };

    const mapped = applyPresetMapping(row, preset);
    expect(mapped.name).toBe("Cool Sneakers");
    expect(mapped.slug).toBe("cool-sneakers");
    expect(mapped.brand).toBe("Nike");
    expect(mapped.price).toBe("89.99");
    expect(mapped.sku).toBe("NIKE-001");
    expect(mapped.shortdescription).toBe("<p>Comfortable running shoes</p>");
    expect(mapped.category).toBe("Shoes");
    expect(mapped.tags).toBe("running, athletic");
    expect(mapped.imageurl).toBe("https://example.com/shoes.jpg");
    expect(mapped.affiliatenetwork).toBe("BRAND_DIRECT");
  });

  it("preserves original fields not in the mapping", () => {
    const preset = getPreset("impact")!;
    const row = {
      title: "Test",
      extra_field: "should be preserved",
      another_one: "also kept",
    };

    const mapped = applyPresetMapping(row, preset);
    expect(mapped.name).toBe("Test");
    expect(mapped.extra_field).toBe("should be preserved");
    expect(mapped.another_one).toBe("also kept");
  });
});

describe("FeedManager — createCustomPreset", () => {
  it("creates a custom preset with the given mapping", () => {
    const mapping = { name: "product_name", brand: "manufacturer", price: "cost" };
    const preset = createCustomPreset("My Custom", mapping, "BRAND_DIRECT");

    expect(preset.name).toBe("My Custom");
    expect(preset.network).toBe("BRAND_DIRECT");
    expect(preset.columns).toEqual(mapping);
    expect(preset.id).toContain("custom-");
    expect(preset.description).toContain("3 field mappings");
  });
});

describe("FeedManager — STANDARD_FIELDS", () => {
  it("includes all essential product fields", () => {
    expect(STANDARD_FIELDS).toContain("name");
    expect(STANDARD_FIELDS).toContain("brand");
    expect(STANDARD_FIELDS).toContain("price");
    expect(STANDARD_FIELDS).toContain("sku");
    expect(STANDARD_FIELDS).toContain("category");
    expect(STANDARD_FIELDS).toContain("tags");
    expect(STANDARD_FIELDS).toContain("imageUrl");
    expect(STANDARD_FIELDS).toContain("affiliateUrl");
    expect(STANDARD_FIELDS).toContain("slug");
    expect(STANDARD_FIELDS).toContain("shortDescription");
  });

  it("includes variant and SEO fields", () => {
    expect(STANDARD_FIELDS).toContain("variantSkus");
    expect(STANDARD_FIELDS).toContain("variantColors");
    expect(STANDARD_FIELDS).toContain("variantSizes");
    expect(STANDARD_FIELDS).toContain("seoTitle");
    expect(STANDARD_FIELDS).toContain("metaDescription");
  });

  it("has no duplicates", () => {
    const unique = new Set(STANDARD_FIELDS);
    expect(unique.size).toBe(STANDARD_FIELDS.length);
  });
});
