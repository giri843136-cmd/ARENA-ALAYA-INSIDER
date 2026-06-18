import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cacheAside, cacheInvalidate } from "@/lib/backend/cache/redis-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const brokenOnly = searchParams.get("broken") === "true";
  const skipCache = searchParams.get("refresh") === "true";

  try {
    const where: any = {};
    if (brokenOnly) where.isWorking = false;

    // Invalidate cache if refresh requested
    if (skipCache) {
      await cacheInvalidate(`link-health:${limit}:${brokenOnly}`, { keyPrefix: "alaya" });
    }

    const records = await cacheAside(
      `link-health:${limit}:${brokenOnly}`,
      async () => {
        const results = await prisma.affiliateLinkHealth.findMany({
          where,
          orderBy: { lastChecked: "desc" },
          take: limit,
          include: { affiliateLink: { include: { product: { select: { name: true } } } } },
        });
        return { records: results };
      },
      { ttl: 300, keyPrefix: "alaya" } // 5 minute cache
    );

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
