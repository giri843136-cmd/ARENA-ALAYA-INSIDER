/**
 * ALAYA INSIDER — Comment Notification Service
 * Sends in-app notifications and emails to comment authors when their comment status changes.
 */

import { prisma } from "@/lib/db/prisma";
import { sendTransactionalEmail } from "@/lib/backend/email/resend";

type CommentStatusAction = "approve" | "reject" | "delete";

const NOTIFICATION_MESSAGES: Record<CommentStatusAction, { title: string; body: string }> = {
  approve: {
    title: "Your comment was approved",
    body: "Your comment has been approved and is now visible on the article.",
  },
  reject: {
    title: "Your comment was flagged",
    body: "Your comment has been flagged and is not publicly visible.",
  },
  delete: {
    title: "Your comment was removed",
    body: "Your comment has been removed from the article.",
  },
};

/**
 * Check if a user has muted comment status notifications.
 * Uses the existing NotificationMute model with targetType="notification_type" and
 * targetId="COMMENT_STATUS_CHANGED" as a global mute for comment notifications.
 */
export async function hasMutedCommentNotifications(userId: string): Promise<boolean> {
  try {
    const mute = await prisma.notificationMute.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: "notification_type",
          targetId: "COMMENT_STATUS_CHANGED",
        },
      },
    });

    if (!mute) return false;

    // If muteUntil is set and in the future, the notification is muted
    if (mute.muteUntil && mute.muteUntil > new Date()) return true;
    // If no muteUntil (permanent mute), the notification is muted
    if (!mute.muteUntil) return true;

    return false;
  } catch {
    return false; // Fail open — don't block notifications if check fails
  }
}

/**
 * Toggle the mute state for comment status notifications for a user.
 * Returns the new mute state (true = muted, false = unmuted).
 */
export async function toggleCommentNotificationMute(
  userId: string,
  muted: boolean
): Promise<{ muted: boolean }> {
  if (muted) {
    // Create or upsert the mute record
    await prisma.notificationMute.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: "notification_type",
          targetId: "COMMENT_STATUS_CHANGED",
        },
      },
      update: {},
      create: {
        userId,
        targetType: "notification_type",
        targetId: "COMMENT_STATUS_CHANGED",
      },
    });
    return { muted: true };
  } else {
    // Remove the mute record
    await prisma.notificationMute.deleteMany({
      where: {
        userId,
        targetType: "notification_type",
        targetId: "COMMENT_STATUS_CHANGED",
      },
    });
    return { muted: false };
  }
}

export async function notifyCommentAuthor(
  commentId: string,
  action: CommentStatusAction
): Promise<{ notified: boolean; method?: "in_app" | "email" | "none"; reason?: string }> {
  // Fetch comment with user and article info
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      article: { select: { id: true, title: true, slug: true } },
    },
  });

  if (!comment) {
    return { notified: false, reason: "Comment not found" };
  }

  // Check if the user has muted comment notifications
  if (comment.userId) {
    const muted = await hasMutedCommentNotifications(comment.userId);
    if (muted) {
      return { notified: false, method: "none", reason: "User has muted comment notifications" };
    }
  }

  const msg = NOTIFICATION_MESSAGES[action];
  if (!msg) {
    return { notified: false, reason: `Unknown action: ${action}` };
  }

  const articleTitle = comment.article?.title || "an article";
  const articleUrl = comment.article?.slug
    ? `https://alayainsider.com/articles/${comment.article.slug}`
    : null;

  // Create in-app notification for registered users
  if (comment.userId && comment.user) {
    try {
      const notificationType = action === "approve" ? "COMMENT_APPROVED" : "COMMENT_FLAGGED";
      await prisma.notification.create({
        data: {
          userId: comment.userId,
          type: notificationType as any,
          title: msg.title,
          body: `${msg.body} — "${comment.content.slice(0, 120)}" on ${articleTitle}`,
          data: {
            commentId: comment.id,
            articleId: comment.articleId,
            articleTitle,
            articleUrl,
            action,
          },
        },
      });

      // Send email for registered users too (informational)
      if (comment.user.email) {
        await sendTransactionalEmail({
          to: comment.user.email,
          subject: msg.title,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                ${msg.body}
              </p>
              <blockquote style="border-left: 3px solid #C5AA8A; margin: 16px 0; padding: 8px 16px; color: #333; font-style: italic;">
                "${comment.content.slice(0, 300)}"
              </blockquote>
              ${articleUrl ? `<p><a href="${articleUrl}" style="color: #C5AA8A; text-decoration: none; font-weight: 500;">View on ${articleTitle} →</a></p>` : ""}
              <p style="color: #999; font-size: 12px; margin-top: 24px;">
                — ALAYA INSIDER
              </p>
            </div>
          `,
        });
      }

      return { notified: true, method: "in_app" };
    } catch (error: any) {
      console.error("Failed to send in-app notification:", error.message);
      return { notified: false, reason: error.message };
    }
  }

  // Send email to guest commenters who provided an email
  if (comment.guestEmail) {
    try {
      await sendTransactionalEmail({
        to: comment.guestEmail,
        subject: msg.title,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              ${msg.body}
            </p>
            <blockquote style="border-left: 3px solid #C5AA8A; margin: 16px 0; padding: 8px 16px; color: #333; font-style: italic;">
              "${comment.content.slice(0, 300)}"
            </blockquote>
            ${articleUrl ? `<p><a href="${articleUrl}" style="color: #C5AA8A; text-decoration: none; font-weight: 500;">View on ${articleTitle} →</a></p>` : ""}
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              — ALAYA INSIDER
            </p>
          </div>
        `,
      });
      return { notified: true, method: "email" };
    } catch (error: any) {
      console.error("Failed to send email notification:", error.message);
      return { notified: false, reason: error.message };
    }
  }

  return { notified: false, method: "none", reason: "No user ID or guest email available" };
}
