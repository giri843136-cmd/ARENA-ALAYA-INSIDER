import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notifyCommentAuthor } from "@/lib/comment/notifications";

/**
 * Comments API — Full CRUD, nested replies, voting, moderation
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/comments?articleId=xxx&page=1&limit=20&sort=newest&status=approved
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const sort = searchParams.get("sort") || "newest";
  const status = searchParams.get("status") || "APPROVED";
  const parentId = searchParams.get("parentId"); // null = top-level only

  if (!articleId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_ARTICLE_ID", message: "articleId is required" } },
      { status: 400 }
    );
  }

  try {
    const where: any = { articleId, deletedAt: null };
    if (status !== "all") where.status = status;
    if (parentId === "null" || !parentId) {
      where.parentId = null; // top-level comments only
    } else if (parentId) {
      where.parentId = parentId;
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
          _count: { select: { replies: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    // Fetch replies for each top-level comment (nested up to depth 3)
    const topLevelIds = comments.filter(c => !c.parentId).map(c => c.id);
    const replies = topLevelIds.length > 0 ? await prisma.comment.findMany({
      where: { parentId: { in: topLevelIds }, deletedAt: null, status: "APPROVED" },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { replies: true } },
      },
    }) : [];

    return NextResponse.json({
      success: true,
      data: {
        comments,
        replies,
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

// POST /api/v1/comments — Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, parentId, content, userId, guestName, guestEmail } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "articleId and content are required" } },
        { status: 400 }
      );
    }

    // Check nesting depth (max 3 levels)
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parent?.parentId) {
        const grandparent = await prisma.comment.findUnique({ where: { id: parent.parentId } });
        if (grandparent?.parentId) {
          return NextResponse.json(
            { success: false, error: { code: "MAX_DEPTH", message: "Maximum nesting depth of 3 reached" } },
            { status: 400 }
          );
        }
      }
    }

    // Spam check (async, non-blocking)
    const isSpam = await checkSpam(content);

    const comment = await prisma.comment.create({
      data: {
        articleId,
        parentId: parentId || null,
        userId: userId || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        content,
        status: isSpam ? "SPAM" : "PENDING", // Auto-hold if spam or requires approval
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

// PATCH /api/v1/comments — Vote, moderate, edit
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, value, notify } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "id and action are required" } },
        { status: 400 }
      );
    }

    let statusChanged = false;
    const moderationActions = ["approve", "reject", "delete"] as const;

    // Fetch current state for audit logging
    const current = await prisma.comment.findUnique({ where: { id } });

    switch (action) {
      case "upvote":
        await prisma.comment.update({ where: { id }, data: { upvotes: { increment: 1 } } });
        break;
      case "downvote":
        await prisma.comment.update({ where: { id }, data: { downvotes: { increment: 1 } } });
        break;
      case "approve":
        await prisma.comment.update({ where: { id }, data: { status: "APPROVED", deletedAt: null } });
        statusChanged = true;
        // Log to moderation audit
        if (current) {
          prisma.moderationAuditLog.create({
            data: { commentId: id, action: "approve", oldValue: current.status, newValue: "APPROVED", source: "admin" },
          }).catch((err) => console.warn('[Audit] Failed to log approve:', err.message));
        }
        break;
      case "reject":
        await prisma.comment.update({ where: { id }, data: { status: "SPAM" } });
        statusChanged = true;
        if (current) {
          prisma.moderationAuditLog.create({
            data: { commentId: id, action: "reject", oldValue: current.status, newValue: "SPAM", source: "admin" },
          }).catch((err) => console.warn('[Audit] Failed to log reject:', err.message));
        }
        break;
      case "delete":
        await prisma.comment.update({ where: { id }, data: { deletedAt: new Date(), status: "DELETED" } });
        statusChanged = true;
        if (current) {
          prisma.moderationAuditLog.create({
            data: { commentId: id, action: "delete", oldValue: current.status, newValue: "DELETED", source: "admin" },
          }).catch((err) => console.warn('[Audit] Failed to log delete:', err.message));
        }
        break;
      case "edit":
        if (!value) throw new Error("value (new content) is required for edit");
        await prisma.comment.update({ where: { id }, data: { content: value } });
        // Log edit to comment_edits and audit
        if (current && current.content !== value) {
          prisma.commentEdit.create({
            data: { commentId: id, originalText: current.content, editedText: value },
          }).catch((err) => console.warn('[Audit] Failed to log edit:', err.message));
          prisma.moderationAuditLog.create({
            data: { commentId: id, action: "edit", oldValue: "content updated", newValue: "content updated", source: "admin" },
          }).catch((err) => console.warn('[Audit] Failed to log edit audit:', err.message));
        }
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ACTION", message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }

    // Send notification to comment author (default: enabled, opt out via notify=false)
    if (statusChanged && (notify !== false)) {
      const typedAction = action as typeof moderationActions[number];
      if (moderationActions.includes(typedAction)) {
        // Fire and forget — don't block the response
        notifyCommentAuthor(id, typedAction).then((result) => {
          if (!result.notified && result.method !== "none") {
            console.warn(`[Comment Notification] ${result.reason}`);
          }
        }).catch((err) => {
          console.error("[Comment Notification] Unexpected error:", err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

// Spam detection using lightweight rules + optional OpenAI moderation
async function checkSpam(content: string): Promise<boolean> {
  // Rule-based quick checks
  const rules = [
    /\b(buy now|click here|free money|earn fast|limited offer)\b/i,
    /(https?\:\/\/)\s*[^\s]+/g, // multiple links
    /(.)\1{10,}/, // repeated characters
  ];

  let spamScore = 0;
  for (const rule of rules) {
    const matches = content.match(rule);
    if (matches) spamScore += matches.length;
  }

  // If content has more than 2 links, likely spam
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) spamScore += 3;

  // If very short and promotional
  if (content.length < 10 && /\b(check|buy|deal|offer)\b/i.test(content)) {
    spamScore += 2;
  }

  // Try OpenAI moderation if API key available
  if (process.env.OPENAI_API_KEY && spamScore < 3) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const moderation = await openai.moderations.create({ input: content });
      if (moderation.results[0]?.flagged) {
        spamScore += 5;
      }
    } catch {}
  }

  return spamScore >= 3;
}
