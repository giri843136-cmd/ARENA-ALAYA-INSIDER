/**
 * Import column mapping presets for different affiliate networks.
 * Each preset maps network-specific column names to the standard import format fields.
 */
export interface ColumnMap {
  name?: string;
  slug?: string;
  brand?: string;
  price?: string;
  salePrice?: string;
  currency?: string;
  sku?: string;
  upc?: string;
  asin?: string;
  gtin?: string;
  shortDescription?: string;
  longDescription?: string;
  availability?: string;
  status?: string;
  category?: string;
  universe?: string;
  tags?: string;
  benefits?: string;
  pros?: string;
  cons?: string;
  perfectFor?: string;
  imageUrl?: string;
  affiliateUrl?: string;
  affiliateNetwork?: string;
  commissionRate?: string;
  seoTitle?: string;
  metaDescription?: string;
  variantSkus?: string;
  variantColors?: string;
  variantSizes?: string;
  variantMaterials?: string;
  variantPriceAdjustments?: string;
}

export interface ImportPreset {
  id: string;
  name: string;
  network: string;
  description: string;
  columns: ColumnMap;
  /** AffiliateNetwork enum to use when importing */
  defaultNetwork?: string;
}

/** Standard field names that presets try to map */
export const STANDARD_FIELDS = [
  "name", "slug", "brand", "price", "salePrice", "currency",
  "sku", "upc", "asin", "gtin",
  "shortDescription", "longDescription",
  "availability", "status",
  "category", "universe",
  "tags",
  "benefits", "pros", "cons", "perfectFor",
  "imageUrl",
  "affiliateUrl", "affiliateNetwork", "commissionRate",
  "seoTitle", "metaDescription",
  "variantSkus", "variantColors", "variantSizes", "variantMaterials", "variantPriceAdjustments",
];

/**
 * Score how well a preset matches a set of CSV headers.
 * Returns a score 0-100 where higher is better.
 */
export function scorePreset(preset: ImportPreset, headers: string[]): number {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
  let matched = 0;
  let total = 0;

  for (const [standardKey, sourceColumn] of Object.entries(preset.columns)) {
    if (!sourceColumn) continue;
    total++;
    // Check if the source column exists in the CSV headers
    if (lowerHeaders.includes(sourceColumn.toLowerCase())) {
      matched++;
    }
  }

  if (total === 0) return 50; // alaya preset — neutral score

  // Score = percentage of mapped columns that were found in headers
  return Math.round((matched / total) * 100);
}

/** Find the best matching preset for a set of CSV headers */
export function detectBestPreset(headers: string[]): { preset: ImportPreset; score: number } {
  let best = IMPORT_PRESETS[0];
  let bestScore = 0;

  for (const preset of IMPORT_PRESETS) {
    const score = scorePreset(preset, headers);
    if (score > bestScore) {
      best = preset;
      bestScore = score;
    }
  }

  return { preset: best, score: bestScore };
}

/** Create a custom preset from a user-specified column mapping */
export function createCustomPreset(name: string, mapping: Record<string, string>, network: string): ImportPreset {
  return {
    id: `custom-${Date.now()}`,
    name,
    network,
    description: `Custom column mapping with ${Object.keys(mapping).length} field mappings.`,
    columns: mapping,
    defaultNetwork: network,
  };
}

/**
 * Resolve a preset by ID — checks built-in presets first, then falls back to DB-saved presets.
 * This is used by both the import and validate API routes.
 */
export async function resolvePreset(presetId: string): Promise<ImportPreset | null> {
  const builtin = getPreset(presetId);
  if (builtin) return builtin;
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const saved = await prisma.importPreset.findUnique({ where: { id: presetId } });
    if (saved) {
      return {
        id: saved.id,
        name: saved.name,
        network: saved.network,
        description: `Saved preset: ${saved.name}`,
        columns: (saved.columns || {}) as Record<string, string>,
        defaultNetwork: saved.defaultNetwork || undefined,
      };
    }
  } catch {}
  return null;
}

