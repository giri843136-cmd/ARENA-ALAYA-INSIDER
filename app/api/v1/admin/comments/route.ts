import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/admin/comments?status=PENDING&page=1&limit=50&search=&sort=newest
export async function GET(request: NextRequest) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit(rlId, "admin");
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";

  try {
    const where: any = {};

    // Filter by status
    if (status !== "all") {
      where.status = status;
    }

    // Include deleted comments only if explicitly querying for DELETED
    if (status !== "DELETED") {
      where.deletedAt = null;
    }

    // Search by content or guest/user name
    if (search.trim()) {
      where.OR = [
        { content: { contains: search.trim(), mode: "insensitive" } },
        { guestName: { contains: search.trim(), mode: "insensitive" } },
        { user: { name: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    const orderBy: any =
      sort === "oldest" ? { createdAt: "asc" } :
      sort === "best" ? { upvotes: "desc" } :
      { createdAt: "desc" };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          article: { select: { id: true, slug: true, title: true } },
          parent: { select: { id: true, content: true } },
          _count: { select: { replies: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    // Get counts for each status
    const [pendingCount, approvedCount, spamCount, deletedCount] = await Promise.all([
      prisma.comment.count({ where: { status: "PENDING", deletedAt: null } }),
      prisma.comment.count({ where: { status: "APPROVED", deletedAt: null } }),
      prisma.comment.count({ where: { status: "SPAM", deletedAt: null } }),
      prisma.comment.count({ where: { status: "DELETED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        comments,
        counts: {
          all: pendingCount + approvedCount + spamCount + deletedCount,
          PENDING: pendingCount,
          APPROVED: approvedCount,
          SPAM: spamCount,
          DELETED: deletedCount,
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
