"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, Reply, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { CommentForm } from "./CommentForm";

interface CommentUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface CommentData {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  user: CommentUser | null;
  guestName: string | null;
  createdAt: string;
  status: string;
  isAuthor?: boolean;
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  depth?: number;
  onReply: (parentId: string, content: string) => void;
  onVote: (id: string, action: "upvote" | "downvote") => void;
  onReport: (id: string) => void;
}

export function CommentItem({ comment, depth = 0, onReply, onVote, onReport }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const score = comment.upvotes - comment.downvotes;
  const canNest = depth < 2; // Max 3 levels total (0-indexed)

  const timeAgo = (dateStr: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const displayName = comment.user?.name || comment.guestName || "Anonymous";
  const avatarUrl = comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=C5AA8A&color=fff&size=40`;

  return (
    <div className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-[#E4DDD5]/60 dark:border-[#3D3530]/60" : ""}`}>
      <div className="group py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Image
            src={avatarUrl}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full object-cover flex-shrink-0"
            unoptimized
          />
          <div>
            <span className="text-sm font-medium text-[#26221E] dark:text-[#EDE6DC]">
              {displayName}
            </span>
            {comment.isAuthor && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-[#C5AA8A]/20 text-[#C5AA8A] rounded-full uppercase tracking-wider">
                Author
              </span>
            )}
            <span className="text-xs text-[#8A8178] dark:text-[#64748B] ml-2">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-[#6D655F] dark:text-[#B8AFA3] leading-relaxed mb-3">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-xs text-[#8A8178] dark:text-[#64748B]">
          {/* Vote buttons */}
          <button
            onClick={() => { onVote(comment.id, "upvote"); setVoted(voted === "up" ? null : "up"); }}
            className={`flex items-center gap-1 hover:text-[#C5AA8A] transition-colors ${voted === "up" ? "text-[#C5AA8A]" : ""}`}
          >
            <ThumbsUp size={13} />
            {comment.upvotes > 0 && <span>{comment.upvotes}</span>}
          </button>
          <button
            onClick={() => { onVote(comment.id, "downvote"); setVoted(voted === "down" ? null : "down"); }}
            className={`flex items-center gap-1 hover:text-[#C5AA8A] transition-colors ${voted === "down" ? "text-[#C5AA8A]" : ""}`}
          >
            <ThumbsDown size={13} />
          </button>

          {/* Score */}
          <span className={`font-medium ${score > 0 ? "text-green-600" : score < 0 ? "text-red-500" : ""}`}>
            {score}
          </span>

          {/* Reply */}
          {canNest && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 hover:text-[#C5AA8A] transition-colors"
            >
              <Reply size={13} />
              Reply
            </button>
          )}

          {/* Report */}
          <button
            onClick={() => onReport(comment.id)}
            className="flex items-center gap-1 hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100"
          >
            <Flag size={13} />
          </button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              onSubmit={(content) => {
                onReply(comment.id, content);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${displayName}...`}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-[#C5AA8A] hover:text-[#B99B79] mb-2 transition-colors"
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReplies ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onVote={onVote}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
