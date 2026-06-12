import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/v1/admin/comments/bulk
// Body: { ids: string[], action: "approve" | "reject" | "delete" | "block_users", notify?: boolean }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, notify } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "ids array is required" } },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "action is required" } },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const id of ids) {
      try {
        switch (action) {
          case "approve":
            await prisma.comment.update({
              where: { id },
              data: { status: "APPROVED", deletedAt: null },
            });
            // Log audit
            await prisma.moderationAuditLog.create({
              data: { commentId: id, action: "approve", oldValue: null, newValue: "APPROVED", source: "admin" },
            }).catch(() => {});
            break;

          case "reject":
            await prisma.comment.update({
              where: { id },
              data: { status: "SPAM" },
            });
            await prisma.moderationAuditLog.create({
              data: { commentId: id, action: "reject", oldValue: null, newValue: "SPAM", source: "admin" },
            }).catch(() => {});
            break;

          case "delete":
            await prisma.comment.update({
              where: { id },
              data: { deletedAt: new Date(), status: "DELETED" },
            });
            await prisma.moderationAuditLog.create({
              data: { commentId: id, action: "delete", oldValue: null, newValue: "DELETED", source: "admin" },
            }).catch(() => {});
            break;

          case "block_users": {
            // First find the comment's user
            const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
            if (comment?.userId) {
              await prisma.user.update({
                where: { id: comment.userId },
                data: { blocked: true },
              });
              await prisma.moderationAuditLog.create({
                data: { commentId: id, action: "block_user", oldValue: null, newValue: "blocked", source: "admin" },
              }).catch(() => {});
            }
            break;
          }

          default:
            results.push({ id, success: false, error: `Unknown action: ${action}` });
            continue;
        }

        results.push({ id, success: true });
        updatedCount++;
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        totalRequested: ids.length,
        results,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "BULK_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
