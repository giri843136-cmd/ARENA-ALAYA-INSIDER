import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Escape a value for CSV (quotes if it contains commas, quotes, or newlines) */
function escape(v: any): string {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

/** Map a product + relations into a CSV row array */
function productToRow(p: any): string[] {
  const cats = p.productCategories.map((pc: any) => pc.category.name).join(", ");
  const tags = p.productTags.map((pt: any) => pt.tag.name).join(",");
  const benefits = (p.benefits || []).join("|");
  const pros = (p.pros || []).join("|");
  const cons = (p.cons || []).join("|");
  const perfectFor = (p.perfectFor || []).join("|");
  const imageUrl = p.media?.[0]?.url || "";
  const affiliate = p.affiliateLinks?.[0];
  const metadata = p.metadata;

  const vSkus = p.variants.map((v: any) => v.sku).join("|");
  const vColors = p.variants.map((v: any) => v.color || "").join("|");
  const vSizes = p.variants.map((v: any) => v.size || "").join("|");
  const vMaterials = p.variants.map((v: any) => v.material || "").join("|");
  const vPriceAdj = p.variants.map((v: any) => v.priceAdjustment.toString()).join("|");

  return [
    p.name, p.slug, p.brand.name,
    p.price.toString(), p.salePrice?.toString() || "0", p.currency,
    p.sku || "", metadata?.upc || "", metadata?.asin || "", metadata?.gtin || "",
    p.shortDescription, p.longDescription,
    p.availability, p.status,
    cats, p.universe.slug,
    tags,
    benefits, pros, cons, perfectFor,
    imageUrl,
    affiliate?.url || "", affiliate?.network || "", affiliate?.commissionRate?.toString() || "",
    p.seoTitle || "", p.metaDescription || "",
    vSkus, vColors, vSizes, vMaterials, vPriceAdj,
  ];
}

const PAGE_SIZE = 1000;

const CSV_HEADERS = [
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

const INCLUDE = {
  brand: true,
  universe: true,
  productCategories: { include: { category: true } },
  productTags: { include: { tag: true } },
  affiliateLinks: true,
  media: true,
  variants: true,
  metadata: true,
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get("page") || "1");
    const page = Math.max(1, pageParam);

    // Get total count for the Content-Range header
    const total = await prisma.product.count({ where: { deletedAt: null } });

    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    // Build the header row and data rows
    const headerRow = CSV_HEADERS.join(",");
    const dataRows = products.map(productToRow);
    const csv = [headerRow, ...dataRows.map((r) => r.map(escape).join(","))].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="product-export-${Date.now()}.csv"`,
        "X-Total-Count": String(total),
        "X-Page": String(page),
        "X-Page-Size": String(PAGE_SIZE),
        "X-Has-More": String(products.length === PAGE_SIZE),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "EXPORT_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
