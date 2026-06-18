import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Rate limiting
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit(rlId, "admin");
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const network = searchParams.get("network");
  const health = searchParams.get("health");

  try {
    const where: any = {};
    if (network && network !== "all") where.network = network;
    if (health && health !== "all") where.health = health;

    const links = await prisma.affiliateLink.findMany({
      where,
      orderBy: { revenue: "desc" },
      take: limit,
      include: { product: { select: { name: true, slug: true } }, brand: { select: { name: true } } },
    });

    const total = await prisma.affiliateLink.count({ where });

    return NextResponse.json({ success: true, data: { links, total } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
