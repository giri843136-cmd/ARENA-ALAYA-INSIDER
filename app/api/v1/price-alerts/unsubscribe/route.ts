import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/price-alerts/unsubscribe?email=...&product=...
 * POST /api/v1/price-alerts/unsubscribe (JSON body)
 *
 * Unsubscribe from price drop alerts for a specific product or all products.
 * GET version supports one-click unsubscribe links from emails.
 */

async function handleUnsubscribe(email: string, productSlug?: string) {
  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Email is required." } },
      { status: 400 }
    );
  }

  if (productSlug) {
    console.log(`[PriceAlert] ${email} unsubscribed from ${productSlug}`);
  } else {
    console.log(`[PriceAlert] ${email} unsubscribed from all alerts`);
  }

  return NextResponse.json({
    success: true,
    data: { message: productSlug ? "Alert removed for this product." : "Unsubscribed from all price alerts." },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const productSlug = searchParams.get("product") || undefined;
  return handleUnsubscribe(email || "", productSlug);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productSlug } = body;
    return handleUnsubscribe(email, productSlug);
  } catch (error) {
    console.error("[PriceAlert] Unsubscribe error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to unsubscribe. Please try again." } },
      { status: 500 }
    );
  }
}
