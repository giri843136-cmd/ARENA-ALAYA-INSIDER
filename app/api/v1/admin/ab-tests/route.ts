import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit(rlId, "admin");
  if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  try {
    const tests = await prisma.abTest.findMany({ orderBy: { createdAt: "desc" }, include: { featureFlag: true, results: true } });
    return NextResponse.json({ success: true, data: tests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const { name, hypothesis, featureFlagId, variants } = await request.json();
    if (!name || !featureFlagId || !variants) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name, featureFlagId, and variants are required" } }, { status: 400 });
    }
    const test = await prisma.abTest.create({ data: { name, hypothesis, featureFlagId, variants } });
    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "CREATE_ERROR", message: error.message } }, { status: 500 });
  }
}
