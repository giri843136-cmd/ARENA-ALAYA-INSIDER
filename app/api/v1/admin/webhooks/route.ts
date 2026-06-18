import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit(rlId, "admin");
  if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  try {
    const webhooks = await prisma.webhook.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: webhooks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const { name, url, events } = await request.json();
    if (!name || !url || !events?.length) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name, url, and events are required" } }, { status: 400 });
    }
    const secret = crypto.randomBytes(32).toString("hex");
    const webhook = await prisma.webhook.create({ data: { name, url, events, secret, isActive: true } });
    return NextResponse.json({ success: true, data: webhook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "CREATE_ERROR", message: error.message } }, { status: 500 });
  }
}
