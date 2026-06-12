import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/admin/moderation-logs?page=1&limit=50&action=approve&editorId=xxx&startDate=...&endDate=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const action = searchParams.get("action");
  const editorId = searchParams.get("editorId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const where: any = { source: "admin" };

    if (action && action !== "all") {
      where.action = action;
    }
    if (editorId) {
      where.editorId = editorId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total, summary] = await Promise.all([
      prisma.moderationAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          comment: {
            select: {
              id: true,
              content: true,
              status: true,
              article: { select: { id: true, slug: true, title: true } },
            },
          },
        },
      }),
      prisma.moderationAuditLog.count({ where }),
      // Summary stats
      prisma.moderationAuditLog.groupBy({
        by: ["action"],
        where: { source: "admin" },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        summary: summary.map((s) => ({ action: s.action, count: s._count })),
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
