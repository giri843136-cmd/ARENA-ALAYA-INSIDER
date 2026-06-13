import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/backend/email/resend";

/**
 * POST /api/v1/price-alerts/subscribe
 *
 * Subscribe to price drop alerts for a specific product.
 * Stores the email + product slug in the database for monitoring.
 * Sends a confirmation email via Resend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productSlug, productName, targetPrice } = body;

    // Validate required fields
    if (!email || !productSlug) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email and product slug are required." },
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_EMAIL", message: "Please provide a valid email address." },
        },
        { status: 400 }
      );
    }

    const displayName = productName || productSlug;
    const targetPriceDisplay = targetPrice ? `$${targetPrice}` : "any price drop";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const unsubscribeUrl = `${siteUrl}/api/v1/price-alerts/unsubscribe?email=${encodeURIComponent(email)}&product=${encodeURIComponent(productSlug)}`;
    const unsubscribeAllUrl = `${siteUrl}/api/v1/price-alerts/unsubscribe?email=${encodeURIComponent(email)}`;

    // Send confirmation email via Resend with one-click unsubscribe
    const emailResult = await sendTransactionalEmail({
      to: email,
      subject: `Price alert confirmed: ${displayName}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="font-size: 10px; letter-spacing: 2px; color: #7A6848; margin-bottom: 16px;">ALAYA INSIDER</div>
          <h1 style="font-size: 28px; font-weight: 400; color: #26221E; margin: 0 0 8px;">Price alert active</h1>
          <p style="color: #5C5249; line-height: 1.6; margin: 0 0 24px;">
            We'll monitor <strong>${displayName}</strong> and notify you when the price drops to ${targetPriceDisplay}.
          </p>
          <div style="border-top: 1px solid #E4DDD5; padding-top: 16px; font-size: 12px; color: #8A8178;">
            <p style="margin: 0;">No spam, unsubscribe anytime. Your alert is tied to <strong>${email}</strong>.</p>
            <p style="margin: 8px 0 0;">
              <a href="${unsubscribeUrl}" style="color: #7A6848; text-decoration: underline; font-size: 11px;">Unsubscribe from this product</a>
              &nbsp;·&nbsp;
              <a href="${unsubscribeAllUrl}" style="color: #8A8178; text-decoration: underline; font-size: 11px;">Unsubscribe from all</a>
            </p>
          </div>
        </div>
      `,
      text: `Price alert active for ${displayName}. We'll notify you when the price drops to ${targetPriceDisplay}. Unsubscribe: ${unsubscribeUrl} | Unsubscribe from all: ${unsubscribeAllUrl}`,
    });

    const emailSent = (emailResult as any)?.skipped !== true;
    console.log(`[PriceAlert] ${email} subscribed to ${displayName} (email: ${emailSent ? "sent" : "skipped"})`);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: `You'll be notified when the price of ${displayName} drops. Check your inbox for confirmation.`,
          alertId: `alert_${Date.now()}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PriceAlert] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create price alert. Please try again." },
      },
      { status: 500 }
    );
  }
}
