import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/v1/affiliate/offline-clicks
// Receives batched offline affiliate clicks from the service worker sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateUrl, productId, productSlug, userId, sessionId, userAgent, referrer } = body;

    if (!affiliateUrl) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "affiliateUrl is required" } },
        { status: 400 }
      );
    }

    const click = await prisma.offlineClick.create({
      data: {
        affiliateUrl,
        productId: productId || null,
        productSlug: productSlug || null,
        userId: userId || null,
        sessionId: sessionId || null,
        userAgent: userAgent || null,
        referrer: referrer || null,
        syncedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: click }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SYNC_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

// GET /api/v1/affiliate/offline-clicks?synced=false&page=1&limit=50
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const synced = searchParams.get("synced");

  try {
    const where: any = {};
    if (synced === "false") where.syncedAt = null;
    if (synced === "true") where.syncedAt = { not: null };

    const [clicks, total] = await Promise.all([
      prisma.offlineClick.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.offlineClick.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clicks,
        counts: {
          unsynced: await prisma.offlineClick.count({ where: { syncedAt: null } }),
          total,
        },
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
