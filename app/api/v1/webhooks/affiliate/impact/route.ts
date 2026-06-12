import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { OrderId, SKU, CommissionAmount, Currency, EventDate } = body;

    await prisma.analyticsEvent.create({
      data: {
        name: "affiliate_conversion_impact",
        properties: { orderId: OrderId, sku: SKU, commission: CommissionAmount, currency: Currency, eventDate: EventDate },
        revenue: CommissionAmount ? parseFloat(CommissionAmount) : null,
        commission: CommissionAmount ? parseFloat(CommissionAmount) : null,
        currency: Currency || "USD",
        network: "IMPACT",
        source: "impact_webhook",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "WEBHOOK_ERROR", message: error.message } }, { status: 500 });
  }
}
