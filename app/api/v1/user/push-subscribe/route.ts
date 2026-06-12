import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId, subscription } = await request.json();
    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "userId and subscription.endpoint are required" } }, { status: 400 });
    }

    const pushSub = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: { userId, endpoint: subscription.endpoint, p256dh: subscription.keys?.p256dh || "", auth: subscription.keys?.auth || "" },
      update: { userId, p256dh: subscription.keys?.p256dh || "", auth: subscription.keys?.auth || "" },
    });

    return NextResponse.json({ success: true, data: pushSub });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "SUBSCRIBE_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "endpoint is required" } }, { status: 400 });

    await prisma.pushSubscription.delete({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "DELETE_ERROR", message: error.message } }, { status: 500 });
  }
}