export const IMPORT_PRESETS: ImportPreset[] = [
  {
    id: "alaya",
    name: "ALAYA Standard",
    network: "ALAYA",
    description: "Standard format matching the sample CSV template with full column support.",
    columns: {},
  },
  {
    id: "impact",
    name: "Impact Radius",
    network: "IMPACT",
    description: "Impact / Impact Radius network feed. Maps title→name, merchant_name→brand, sale_price→price.",
    columns: {
      name: "title",
      brand: "merchant_name",
      price: "sale_price",
      currency: "currency_code",
      sku: "sku",
      upc: "upc",
      shortDescription: "description",
      category: "category",
      tags: "keywords",
      imageUrl: "image_url",
      affiliateUrl: "affiliate_url",
      commissionRate: "commission_rate",
    },
    defaultNetwork: "IMPACT",
  },
  {
    id: "cj",
    name: "CJ Affiliate",
    network: "CJ",
    description: "CJ Affiliate (Commission Junction) network feed. Maps title→name, advertiser_name→brand.",
    columns: {
      name: "title",
      brand: "advertiser_name",
      price: "price",
      sku: "sku",
      upc: "upc",
      shortDescription: "description",
      category: "category",
      tags: "keywords",
      imageUrl: "image_url",
      affiliateUrl: "affiliate_url",
      commissionRate: "commission_percent",
    },
    defaultNetwork: "CJ",
  },
  {
    id: "shareasale",
    name: "ShareASale",
    network: "SHAREASALE",
    description: "ShareASale network feed. Maps manufacturer→brand, name→name.",
    columns: {
      name: "name",
      brand: "manufacturer",
      price: "price",
      sku: "sku",
      shortDescription: "description",
      category: "category",
      tags: "keywords",
      imageUrl: "image_url",
      affiliateUrl: "affiliate_url",
      commissionRate: "commission_rate",
    },
    defaultNetwork: "SHAREASALE",
  },
  {
    id: "amazon",
    name: "Amazon Associates",
    network: "AMAZON",
    description: "Amazon Product Advertising API feed. Maps title→name, asin for product matching.",
    columns: {
      name: "title",
      brand: "brand",
      price: "price",
      asin: "asin",
      shortDescription: "description",
      category: "category",
      tags: "keywords",
      imageUrl: "image_url",
      affiliateUrl: "affiliate_url",
    },
    defaultNetwork: "AMAZON",
  },
  {
    id: "walmart",
    name: "Walmart Affiliate",
    network: "WALMART",
    description: "Walmart Affiliate program feed. Maps title→name, upc for product matching.",
    columns: {
      name: "title",
      brand: "brand",
      price: "price",
      sku: "sku",
      upc: "upc",
      shortDescription: "description",
      category: "category",
      imageUrl: "image_url",
      affiliateUrl: "affiliate_url",
      commissionRate: "commission_rate",
    },
    defaultNetwork: "WALMART",
  },
  {
    id: "shopify",
    name: "Shopify Export",
    network: "BRAND_DIRECT",
    description: "Standard Shopify CSV export format. Maps handle→slug, title→name, vendor→brand.",
    columns: {
      name: "title",
      slug: "handle",
      brand: "vendor",
      price: "price",
      sku: "sku",
      shortDescription: "body_html",
      category: "type",
      tags: "tags",
      imageUrl: "image_src",
    },
    defaultNetwork: "BRAND_DIRECT",
  },
];

export function getPreset(id: string): ImportPreset | undefined {
  return IMPORT_PRESETS.find((p) => p.id === id);
}

/**
 * Apply a preset's column mapping to a parsed CSV row.
 * Returns a new object with all standard keys, populated from the original row
 * using the preset's column name mappings.
 */
export function applyPresetMapping(row: Record<string, string>, preset: ImportPreset): Record<string, string> {
  const result: Record<string, string> = {};
  const lowerRow: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    lowerRow[k.toLowerCase()] = v || "";
  }

  // Copy all original fields first (lowercased)
  for (const [k, v] of Object.entries(lowerRow)) {
    result[k] = v;
  }

  // Apply the mapping — add aliased keys so csvField() can find them
  for (const [standardKey, sourceColumn] of Object.entries(preset.columns)) {
    if (!sourceColumn) continue;
    const sourceValue = lowerRow[sourceColumn.toLowerCase()];
    if (sourceValue !== undefined) {
      // Set the standard key (lowercased) so csvField can find it
      result[standardKey.toLowerCase()] = sourceValue;
    }
  }

  // Set default network if provided
  if (preset.defaultNetwork) {
    result["affiliatenetwork"] = preset.defaultNetwork;
  }

  return result;
}
