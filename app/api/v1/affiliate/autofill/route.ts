import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { autoFillCoupon } from "@/lib/backend/affiliate/coupon-autofill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/affiliate/autofill?productId=xxx&affiliateUrl=xxx
 * Returns the best coupon code applied to the affiliate URL.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const affiliateUrl = searchParams.get("affiliateUrl") || "";

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } },
        { status: 400 }
      );
    }

    const result = await autoFillCoupon(affiliateUrl, productId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "AUTOFILL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/affiliate/autofill
 * Body: { productId, affiliateUrl }
 * Returns the auto-filled URL with coupon applied.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, affiliateUrl } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } },
        { status: 400 }
      );
    }

    const result = await autoFillCoupon(affiliateUrl || "", productId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "AUTOFILL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
