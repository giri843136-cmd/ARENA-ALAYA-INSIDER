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
    const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ success: true, data: redirects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const { from, to, type } = await request.json();
    if (!from || !to) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "from and to are required" } }, { status: 400 });
    const redirect = await prisma.redirect.create({ data: { from, to, type: type || 301 } });
    return NextResponse.json({ success: true, data: redirect }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ success: false, error: { code: "DUPLICATE", message: "Redirect from this path already exists" } }, { status: 409 });
    return NextResponse.json({ success: false, error: { code: "CREATE_ERROR", message: error.message } }, { status: 500 });
  }
}
