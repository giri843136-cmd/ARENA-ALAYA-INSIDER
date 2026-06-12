import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, campaignId, event } = body;

    // Log the webhook event for processing
    await prisma.analyticsEvent.create({
      data: {
        name: `resend:${type || event || "unknown"}`,
        properties: { email, campaignId, type, event, rawBody: body },
        source: "resend_webhook",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "WEBHOOK_ERROR", message: error.message } }, { status: 500 });
  }
}
