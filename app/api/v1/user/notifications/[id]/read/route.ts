import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const notification = await prisma.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ success: true, data: notification });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Notification not found" } }, { status: 404 });
    return NextResponse.json({ success: false, error: { code: "UPDATE_ERROR", message: error.message } }, { status: 500 });
  }
}
