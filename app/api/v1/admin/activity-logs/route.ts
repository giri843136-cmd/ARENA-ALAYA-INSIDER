import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/admin/activity-logs?page=1&limit=50&action=...&entityType=...&startDate=...
export async function GET(request: NextRequest) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit(rlId, "admin");
  if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const where: any = {};

    if (action && action !== "all") where.action = { contains: action, mode: "insensitive" };
    if (entityType && entityType !== "all") where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Also get action summary
    const summary = await prisma.activityLog.groupBy({
      by: ["action", "entityType"],
      _count: true,
      orderBy: { _count: { action: "desc" } },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        logs,
        summary: summary.map((s) => ({ action: s.action, entityType: s.entityType, count: s._count })),
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
