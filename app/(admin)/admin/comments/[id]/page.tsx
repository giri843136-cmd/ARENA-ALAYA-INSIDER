"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, Check, X, Trash2, ExternalLink,
  ThumbsUp, ThumbsDown, Clock, Edit3, Save, RotateCcw, AlertTriangle,
  User, Globe, Bell, BellOff, History, Shield, ChevronRight
} from "lucide-react";

interface CommentUser {
  id: string; name: string | null; avatar: string | null; email?: string | null;
}
interface ArticleRef { id: string; slug: string; title: string }
interface ParentRef { id: string; content: string; userId: string | null; guestName: string | null }
interface ReplyData { id: string; content: string; status: string; createdAt: string; user: CommentUser | null; guestName: string | null }
interface CommentEdit { id: string; editorId: string | null; originalText: string; editedText: string; createdAt: string }
interface AuditLog { id: string; editorId: string | null; action: string; oldValue: string | null; newValue: string | null; source: string; createdAt: string }

interface CommentDetail {
  id: string; articleId: string; parentId: string | null; userId: string | null;
  guestName: string | null; guestEmail: string | null; content: string;
  upvotes: number; downvotes: number; status: string; createdAt: string; deletedAt: string | null;
  user: CommentUser | null; article: ArticleRef; parent: ParentRef | null;
  replies: ReplyData[]; _count: { replies: number };
  edits: CommentEdit[]; auditLogs: AuditLog[];
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [comment, setComment] = useState<CommentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notifyAuthor, setNotifyAuthor] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/admin/comments/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setComment(json.data);
          setEditContent(json.data.content);
        } else {
          setError(json.error?.message || "Failed to load comment");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAction = async (action: string, extra?: Record<string, string>) => {
    if (!comment) return;
    setActionLoading(action);
    try {
      const res = await fetch(`/api/v1/admin/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notify: notifyAuthor, ...extra }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Comment ${action}d successfully`);
        // Reload comment
        const reload = await fetch(`/api/v1/admin/comments/${id}`);
        const reloadJson = await reload.json();
        if (reloadJson.success) setComment(reloadJson.data);
      } else {
        showToast("error", json.error?.message || `Failed to ${action}`);
      }
    } catch (err: any) {
      showToast("error", err.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = async () => {
    if (!comment || !editContent.trim() || editContent.trim() === comment.content) return;
    setActionLoading("edit");
    try {
      const res = await fetch(`/api/v1/admin/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", value: editContent.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setIsEditing(false);
        showToast("success", "Comment edited");
        const reload = await fetch(`/api/v1/admin/comments/${id}`);
        const reloadJson = await reload.json();
        if (reloadJson.success) setComment(reloadJson.data);
      } else {
        showToast("error", json.error?.message || "Failed to edit");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to edit");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-3 text-[#A1A1A1]">
        <Clock size={18} className="animate-spin" />
        <span className="text-sm">Loading comment...</span>
      </div>
    </div>
  );

  if (error || !comment) return (
    <div className="p-8">
      <div className="admin-card p-8 text-center">
        <AlertTriangle size={32} className="mx-auto text-[#F87171] mb-3" />
        <p className="text-[#A1A1A1]">{error || "Comment not found"}</p>
        <Link href="/admin/comments" className="text-[#C5AA8A] text-sm hover:underline mt-2 inline-block">
          ← Back to comments
        </Link>
      </div>
    </div>
  );

  const isDeleted = comment.status === "DELETED";
  const isPending = comment.status === "PENDING";
  const isSpam = comment.status === "SPAM";
  const displayName = comment.user?.name || comment.guestName || "Anonymous";

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30" : "bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30"
        }`}>
          {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#666] mb-6">
        <Link href="/admin/comments" className="hover:text-[#C5AA8A]">Comments</Link>
        <ChevronRight size={12} />
        <span className="text-[#A1A1A1]">{id.slice(0, 8)}...</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[#C5AA8A]">
            <MessageSquare size={14} />
            COMMENT DETAIL
          </div>
          <h1 className="text-[32px] font-semibold tracking-[-1px] mt-1">
            Comment by {displayName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifyAuthor(!notifyAuthor)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              notifyAuthor ? "bg-[#C5AA8A]/10 text-[#C5AA8A] border border-[#C5AA8A]/20" : "text-[#666] border border-transparent"
            }`}
          >
            {notifyAuthor ? <Bell size={12} /> : <BellOff size={12} />}
            {notifyAuthor ? "Notify author" : "Silent"}
          </button>
          <Link href="/admin/comments" className="btn-admin text-xs">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Comment Content */}
          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">CONTENT</div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#666]">
                  {comment.content.split(/\s+/).filter(Boolean).length} words
                </span>
                {!isDeleted && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-[#C5AA8A]/15 text-[#C5AA8A]" : "hover:bg-[#1F1F1F] text-[#666] hover:text-white"}`}
                  >
                    {isEditing ? <X size={14} /> : <Edit3 size={14} />}
                  </button>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="input-admin w-full resize-y min-h-[120px] text-sm"
                  maxLength={5000}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setIsEditing(false); setEditContent(comment.content); }} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
                  <button onClick={handleEditSave} disabled={actionLoading === "edit" || !editContent.trim()} className="btn-admin btn-admin-primary text-xs"><Save size={14} /> Save</button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#252525]">
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            )}
          </div>

          {/* Edit History */}
          {comment.edits && comment.edits.length > 0 && (
            <div className="admin-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">
                <History size={12} /> EDIT HISTORY ({comment.edits.length})
              </div>
              <div className="space-y-3">
                {comment.edits.map((edit) => (
                  <div key={edit.id} className="bg-[#0A0A0A] rounded-lg p-4 border border-[#252525]">
                    <div className="text-[10px] text-[#666] mb-2">{formatDateTime(edit.createdAt)} ({formatRelative(edit.createdAt)})</div>
                    <details className="group">
                      <summary className="text-xs text-[#C5AA8A] cursor-pointer hover:text-[#D4B88A]">
                        <span className="group-open:hidden">Show changes</span>
                        <span className="hidden group-open:inline">Hide changes</span>
                      </summary>
                      <div className="mt-3 grid grid-cols-1 gap-3">
                        <div>
                          <div className="text-[10px] text-[#F87171] mb-1">Original</div>
                          <div className="text-xs text-[#A1A1A1] bg-[#F87171]/5 rounded p-2 border border-[#F87171]/10 line-clamp-4">{edit.originalText}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#4ADE80] mb-1">Edited</div>
                          <div className="text-xs text-[#A1A1A1] bg-[#4ADE80]/5 rounded p-2 border border-[#4ADE80]/10 line-clamp-4">{edit.editedText}</div>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Logs */}
          {comment.auditLogs && comment.auditLogs.length > 0 && (
            <div className="admin-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">
                <Shield size={12} /> MODERATION HISTORY ({comment.auditLogs.length})
              </div>
              <table className="admin-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {comment.auditLogs.map((log) => (
                    <tr key={log.id} className="border-t border-[#252525]">
                      <td className="text-xs text-[#666] whitespace-nowrap">{formatRelative(log.createdAt)}</td>
                      <td>
                        <span className={`badge-admin ${
                          log.action === "approve" || log.action === "restore" ? "badge-admin-success" :
                          log.action === "reject" ? "badge-admin-warning" :
                          log.action === "delete" ? "badge-admin-error" : "badge-admin-neutral"
                        }`}>{log.action}</span>
                      </td>
                      <td className="text-xs text-[#666]">{log.oldValue || "—"}</td>
                      <td className="text-xs text-[#A1A1A1]">{log.newValue || "—"}</td>
                      <td className="text-xs text-[#666]">{log.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="admin-card p-6 space-y-4">
              <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">REPLIES ({comment.replies.length})</div>
              <div className="space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-[#0A0A0A] rounded-lg p-3 border border-[#252525] ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{reply.user?.name || reply.guestName || "Anonymous"}</span>
                      <span className="text-[10px] text-[#666]">{formatRelative(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#A1A1A1]">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <div className="admin-card p-5 space-y-3">
            <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">AUTHOR</div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#C5AA8A]/20 flex items-center justify-center text-sm font-medium text-[#C5AA8A]">
                {displayName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{displayName}</div>
                <div className="text-xs text-[#666] flex items-center gap-1 mt-0.5">
                  {comment.user ? <User size={11} /> : <Globe size={11} />}
                  {comment.user ? "Registered user" : "Guest"}
                </div>
                {comment.guestEmail && <div className="text-xs text-[#666] mt-1">{comment.guestEmail}</div>}
              </div>
            </div>
          </div>

          {/* Article Info */}
          <div className="admin-card p-5 space-y-3">
            <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">ARTICLE</div>
            <div className="text-sm text-white">{comment.article?.title || "Unknown"}</div>
            {comment.article?.slug && (
              <a href={`/articles/${comment.article.slug}`} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1 text-xs text-[#C5AA8A] hover:text-[#D4B88A]">
                View article <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Parent (if reply) */}
          {comment.parent && (
            <div className="admin-card p-5 space-y-3">
              <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">REPLIED TO</div>
              <div className="bg-[#0A0A0A] rounded p-3 border border-[#252525]">
                <p className="text-xs text-[#A1A1A1] line-clamp-3">{comment.parent.content}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="admin-card p-5 space-y-3">
            <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">STATS</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1.5"><ThumbsUp size={14} className="text-[#4ADE80]" /> {comment.upvotes}</div>
              <div className="flex items-center gap-1.5"><ThumbsDown size={14} className="text-[#F87171]" /> {comment.downvotes}</div>
              <div className="flex items-center gap-1.5"><MessageSquare size={14} className="text-[#C5AA8A]" /> {comment._count.replies} replies</div>
              <div className="flex items-center gap-1.5"><Clock size={14} className="text-[#666]" /> {formatRelative(comment.createdAt)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="admin-card p-5 space-y-3">
            <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">ACTIONS</div>
            <div className="space-y-2">
              {isPending && (
                <>
                  <button onClick={() => handleAction("approve")} disabled={!!actionLoading}
                    className="w-full btn-admin text-xs bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 hover:bg-[#4ADE80]/20 disabled:opacity-40">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleAction("reject")} disabled={!!actionLoading}
                    className="w-full btn-admin text-xs bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20 hover:bg-[#F87171]/20 disabled:opacity-40">
                    <X size={14} /> Mark as Spam
                  </button>
                </>
              )}
              {isSpam && (
                <button onClick={() => handleAction("approve")} disabled={!!actionLoading}
                  className="w-full btn-admin text-xs bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 hover:bg-[#4ADE80]/20 disabled:opacity-40">
                  <Check size={14} /> Unmark Spam
                </button>
              )}
              {isDeleted && (
                <button onClick={() => handleAction("restore")} disabled={!!actionLoading}
                  className="w-full btn-admin text-xs bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20 hover:bg-[#FBBF24]/20 disabled:opacity-40">
                  <RotateCcw size={14} /> Restore
                </button>
              )}
              {!isDeleted && (
                <button onClick={() => handleAction("delete")} disabled={!!actionLoading}
                  className="w-full btn-admin text-xs text-[#F87171] border-[#F87171]/20 hover:bg-[#F87171]/10 disabled:opacity-40">
                  <Trash2 size={14} /> Delete
                </button>
              )}
              {comment.userId && !isDeleted && (
                <button onClick={() => handleAction("block_user")} disabled={!!actionLoading}
                  className="w-full btn-admin text-xs text-[#F87171] border-[#F87171]/20 hover:bg-[#F87171]/10 disabled:opacity-40">
                  <Shield size={14} /> Block User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
