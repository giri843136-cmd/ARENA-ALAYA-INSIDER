/**
 * Example webhook handler (for future Stripe billing or affiliate payouts)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Verify + handle events
  console.log("[Webhook] Received Stripe event");

  return NextResponse.json({ received: true });
}
