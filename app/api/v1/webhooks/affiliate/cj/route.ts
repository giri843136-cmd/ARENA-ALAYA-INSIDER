import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, commission, currency, aid, orderId } = body;

    await prisma.analyticsEvent.create({
      data: {
        name: `affiliate_${action || "conversion"}`,
        properties: { action, commission, currency, aid, orderId, rawBody: body },
        revenue: commission ? parseFloat(commission) : null,
        commission: commission ? parseFloat(commission) : null,
        currency: currency || "USD",
        network: "CJ",
        source: "cj_webhook",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "WEBHOOK_ERROR", message: error.message } }, { status: 500 });
  }
}
