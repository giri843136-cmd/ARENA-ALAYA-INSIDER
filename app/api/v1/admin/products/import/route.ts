import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolvePreset, applyPresetMapping } from "@/lib/import/presets";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Validate a string value against the AffiliateNetwork enum */
const VALID_NETWORKS = ["AMAZON", "WALMART", "IMPACT", "CJ", "SHAREASALE", "BRAND_DIRECT", "OTHER"];

/** Case-insensitive field accessor for parsed CSV rows (headers are lowercased) */
function csvField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key.toLowerCase()];
    if (val !== undefined && val !== null) return String(val);
  }
  return "";
}

/** Find or create a Category by name, returns its id */
async function resolveCategoryId(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) return null;
  let category = await prisma.category.findFirst({
    where: { OR: [{ slug }, { name: { equals: trimmed, mode: "insensitive" } }] },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { slug, name: trimmed },
    });
  }
  return category.id;
}

/** Find or create Tags by name from a comma-separated string, returns their ids */
async function resolveTagIds(tagsStr: string): Promise<string[]> {
  const ids: string[] = [];
  const names = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
  for (const name of names) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) continue;
    let tag = await prisma.tag.findFirst({
      where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] },
    });
    if (!tag) {
      tag = await prisma.tag.create({ data: { slug, name } });
    }
    ids.push(tag.id);
  }
  return ids;
}

/** Create an affiliate link for a product if CSV provides the URL */
async function createAffiliateLink(productId: string, brandId: string, row: any) {
  const url = csvField(row, "affiliateUrl", "affiliate_url").trim();
  if (!url) return;

  const networkStr = csvField(row, "affiliateNetwork", "affiliate_network").toUpperCase().trim();
  const network = VALID_NETWORKS.includes(networkStr) ? networkStr : "OTHER";
  const rate = parseFloat(csvField(row, "commissionRate", "commission_rate"));

  await prisma.affiliateLink.create({
    data: {
      productId,
      brandId,
      url,
      network: network as any,
      label: csvField(row, "name", "title") || "Imported Product",
      commissionRate: isNaN(rate) ? null : rate,
    },
  });
}

