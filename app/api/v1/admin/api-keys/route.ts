import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit(rlId, "admin");
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  }
  try {
    const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, scopes: true, lastUsedAt: true, expiresAt: true, createdAt: true } });
    return NextResponse.json({ success: true, data: keys });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    }
    const { name, scopes } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name is required" } }, { status: 400 });
    const rawKey = `al_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const apiKey = await prisma.apiKey.create({ data: { name, keyHash, scopes: scopes || [] } });
    return NextResponse.json({ success: true, data: { ...apiKey, rawKey } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "CREATE_ERROR", message: error.message } }, { status: 500 });
  }
}
