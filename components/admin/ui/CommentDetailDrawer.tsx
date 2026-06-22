"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare, Check, X, Trash2, ExternalLink, ThumbsUp, ThumbsDown,
  ArrowLeft, Clock, Edit3, Save, RotateCcw, Reply, AlertTriangle,
  User, Mail, Globe, Bell, BellOff
} from "lucide-react";

interface CommentUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface ArticleRef {
  id: string;
  slug: string;
  title: string;
}

interface CommentDetail {
  id: string;
  articleId: string;
  parentId: string | null;
  userId: string | null;
  guestName: string | null;
  guestEmail?: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  status: string;
  createdAt: string;
  deletedAt: string | null;
  user: CommentUser | null;
  article: ArticleRef;
  parent: { id: string; content: string } | null;
  _count: { replies: number };
}

interface CommentDetailDrawerProps {
  comment: CommentDetail | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: string, notify?: boolean) => Promise<void>;
  onRefresh: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function CommentDetailDrawer({ comment, open, onClose, onAction, onRefresh }: CommentDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notifyAuthor, setNotifyAuthor] = useState(true);

  // Reset states when comment changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (comment) {
      setEditContent(comment.content);
      setIsEditing(false);
      setConfirmDelete(false);
      setSaveError(null);
      setNotifyAuthor(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [comment?.id]);

  // Close editing when drawer closes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) {
      setIsEditing(false);
      setConfirmDelete(false);
      setSaveError(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  if (!comment || !open) return null;

  const isDeleted = comment.status === "DELETED";
  const isPending = comment.status === "PENDING";
  const isSpam = comment.status === "SPAM";
  const displayName = comment.user?.name || comment.guestName || "Anonymous";
  const isReply = !!comment.parent;

  const handleEditSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      return;
    }

    setActionLoading("edit");
    setSaveError(null);
    try {
      const res = await fetch("/api/v1/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment.id, action: "edit", value: trimmed }),
      });
      const json = await res.json();
      if (!json.success) {
        setSaveError(json.error?.message || "Failed to save edit");
        return;
      }
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save edit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      await onAction(comment.id, action, notifyAuthor);
      if (action === "delete") setConfirmDelete(false);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="badge-admin badge-admin-warning">Pending Review</span>;
      case "APPROVED": return <span className="badge-admin badge-admin-success">Approved</span>;
      case "SPAM": return <span className="badge-admin badge-admin-error">Spam</span>;
      case "DELETED": return <span className="badge-admin badge-admin-neutral">Deleted</span>;
      default: return <span className="badge-admin badge-admin-neutral">{status}</span>;
    }
  };

  const wordCount = comment.content.split(/\s+/).filter(Boolean).length;
  const charCount = comment.content.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#111111] border-l border-[#252525] z-[9998] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252525] px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#1F1F1F] text-[#666] hover:text-[#EDEDED] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#EDEDED]">Comment Details</span>
                {getStatusBadge(comment.status)}
              </div>
              <div className="text-[10px] text-[#666] mt-0.5">ID: {comment.id.slice(0, 12)}...</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Author Section */}
            <div className="admin-card p-5 space-y-3">
              <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">AUTHOR</div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C5AA8A]/20 flex items-center justify-center text-sm font-medium text-[#C5AA8A] flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[#EDEDED]">{displayName}</div>
                  <div className="text-xs text-[#666] mt-0.5">
                    {comment.user ? (
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        Registered user
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Globe size={11} />
                        Guest comment
                      </span>
                    )}
                  </div>
                </div>
                {comment.guestEmail && (
                  <div className="text-xs text-[#666] flex items-center gap-1">
                    <Mail size={11} />
                    {comment.guestEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Content */}
            <div className="admin-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">CONTENT</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#666]">{wordCount} words · {charCount} chars</span>
                  {!isDeleted && (
                    <button
                      onClick={() => { setIsEditing(!isEditing); setEditContent(comment.content); setSaveError(null); }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isEditing
                          ? "bg-[#C5AA8A]/15 text-[#C5AA8A]"
                          : "hover:bg-[#1F1F1F] text-[#666] hover:text-[#EDEDED]"
                      }`}
                      title={isEditing ? "Cancel editing" : "Edit comment"}
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
                    className="input-admin w-full resize-y min-h-[160px] text-sm leading-relaxed"
                    maxLength={5000}
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {saveError && (
                        <span className="text-xs text-[#F87171] flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {saveError}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#666]">{editContent.length}/5000</span>
                      <button
                        onClick={() => { setIsEditing(false); setEditContent(comment.content); setSaveError(null); }}
                        className="btn-admin btn-admin-ghost text-xs"
                        disabled={actionLoading === "edit"}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditSave}
                        disabled={!editContent.trim() || actionLoading === "edit" || editContent.trim() === comment.content}
                        className="btn-admin btn-admin-primary text-xs disabled:opacity-50"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#252525]">
                  <p className="text-sm text-[#EDEDED] leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              )}
            </div>

            {/* Article Info */}
            <div className="admin-card p-5 space-y-3">
              <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">ARTICLE</div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#EDEDED] font-medium">
                  {comment.article?.title || "Unknown article"}
                </div>
                {comment.article?.slug && (
                  <a
                    href={`/articles/${comment.article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#C5AA8A] hover:text-[#D4B88A] transition-colors"
                  >
                    View
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Parent Comment (if reply) */}
            {isReply && comment.parent && (
              <div className="admin-card p-5 space-y-3">
                <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium flex items-center gap-1">
                  <Reply size={11} />
                  REPLIED TO
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#252525]">
                  <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-3">
                    {comment.parent.content}
                  </p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="admin-card p-4 space-y-2">
                <div className="text-[10px] tracking-[1.5px] text-[#666] font-medium">VOTES</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <ThumbsUp size={14} className="text-[#4ADE80]" />
                    <span className="text-[#EDEDED] font-medium">{comment.upvotes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <ThumbsDown size={14} className="text-[#F87171]" />
                    <span className="text-[#EDEDED] font-medium">{comment.downvotes}</span>
                  </div>
                </div>
              </div>
              <div className="admin-card p-4 space-y-2">
                <div className="text-[10px] tracking-[1.5px] text-[#666] font-medium">REPLIES</div>
                <div className="flex items-center gap-1.5 text-sm">
                  <MessageSquare size={14} className="text-[#C5AA8A]" />
                  <span className="text-[#EDEDED] font-medium">{comment._count.replies}</span>
                  <span className="text-[#666] text-xs">
                    {comment._count.replies === 1 ? "reply" : "replies"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="admin-card p-5 space-y-3">
              <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium">TIMELINE</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#666]">
                    <Clock size={14} />
                    Created
                  </div>
                  <div className="text-[#EDEDED] text-xs">
                    {formatDate(comment.createdAt)}
                    <span className="text-[#666] ml-1">({formatDateRelative(comment.createdAt)})</span>
                  </div>
                </div>
                {comment.deletedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#F87171]">
                      <Trash2 size={14} />
                      Deleted
                    </div>
                    <div className="text-[#EDEDED] text-xs">
                      {formatDate(comment.deletedAt)}
                      <span className="text-[#666] ml-1">({formatDateRelative(comment.deletedAt)})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#252525] px-6 py-4 flex-shrink-0 bg-[#0A0A0A]">            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPending && (
                  <>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={actionLoading !== null}
                      className="btn-admin text-xs bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 hover:bg-[#4ADE80]/20 disabled:opacity-40"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={actionLoading !== null}
                      className="btn-admin text-xs bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20 hover:bg-[#F87171]/20 disabled:opacity-40"
                    >
                      <X size={14} />
                      Mark Spam
                    </button>
                  </>
                )}
                {isSpam && (
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading !== null}
                    className="btn-admin text-xs bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 hover:bg-[#4ADE80]/20 disabled:opacity-40"
                  >
                    <Check size={14} />
                    Unmark Spam
                  </button>
                )}
                {isDeleted && (
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading !== null}
                    className="btn-admin text-xs bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20 hover:bg-[#FBBF24]/20 disabled:opacity-40"
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Notify author toggle for moderation actions */}
                {!isDeleted && (
                  <button
                    onClick={() => setNotifyAuthor(!notifyAuthor)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      notifyAuthor
                        ? "bg-[#C5AA8A]/10 text-[#C5AA8A] border border-[#C5AA8A]/20"
                        : "text-[#666] hover:text-[#A1A1A1] border border-transparent"
                    }`}
                    title={notifyAuthor ? "Notify author on action" : "Silent (no notification)"}
                  >
                    {notifyAuthor ? <Bell size={12} /> : <BellOff size={12} />}
                    <span className="hidden sm:inline">{notifyAuthor ? "Notify" : "Silent"}</span>
                  </button>
                )}

                {isDeleted ? null : confirmDelete ? (
                  <div className="flex items-center gap-2 bg-[#F87171]/10 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-[#F87171]">Are you sure?</span>
                    <button
                      onClick={() => handleAction("delete")}
                      disabled={actionLoading !== null}
                      className="text-xs font-medium text-[#F87171] hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-[#666] hover:text-[#EDEDED] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={actionLoading !== null}
                    className="btn-admin text-xs text-[#F87171] border-[#F87171]/20 hover:bg-[#F87171]/10 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
