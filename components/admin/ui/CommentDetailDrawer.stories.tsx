import type { Meta, StoryObj } from "@storybook/react";
import { CommentDetailDrawer } from "./CommentDetailDrawer";
import React from "react";

/**
 * CommentDetailDrawer — A detailed slide-in panel for viewing and moderating a single comment.
 *
 * Features:
 * - Full comment details (author, content, timestamps, stats)
 * - Moderation actions: Approve, Mark Spam, Delete, Restore
 * - Inline editing with save/cancel
 * - Confirm-delete flow with silent/notify toggle
 * - Audit trail with relative/absolute timestamps
 * - Parent comment display (for replies)
 * - Article link
 *
 * This story uses mock comment data to showcase all states.
 */

const mockPendingComment = {
  id: "cm8abc123def456",
  articleId: "art_001",
  parentId: null,
  userId: "user_42",
  guestName: null,
  guestEmail: null,
  content:
    "This is an excellent article! The comparison between traditional craftsmanship and modern sustainable practices really resonated with me. I've been following ALAYA's journey and this piece captures the essence of what makes their approach unique.\n\nI particularly loved the section on material sourcing — more brands need to be transparent about their supply chain.",
  upvotes: 12,
  downvotes: 2,
  status: "PENDING",
  createdAt: "2026-06-13T14:30:00Z",
  deletedAt: null,
  user: {
    id: "user_42",
    name: "Elena Voss",
    avatar: null,
  },
  article: {
    id: "art_001",
    slug: "craftsmanship-meets-sustainability",
    title: "Craftsmanship Meets Sustainability: A New Era for Luxury Fashion",
  },
  parent: null,
  _count: { replies: 2 },
};

const mockApprovedComment = {
  ...mockPendingComment,
  id: "cm8def789ghi012",
  status: "APPROVED",
  createdAt: "2026-06-10T09:15:00Z",
  content:
    "Great insights on the pricing strategy. I've noticed that the subscription model really does create a stronger sense of community among members. Curious to see how this evolves over the next quarter.",
  upvotes: 34,
  downvotes: 1,
  _count: { replies: 5 },
  user: {
    id: "user_17",
    name: "Marcus Chen",
    avatar: null,
  },
};

const mockSpamComment = {
  ...mockPendingComment,
  id: "cm8jkl345mno678",
  status: "SPAM",
  createdAt: "2026-06-14T06:00:00Z",
  content:
    "Check out my website for amazing deals!!! https://spam-link.example.com/buy-now Get 90% off everything!!! Limited time offer!!!!! 🚀🚀🚀",
  upvotes: 0,
  downvotes: 5,
  _count: { replies: 0 },
  user: {
    id: "user_spam_01",
    name: null,
    avatar: null,
  },
  guestName: "Spammer123",
  guestEmail: "spam@example.com",
};

const mockDeletedComment = {
  ...mockPendingComment,
  id: "cm8pqr901stu234",
  status: "DELETED",
  createdAt: "2026-06-08T16:45:00Z",
  deletedAt: "2026-06-09T10:30:00Z",
  content:
    "This was originally a thoughtful comment about the article's themes, now removed by moderation.",
  upvotes: 3,
  downvotes: 0,
  _count: { replies: 0 },
  user: {
    id: "user_88",
    name: "Sarah Williams",
    avatar: null,
  },
};

const mockReplyComment = {
  ...mockPendingComment,
  id: "cm8vwx567yza890",
  status: "APPROVED",
  createdAt: "2026-06-13T18:20:00Z",
  content:
    "Totally agree with this point! I'd add that the cultural heritage aspect is often overlooked in these discussions. The artisans preserving these techniques deserve more recognition.",
  upvotes: 8,
  downvotes: 0,
  _count: { replies: 1 },
  parent: {
    id: "cm8def789ghi012",
    content: "Great insights on the pricing strategy. I've noticed that the subscription model really does create a stronger sense of community...",
  },
  user: {
    id: "user_55",
    name: "Anika Patel",
    avatar: null,
  },
};

const meta: Meta<typeof CommentDetailDrawer> = {
  title: "Admin/UI/CommentDetailDrawer",
  component: CommentDetailDrawer,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onClose: { action: "closed" },
    onAction: { action: "action" },
    onRefresh: { action: "refreshed" },
  },
};

export default meta;
type Story = StoryObj<typeof CommentDetailDrawer>;

/** A comment pending review with approve/spam actions available. */
export const Pending: Story = {
  args: {
    comment: mockPendingComment,
    open: true,
    onClose: () => {},
    onAction: async () => {},
    onRefresh: () => {},
  },
};

/** An approved comment with edit capability and action history. */
export const Approved: Story = {
  args: {
    comment: mockApprovedComment,
    open: true,
    onClose: () => {},
    onAction: async () => {},
    onRefresh: () => {},
  },
};

/** A spam comment with unmark-spam action. */
export const Spam: Story = {
  args: {
    comment: mockSpamComment,
    open: true,
    onClose: () => {},
    onAction: async () => {},
    onRefresh: () => {},
  },
};

/** A deleted comment with restore action. */
export const Deleted: Story = {
  args: {
    comment: mockDeletedComment,
    open: true,
    onClose: () => {},
    onAction: async () => {},
    onRefresh: () => {},
  },
};

/** A reply comment showing the parent comment context. */
export const Reply: Story = {
  args: {
    comment: mockReplyComment,
    open: true,
    onClose: () => {},
    onAction: async () => {},
    onRefresh: () => {},
  },
};

/** Drawer in the closed state — renders nothing. */
export const Closed: Story = {
  args: {
    comment: mockPendingComment,
    open: false,
    onClose: () => {},
    onAction: async () => {},
    onRefresh: () => {},
  },
};
