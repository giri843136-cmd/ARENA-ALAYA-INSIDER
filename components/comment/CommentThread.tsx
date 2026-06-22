"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface CommentThreadProps {
  articleId: string;
}

interface CommentUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface CommentData {
  id: string;
  parentId: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  user: CommentUser | null;
  guestName: string | null;
  createdAt: string;
  status: string;
  replies: CommentData[];
}

// Recursive function to nest replies under their parents
export function nestComments(comments: CommentData[], replies: CommentData[]): CommentData[] {
  const replyMap = new Map<string, CommentData[]>();
  for (const reply of replies) {
    const parentId = reply.parentId || reply.id;
    if (!replyMap.has(parentId)) replyMap.set(parentId, []);
    replyMap.get(parentId)!.push(reply);
  }

  return comments.map((comment) => ({
    ...comment,
    replies: nestComments(
      replyMap.get(comment.id) || [],
      replies.filter((r) => r.id !== comment.id)
    ),
  }));
}

export function CommentThread({ articleId }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"newest" | "oldest" | "best">("best");
  const [total, setTotal] = useState(0);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/comments?articleId=${articleId}&sort=${sort}&status=approved`);
      const json = await res.json();
      if (json.success) {
        const nested = nestComments(json.data.comments, json.data.replies);
        setComments(nested);
        setTotal(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchComments();
    /* eslint-enable react-hooks/set-state-in-effect */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, sort]);

  const handleSubmit = async (content: string, parentId?: string) => {
    const res = await fetch("/api/v1/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, parentId, content }),
    });
    const json = await res.json();
    if (json.success) {
      await fetchComments();
    }
    return json;
  };

  const handleReply = async (parentId: string, content: string) => {
    await handleSubmit(content, parentId);
  };

  const handleVote = async (id: string, action: "upvote" | "downvote") => {
    await fetch("/api/v1/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await fetchComments();
  };

  const handleReport = async (id: string) => {
    await fetch("/api/v1/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "reject" }),
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-[#E4DDD5] dark:border-[#3D3530]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} strokeWidth={1.5} className="text-[#C5AA8A]" />
          <h2 className="font-display text-xl tracking-tight text-[#26221E] dark:text-[#EDE6DC]">
            Discussion
          </h2>
          {total > 0 && (
            <span className="text-sm text-[#8A8178] dark:text-[#64748B]">
              ({total})
            </span>
          )}
        </div>

        {/* Sort */}
        <div className="flex gap-1 text-xs">
          {(["best", "newest", "oldest"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                sort === s
                  ? "bg-[#C5AA8A]/20 text-[#C5AA8A]"
                  : "text-[#8A8178] dark:text-[#64748B] hover:text-[#6D655F]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* New Comment Form */}
      <div className="mb-8 p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-[#E4DDD5] dark:border-[#3D3530]">
        <CommentForm
          onSubmit={async (content) => {
            await handleSubmit(content);
          }}
          placeholder="Join the discussion..."
        />
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#C5AA8A]" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="mx-auto text-[#E4DDD5] dark:text-[#3D3530] mb-3" />
          <p className="text-sm text-[#8A8178] dark:text-[#64748B]">
            Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E4DDD5]/50 dark:divide-[#3D3530]/50">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onVote={handleVote}
              onReport={handleReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
