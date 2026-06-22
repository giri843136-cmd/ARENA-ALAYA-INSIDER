/**
 * Example webhook handler (for future Stripe billing or affiliate payouts)
 */

import { NextResponse } from "next/server";

export async function POST() {
  // Verify + handle events
  console.log("[Webhook] Received Stripe event");

  return NextResponse.json({ received: true });
}
