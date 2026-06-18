import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/products/embeds?productIds=p1,p2,p3
 * Returns minimal product data for embedding in articles.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdsParam = searchParams.get("productIds");
    const slug = searchParams.get("slug");

    if (productIdsParam) {
      const productIds = productIdsParam.split(",").map((s) => s.trim()).filter(Boolean);

      if (productIds.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "At least one productId is required" } },
          { status: 400 }
        );
      }

      if (productIds.length > 50) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Maximum 50 products per request" } },
          { status: 400 }
        );
      }

      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          salePrice: true,
          currency: true,
          rating: true,
          reviewCount: true,
          brand: { select: { name: true, slug: true } },
          affiliateLinks: {
            where: { health: "HEALTHY" },
            select: { network: true, url: true, label: true, commissionRate: true },
            take: 3,
            orderBy: { clicks: "desc" },
          },
          media: {
            where: { type: "IMAGE" },
            select: { url: true, altText: true },
            take: 1,
          },
          inventory: true,
          availability: true,
          shortDescription: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.price),
          salePrice: p.salePrice ? Number(p.salePrice) : null,
          currency: p.currency,
          rating: p.rating,
          reviewCount: p.reviewCount,
          brand: p.brand,
          image: p.media[0]?.url || null,
          imageAlt: p.media[0]?.altText || p.name,
          bestAffiliate: p.affiliateLinks[0] || null,
          affiliatesAvailable: p.affiliateLinks.length,
          inStock: p.inventory !== 0 && p.availability !== "OUT_OF_STOCK",
          description: p.shortDescription,
        })),
      });
    }

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          salePrice: true,
          currency: true,
          rating: true,
          reviewCount: true,
          shortDescription: true,
          brand: { select: { name: true, slug: true } },
          affiliateLinks: {
            where: { health: "HEALTHY" },
            select: { network: true, url: true, label: true, commissionRate: true },
            take: 3,
            orderBy: { clicks: "desc" },
          },
          media: {
            where: { type: "IMAGE" },
            select: { url: true, altText: true },
            take: 1,
          },
          inventory: true,
          availability: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          currency: product.currency,
          rating: product.rating,
          reviewCount: product.reviewCount,
          brand: product.brand,
          image: product.media[0]?.url || null,
          imageAlt: product.media[0]?.altText || product.name,
          bestAffiliate: product.affiliateLinks[0] || null,
          affiliatesAvailable: product.affiliateLinks.length,
          inStock: product.inventory !== 0 && product.availability !== "OUT_OF_STOCK",
          description: product.shortDescription,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Provide productIds or slug parameter" } },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
