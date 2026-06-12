import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  try {
    if (key) {
      const flag = await prisma.featureFlag.findUnique({ where: { key } });
      return NextResponse.json({ success: true, data: flag || { key, enabled: false } });
    }
    const flags = await prisma.featureFlag.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: flags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, description, enabled, percentage, rules } = await request.json();
    if (!key) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "key is required" } }, { status: 400 });
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      create: { key, description, enabled: enabled || false, percentage: percentage || 0, rules },
      update: { ...(enabled !== undefined && { enabled }), ...(percentage !== undefined && { percentage }), ...(rules !== undefined && { rules }), ...(description !== undefined && { description }) },
    });
    return NextResponse.json({ success: true, data: flag });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "UPDATE_ERROR", message: error.message } }, { status: 500 });
  }
}
