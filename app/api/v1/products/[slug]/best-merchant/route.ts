/**
 * ALAYA INSIDER — Best Merchant API
 * Returns the optimal affiliate link for a product based on
 * commission rate, health, performance, and availability.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { selectBestMerchant, getBestAffiliateUrl } from "@/lib/backend/affiliate/merchant-selector";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products/[slug]/best-merchant
 * Returns the best merchant/affiliate link for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Rate limiting
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "api");
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED" } },
        { status: 429 }
      );
    }

    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeDetails = searchParams.get("details") === "true";

    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, affiliatePriority: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    if (includeDetails) {
      // Return full scoring details (service handles caching)
      const result = await selectBestMerchant(product.id);

      return NextResponse.json({
        success: true,
        data: {
          product: {
            id: product.id,
            slug: product.slug,
            name: product.name,
          },
          bestMerchant: result.primary,
          selectionMethod: result.selectionMethod,
          fallback: result.fallback,
          alternatives: result.alternatives,
          selectedAt: result.selectedAt,
        },
      });
    }

    // Return just the best URL (lighter response)
    const best = await getBestAffiliateUrl(product.id);

    if (!best) {
      return NextResponse.json({
        success: true,
        data: {
          product: { slug: product.slug, name: product.name },
          bestMerchant: null,
          note: "No affiliate links configured for this product",
        },
      });
    }

    // Add tracking parameters
    const url = new URL(best.url);
    url.searchParams.set("utm_source", "alayainsider");
    url.searchParams.set("utm_medium", "affiliate");
    url.searchParams.set("utm_campaign", product.slug);

    return NextResponse.json({
      success: true,
      data: {
        product: { slug: product.slug, name: product.name },
        bestMerchant: {
          url: url.toString(),
          label: best.label,
          network: best.network,
          score: best.score,
        },
        selectedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[BestMerchant] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Failed to select best merchant" } },
      { status: 500 }
    );
  }
}
