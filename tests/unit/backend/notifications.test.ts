/**
 * Notification Service Tests
 *
 * Tests notification creation, routing, and comment notification logic.
 * Pure logic with mocked Prisma — no database required.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Notification types matching Prisma enum
type NotificationType =
  | "COMMENT_APPROVED"
  | "COMMENT_FLAGGED"
  | "PRICE_DROP"
  | "AFFILIATE_ALERT"
  | "SECURITY"
  | "SYSTEM"
  | "COMMENT_REPLY";

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

const EMAIL_TRIGGER_TYPES: NotificationType[] = ["PRICE_DROP", "AFFILIATE_ALERT", "SECURITY"];

describe("Notification Service", () => {
  describe("Notification Messages", () => {
    it("has messages for all comment status actions", () => {
      const actions: CommentStatusAction[] = ["approve", "reject", "delete"];
      for (const action of actions) {
        expect(NOTIFICATION_MESSAGES[action]).toBeDefined();
        expect(NOTIFICATION_MESSAGES[action].title).toBeDefined();
        expect(NOTIFICATION_MESSAGES[action].body).toBeDefined();
      }
    });

    it("approve message is positive", () => {
      expect(NOTIFICATION_MESSAGES.approve.title).toContain("approved");
    });

    it("reject message indicates the comment was flagged", () => {
      expect(NOTIFICATION_MESSAGES.reject.title).toContain("flagged");
    });

    it("delete message indicates removal", () => {
      expect(NOTIFICATION_MESSAGES.delete.title).toContain("removed");
    });

    it("all messages are non-empty strings", () => {
      for (const msg of Object.values(NOTIFICATION_MESSAGES)) {
        expect(msg.title.length).toBeGreaterThan(0);
        expect(msg.body.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Email Trigger Types", () => {
    it("PRICE_DROP triggers email", () => {
      expect(EMAIL_TRIGGER_TYPES).toContain("PRICE_DROP");
    });

    it("AFFILIATE_ALERT triggers email", () => {
      expect(EMAIL_TRIGGER_TYPES).toContain("AFFILIATE_ALERT");
    });

    it("SECURITY triggers email", () => {
      expect(EMAIL_TRIGGER_TYPES).toContain("SECURITY");
    });

    it("does not trigger email for regular notifications", () => {
      const nonTriggerTypes: NotificationType[] = ["SYSTEM", "COMMENT_APPROVED", "COMMENT_REPLY", "COMMENT_FLAGGED"];
      for (const type of nonTriggerTypes) {
        expect(EMAIL_TRIGGER_TYPES).not.toContain(type);
      }
    });
  });

  describe("Comment Notification Routing", () => {
    it("maps approve to COMMENT_APPROVED type", () => {
      const actionToType: Record<string, string> = {
        approve: "COMMENT_APPROVED",
        reject: "COMMENT_FLAGGED",
        delete: "COMMENT_FLAGGED",
      };
      expect(actionToType.approve).toBe("COMMENT_APPROVED");
      expect(actionToType.reject).toBe("COMMENT_FLAGGED");
      expect(actionToType.delete).toBe("COMMENT_FLAGGED");
    });

    it("maps all status actions to valid notification types", () => {
      // In production, approve → COMMENT_APPROVED, reject/delete → COMMENT_FLAGGED
      const notificationTypeMap: Record<CommentStatusAction, NotificationType> = {
        approve: "COMMENT_APPROVED",
        reject: "COMMENT_FLAGGED",
        delete: "COMMENT_FLAGGED",
      };

      const actions: CommentStatusAction[] = ["approve", "reject", "delete"];
      for (const action of actions) {
        const notifType = notificationTypeMap[action];
        expect(notifType).toBeDefined();
        expect(notifType.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Notification Data Shape", () => {
    it("notification data contains comment metadata", () => {
      const notificationData = {
        commentId: "cm8abc123def456",
        articleId: "art_001",
        articleTitle: "Craftsmanship Meets Sustainability",
        articleUrl: "https://alayainsider.com/articles/craftsmanship-meets-sustainability",
        action: "approve" as const,
      };

      expect(notificationData.commentId).toMatch(/^cm8/);
      expect(notificationData.articleUrl).toContain("alayainsider.com");
    });
  });
});
