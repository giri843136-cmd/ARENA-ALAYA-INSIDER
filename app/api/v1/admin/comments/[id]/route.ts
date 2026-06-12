import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notifyCommentAuthor } from "@/lib/comment/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/admin/comments/[id] — Full comment detail with edits and audit logs
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
        article: { select: { id: true, slug: true, title: true } },
        parent: { select: { id: true, content: true, userId: true, guestName: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { replies: true } },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Comment not found" } },
        { status: 404 }
      );
    }

    // Fetch edits and audit logs
    const [edits, auditLogs] = await Promise.all([
      prisma.commentEdit.findMany({
        where: { commentId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.moderationAuditLog.findMany({
        where: { commentId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        edits,
        auditLogs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/admin/comments/[id] — Moderate: approve, reject, delete, edit content
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { action, value, editorId, notify, ipAddress } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "action is required" } },
        { status: 400 }
      );
    }

    // Fetch current state before mutation (for audit log)
    const current = await prisma.comment.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Comment not found" } },
        { status: 404 }
      );
    }

    let oldValue: string | null = null;
    let newValue: string | null = null;

    switch (action) {
      case "approve":
        oldValue = current.status;
        await prisma.comment.update({ where: { id }, data: { status: "APPROVED", deletedAt: null } });
        newValue = "APPROVED";
        break;

      case "reject":
        oldValue = current.status;
        await prisma.comment.update({ where: { id }, data: { status: "SPAM" } });
        newValue = "SPAM";
        break;

      case "delete":
        oldValue = current.status;
        await prisma.comment.update({ where: { id }, data: { deletedAt: new Date(), status: "DELETED" } });
        newValue = "DELETED";
        break;

      case "edit":
        if (!value) throw new Error("value (new content) is required for edit");
        oldValue = current.content;
        newValue = value;
        await prisma.comment.update({ where: { id }, data: { content: value } });
        // Record the edit in comment_edits
        await prisma.commentEdit.create({
          data: {
            commentId: id,
            editorId: editorId || null,
            originalText: oldValue || "",
            editedText: newValue || "",
          },
        });
        break;

      case "restore":
        oldValue = current.status;
        await prisma.comment.update({ where: { id }, data: { status: "APPROVED", deletedAt: null } });
        newValue = "APPROVED";
        break;

      case "block_user":
        if (!current.userId) {
          return NextResponse.json(
            { success: false, error: { code: "NO_USER", message: "Comment has no registered user to block" } },
            { status: 400 }
          );
        }
        oldValue = "false";
        newValue = "true";
        await prisma.user.update({ where: { id: current.userId }, data: { blocked: true } });
        break;

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ACTION", message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }

    // Record the moderation action in audit log (skip for edits — already recorded above)
    if (action !== "edit") {
      const moderationActions = ["approve", "reject", "delete", "restore"] as const;
      if (moderationActions.includes(action as typeof moderationActions[number])) {
        await prisma.moderationAuditLog.create({
          data: {
            commentId: id,
            editorId: editorId || null,
            action,
            oldValue,
            newValue,
            source: "admin",
            ipAddress: ipAddress || null,
          },
        });
      }
    }

    // Send notification to comment author (default: enabled)
    let notificationResult = null;
    if (["approve", "reject", "delete"].includes(action) && notify !== false) {
      notifyCommentAuthor(id, action as "approve" | "reject" | "delete")
        .then((result) => {
          if (!result.notified && result.method !== "none") {
            console.warn(`[Comment Notification] ${result.reason}`);
          }
        })
        .catch((err) => console.error("[Comment Notification] Unexpected error:", err));
      notificationResult = { pending: true };
    }

    return NextResponse.json({ success: true, notification: notificationResult });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
