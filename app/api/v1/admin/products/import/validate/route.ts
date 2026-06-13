import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolvePreset, applyPresetMapping } from "@/lib/import/presets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Case-insensitive field accessor for parsed CSV rows (headers are lowercased) */
function csvField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key.toLowerCase()];
    if (val !== undefined && val !== null) return String(val);
  }
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const presetId = (formData.get("preset") as string) || "alaya";
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No file provided" } },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Load the preset for column mapping
    const preset = await resolvePreset(presetId);

    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      // Apply preset column mapping if available
      return preset ? applyPresetMapping(obj, preset) : obj;
    });

    // --- Batch pre-fetch all unique lookups to avoid N+1 queries ---

    // Collect all unique brand names, slugs, SKUs, category names, tag names, variant SKUs
    const brandNames = [...new Set(rows.map((r) => (r.brand || r.vendor || "Unknown").toLowerCase()))];
    const productSlugs = [...new Set(rows.map((r) => r.slug || "").filter(Boolean))];
    const productSkus = [...new Set(rows.map((r) => r.sku || "").filter(Boolean))];
    const categoryNames = [...new Set(rows.map((r) => (r.category || "").trim().toLowerCase()).filter(Boolean))];
    const categorySlugs = categoryNames.map((n) => n.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    const allTagNames = [...new Set(rows.flatMap((r) => (r.tags || "").split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean)))];
    const allVariantSkus = [...new Set(rows.flatMap((r) => csvField(r, "variantSkus", "variant_skus").split("|").filter(Boolean)))];

    // Bulk queries — use individual findMany per lookup to avoid complex OR typing
    const [allBrands, allProducts, allCategories, allTags, allVariants] = await Promise.all([
      brandNames.length
        ? prisma.brand.findMany({ where: { name: { in: brandNames } }, select: { id: true, name: true } })
        : Promise.resolve([] as Array<{ id: string; name: string }>),
      prisma.product.findMany({
        where: productSlugs.length || productSkus.length
          ? {
              OR: [
                ...(productSlugs.length ? [{ slug: { in: productSlugs } }] : []),
                ...(productSkus.length ? [{ sku: { in: productSkus } }] : []),
              ] as any,
            }
          : { id: "" },
        select: { id: true, name: true, slug: true, sku: true, status: true },
      }),
      categorySlugs.length
        ? prisma.category.findMany({ where: { slug: { in: categorySlugs } }, select: { id: true, name: true, slug: true } })
        : Promise.resolve([] as Array<{ id: string; name: string; slug: string }>),
      allTagNames.length
        ? prisma.tag.findMany({ where: { name: { in: allTagNames } }, select: { id: true, name: true } })
        : Promise.resolve([] as Array<{ id: string; name: string }>),
      allVariantSkus.length
        ? prisma.productVariant.findMany({ where: { sku: { in: allVariantSkus } }, select: { sku: true } })
        : Promise.resolve([] as Array<{ sku: string }>),
    ]);

    // Build lookup maps
    const brandMap = new Map(allBrands.map((b: any) => [b.name.toLowerCase(), b]));
    const productBySlug = new Map(allProducts.filter((p: any) => p.slug).map((p: any) => [p.slug, p]));
    const productBySku = new Map(allProducts.filter((p: any) => p.sku).map((p: any) => [p.sku, p]));
    const categoryMap = new Map([
      ...allCategories.map((c: any) => [c.slug, c] as const),
      ...allCategories.map((c: any) => [c.name.toLowerCase(), c] as const),
    ]);
    const tagMap = new Map(allTags.map((t: any) => [t.name.toLowerCase(), t]));
    const variantSet = new Set(allVariants.map((v: any) => v.sku));

    // Build preview
    const preview = rows.map((row) => {
      const brandName = (row.brand || row.vendor || "Unknown").toLowerCase();
      const existingBrand = brandMap.get(brandName);

      const slug = row.slug || "";
      const existingProduct = slug
        ? productBySlug.get(slug) || (row.sku ? productBySku.get(row.sku) : undefined)
        : undefined;

      const categoryName = (row.category || "").trim().toLowerCase();
      const categorySlug = categoryName.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existingCategory = categoryMap.get(categorySlug) || categoryMap.get(categoryName);

      const tagsStr = (row.tags || "").trim();
      const existingTags: string[] = tagsStr
        ? tagsStr.split(",").map((t: string) => {
            const tn = t.trim();
            const found = tagMap.get(tn.toLowerCase());
            return found?.name || tn;
          })
        : [];

      const variantSkus = csvField(row, "variantSkus", "variant_skus").split("|").filter(Boolean);
      const existingVariants = variantSkus.map((vs: string) =>
        variantSet.has(vs) ? `✓ ${vs}` : `✗ ${vs} (new)`
      );

      return {
        name: row.name || row.title || "(unnamed)",
        brand: existingBrand ? `✓ ${existingBrand.name}` : `✗ ${row.brand || row.vendor || "Unknown"} (will be created)`,
        product: existingProduct ? `✓ ${existingProduct.name} (will update)` : "✗ (will create new)",
        category: existingCategory ? `✓ ${existingCategory.name}` : categoryName ? `✗ ${row.category} (will be created)` : "—",
        tags: existingTags.length > 0 ? existingTags.join(", ") : "—",
        variants: existingVariants.length > 0 ? existingVariants.join("; ") : "—",
        hasAffiliateLink: csvField(row, "affiliateUrl", "affiliate_url").trim() ? "✓" : "—",
        hasImage: csvField(row, "imageUrl").trim() ? "✓" : "—",
        price: row.price || "0",
        status: row.status || "DRAFT",
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        totalRows: rows.length,
        preview,
        summary: {
          newProducts: preview.filter((p) => p.product.startsWith("✗")).length,
          updates: preview.filter((p) => p.product.startsWith("✓")).length,
          newBrands: preview.filter((p) => p.brand.startsWith("✗")).length,
          newCategories: preview.filter((p) => p.category.startsWith("✗")).length,
          withAffiliateLinks: preview.filter((p) => p.hasAffiliateLink === "✓").length,
          withImages: preview.filter((p) => p.hasImage === "✓").length,
          withVariants: preview.filter((p) => p.variants !== "—").length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