/** Create a Media record from an image URL */
async function createMediaForProduct(productId: string, imageUrl: string) {
  const url = imageUrl.trim();
  if (!url) return;

  // Extract a publicId from the URL — use the last path segment before query params
  const segments = url.split("/");
  let publicId = segments[segments.length - 1]?.split("?")[0]?.split(".")[0] || `imported-${Date.now()}`;

  await prisma.media.create({
    data: {
      url,
      publicId,
      type: "IMAGE" as any,
      productId,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "adminImport");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const presetId = (formData.get("preset") as string) || "alaya";
    if (!file) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "No file provided" } }, { status: 400 });

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

    let imported = 0;
    let matched = 0;
    let failed = 0;
    const categoriesCreated: string[] = [];
    const tagsCreated: string[] = [];
    const affiliateLinksCreated: string[] = [];
    const mediaCreated: string[] = [];
    const rowErrors: { row: number; message: string; name: string }[] = [];

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      try {
        const slug = row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + `-${Date.now()}`;
        const brandName = row.brand || row.vendor || "Unknown";
        let brand = await prisma.brand.findFirst({ where: { name: { contains: brandName, mode: "insensitive" } } });
        if (!brand) {
          brand = await prisma.brand.create({
            data: { name: brandName, slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), tagline: "", story: "", logo: "", country: "US" },
          });
        }

        const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, row.sku ? { sku: row.sku } : {}].filter(Boolean) as any } });
        let productId: string;

        const parsedPrice = parseFloat(row.price) || 0;
        const salePriceRaw = parseFloat(csvField(row, "salePrice"));
        const parsedSalePrice = isNaN(salePriceRaw) ? undefined : salePriceRaw;

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              price: parsedPrice || existing.price,
              salePrice: parsedSalePrice !== undefined ? parsedSalePrice : existing.salePrice,
              status: "PUBLISHED",
            },
          });
          productId = existing.id;
          matched++;
        } else {
          const product = await prisma.product.create({
            data: {
              slug: slug + `-${Date.now()}`,
              name: row.name || row.title || "Imported Product",
              shortDescription: csvField(row, "shortDescription", "short_description", "description"),
              longDescription: csvField(row, "longDescription", "long_description", "description"),
              price: parsedPrice,
              salePrice: parsedSalePrice,
              currency: (csvField(row, "currency") || "USD").toUpperCase() as any,
              status: csvField(row, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
              brandId: brand.id,
              seoTitle: csvField(row, "seoTitle") || null,
              metaDescription: csvField(row, "metaDescription") || null,
              universeId: (await prisma.universe.findFirst())?.id || "",
              benefits: csvField(row, "benefits").split("|").filter(Boolean),
              pros: csvField(row, "pros").split("|").filter(Boolean),
              cons: csvField(row, "cons").split("|").filter(Boolean),
              perfectFor: csvField(row, "perfectFor").split("|").filter(Boolean),
            },
          });
          productId = product.id;
          imported++;
        }

        // --- Category auto-creation ---
        const categoryName = (row.category || "").trim();
        if (categoryName) {
          const catId = await resolveCategoryId(categoryName);
          if (catId) {
            const exists = await prisma.productCategory.findUnique({
              where: { productId_categoryId: { productId, categoryId: catId } },
            });
            if (!exists) {
              await prisma.productCategory.create({ data: { productId, categoryId: catId } });
              categoriesCreated.push(categoryName);
            }
          }
        }

        // --- Tag auto-creation ---
        const tagsStr = (row.tags || "").trim();
        if (tagsStr) {
          const tagIds = await resolveTagIds(tagsStr);
          for (const tagId of tagIds) {
            const exists = await prisma.productTag.findUnique({
              where: { productId_tagId: { productId, tagId } },
            });
            if (!exists) {
              await prisma.productTag.create({ data: { productId, tagId } });
              tagsCreated.push(tagId);
            }
          }
        }

        // --- Affiliate link creation ---
        const affUrl = csvField(row, "affiliateUrl", "affiliate_url");
        if (affUrl.trim()) {
          await createAffiliateLink(productId, brand.id, row);
          affiliateLinksCreated.push(affUrl);
        }

        // --- Media creation from imageUrl ---
        const imgUrl = csvField(row, "imageUrl");
        if (imgUrl.trim()) {
          await createMediaForProduct(productId, imgUrl);
          mediaCreated.push(imgUrl);
        }

        // --- Variant creation from pipe-delimited columns ---
        const variantSkusStr = csvField(row, "variantSkus", "variant_skus");
        const variantSkus = variantSkusStr.split("|").filter(Boolean);
        if (variantSkus.length > 0) {
          const variantColors = csvField(row, "variantColors", "variant_colors").split("|");
          const variantSizes = csvField(row, "variantSizes", "variant_sizes").split("|");
          const variantMaterials = csvField(row, "variantMaterials", "variant_materials").split("|");
          const variantPriceAdjustments = csvField(row, "variantPriceAdjustments", "variant_price_adjustments").split("|");

          for (let vi = 0; vi < variantSkus.length; vi++) {
            const vSku = variantSkus[vi].trim();
            if (!vSku) continue;
            const existingVariant = await prisma.productVariant.findUnique({ where: { sku: vSku } });
            if (!existingVariant) {
              await prisma.productVariant.create({
                data: {
                  productId,
                  sku: vSku,
                  color: variantColors[vi]?.trim() || null,
                  size: variantSizes[vi]?.trim() || null,
                  material: variantMaterials[vi]?.trim() || null,
                  priceAdjustment: parseFloat(variantPriceAdjustments[vi] || "0") || 0,
                },
              });
            }
          }
        }
      } catch (err: any) {
        failed++;
        rowErrors.push({ row: ri + 2, message: err.message || "Unknown error", name: row.name || row.title || "(unnamed)" });
      }
    }

    // Persist to import history
    try {
      await prisma.importHistory.create({
        data: {
          fileName: file.name,
          totalRows: rows.length,
          newRows: imported,
          matchedRows: matched,
          failedRows: failed,
          status: failed > 0 && imported === 0 ? "failed" : "completed",
          errors: rowErrors.length > 0 ? JSON.parse(JSON.stringify(rowErrors)) : undefined,
          categoriesLinked: categoriesCreated.length,
          tagsLinked: tagsCreated.length,
          affiliateLinksCreated: affiliateLinksCreated.length,
          mediaCreated: mediaCreated.length,
          presetId: presetId,
        },
      });
    } catch { /* non-blocking: history persistence failure should not break the import */ }

    return NextResponse.json({
      success: true,
      data: {
        imported,
        matched,
        failed,
        total: rows.length,
        fileName: file.name,
        categoriesLinked: categoriesCreated.length,
        tagsLinked: tagsCreated.length,
        affiliateLinksCreated: affiliateLinksCreated.length,
        mediaCreated: mediaCreated.length,
        errors: rowErrors,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "IMPORT_ERROR", message: error.message } }, { status: 500 });
  }
}
