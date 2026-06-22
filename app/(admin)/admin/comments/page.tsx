"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare, Check, X, Trash2, Search, RefreshCw,
  ChevronLeft, ChevronRight, ExternalLink, AlertTriangle,
  ThumbsUp, ThumbsDown, RotateCcw, Eye, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { CommentDetailDrawer } from "@/components/admin/ui/CommentDetailDrawer";

// Standalone bulk confirmation modal (not defined inside a component to avoid react-hooks/static-components)
function BulkConfirmModal({ show, onClose, onConfirm, bulkActionLabel, selectedCount, isLoading }: {
  show: boolean; onClose: () => void; onConfirm: () => void;
  bulkActionLabel: string; selectedCount: number; isLoading: boolean;
}) {
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">Confirm Bulk Action</h3>
        <p className="text-sm text-[var(--admin-text-secondary)] mb-1">
          Are you sure you want to <strong className="text-white">{bulkActionLabel}</strong> {selectedCount} comment{selectedCount !== 1 ? "s" : ""}?
        </p>
        <p className="text-xs text-[#F87171] mb-5">This action is immediate and irreversible.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn-admin text-xs bg-[#C5AA8A] text-[#0A0A0A] hover:bg-[#D4B88A] disabled:opacity-50">
            {isLoading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <>Confirm {bulkActionLabel}</>}
          </button>
        </div>
      </div>
    </>
  );
}

interface CommentUser { id: string; name: string | null; avatar: string | null; }
interface ArticleRef { id: string; slug: string; title: string; }
interface CommentData {
  id: string; articleId: string; parentId: string | null; userId: string | null;
  guestName: string | null; content: string; upvotes: number; downvotes: number;
  status: string; createdAt: string; deletedAt: string | null;
  user: CommentUser | null; article: ArticleRef;
  parent: { id: string; content: string } | null; _count: { replies: number };
}
interface Counts { all: number; PENDING: number; APPROVED: number; SPAM: number; DELETED: number; }

const STATUS_TABS = [
  { key: "all", label: "All", color: "" },
  { key: "PENDING", label: "Pending", color: "badge-admin-warning" },
  { key: "APPROVED", label: "Approved", color: "badge-admin-success" },
  { key: "SPAM", label: "Spam", color: "badge-admin-error" },
  { key: "DELETED", label: "Deleted", color: "badge-admin-neutral" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr); const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING": return <span className="badge-admin badge-admin-warning">Pending</span>;
    case "APPROVED": return <span className="badge-admin badge-admin-success">Approved</span>;
    case "SPAM": return <span className="badge-admin badge-admin-error">Spam</span>;
    case "DELETED": return <span className="badge-admin badge-admin-neutral">Deleted</span>;
    default: return <span className="badge-admin badge-admin-neutral">{status}</span>;
  }
}

export default function AdminComments() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, PENDING: 0, APPROVED: 0, SPAM: 0, DELETED: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [detailComment, setDetailComment] = useState<CommentData | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ status: statusFilter, page: String(page), limit: "50", sort: "newest" });
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
        const res = await fetch(`/api/v1/admin/comments?${params}`);
        const json = await res.json();
        if (json.success && !cancelled) {
          setComments(json.data.comments);
          setCounts(json.data.counts);
          setTotalPages(json.pagination.totalPages);
        }
      } catch { console.error("Failed to fetch admin comments"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [statusFilter, page, debouncedSearch, refreshKey]);

  // Silent table action — optimistic update with toast
  const handleSilentAction = async (id: string, action: string) => {
    setActionLoading(id);
    // Optimistic update: remove from list or update status
    if (action === "delete") {
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: "DELETED", deletedAt: new Date().toISOString() } : c));
    } else if (action === "approve") {
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: "APPROVED" } : c));
    } else if (action === "reject") {
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: "SPAM" } : c));
    }
    try {
      await fetch("/api/v1/comments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      toast.success(`Comment ${action}d`);
    } catch {
      toast.error(`Failed to ${action} comment`);
      setRefreshKey((k) => k + 1); // Revert on error
    } finally { setActionLoading(null); }
  };

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: "APPROVED", deletedAt: null } : c));
    try {
      await fetch("/api/v1/comments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) });
      toast.success("Comment restored");
    } catch {
      toast.error("Failed to restore comment");
      setRefreshKey((k) => k + 1);
    } finally { setActionLoading(null); }
  };

  // Bulk action with confirmation modal and progress
  const handleBulkAction = async () => {
    if (!bulkAction || selectedComments.size === 0) return;
    setShowBulkConfirm(false);
    setBulkProgress(`Processing ${selectedComments.size} comments...`);
    setActionLoading("bulk");
    try {
      const res = await fetch("/api/v1/admin/comments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedComments), action: bulkAction === "restore" ? "approve" : bulkAction }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${json.data.updatedCount} of ${json.data.totalRequested} comments ${bulkAction}d`);
      } else {
        toast.error(json.error?.message || "Bulk action failed");
      }
      setSelectedComments(new Set());
      setBulkAction("");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Bulk action failed");
    } finally {
      setActionLoading(null);
      setBulkProgress(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map((c) => c.id)));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Bulk progress toast */}
      {bulkProgress && (
        <div className="fixed top-4 right-4 z-[9999] bg-[var(--admin-bg-active)] border border-[var(--admin-border)] rounded-lg px-4 py-3 text-sm text-[var(--admin-text)] flex items-center gap-2 shadow-lg">
          <Loader2 size={14} className="animate-spin text-[var(--admin-accent)]" /> {bulkProgress}
        </div>
      )}

      {/* Bulk confirmation modal */}
      <BulkConfirmModal
        show={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkAction}
        bulkActionLabel={bulkAction}
        selectedCount={selectedComments.size}
        isLoading={actionLoading === "bulk"}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)]"><MessageSquare size={14} /> COMMUNITY</div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Comments</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Moderate, review, and manage all community comments.
              {counts.PENDING > 0 && <span className="text-[#FBBF24] ml-1">{counts.PENDING} awaiting review.</span>}
            </p>
          </div>
          <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.key as keyof Counts] ?? 0;
          const isActive = statusFilter === tab.key;
          return (
            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); setSelectedComments(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isActive ? "bg-[#C5AA8A]/15 text-[var(--admin-accent)] border border-[#C5AA8A]/30" : "text-[var(--admin-text-secondary)] hover:text-[#EDEDED] hover:bg-[var(--admin-bg-hover)] border border-transparent"}`}>
              {tab.label}{count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab.color || "bg-[var(--admin-bg-active)] text-[var(--admin-text-secondary)]"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Search + Bulk actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by content or author..." className="input-admin w-full pl-10 pr-4" />
        </div>
        {selectedComments.size > 0 && (
          <div className="flex items-center gap-3 bg-[#1A1A1A] px-4 py-2 rounded-lg border border-[var(--admin-border)]">
            <span className="text-xs text-[var(--admin-text-secondary)]">{selectedComments.size} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1 text-xs text-[var(--admin-text)]">
              <option value="">Bulk action...</option>
              <option value="approve">Approve</option>
              <option value="reject">Mark as Spam</option>
              <option value="delete">Delete</option>
              <option value="restore">Restore</option>
              <option value="block_users">Block Users</option>
            </select>
            <button onClick={() => { if (bulkAction && selectedComments.size > 0) setShowBulkConfirm(true); }} disabled={!bulkAction}
              className="btn-admin text-xs disabled:opacity-50">Apply</button>
            <button onClick={() => { setSelectedComments(new Set()); setBulkAction(""); }} className="btn-admin btn-admin-ghost text-xs">Clear</button>
          </div>
        )}
      </div>

      {/* Comments table */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" /><span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading comments...</span></div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
            <MessageSquare size={32} className="mb-3 opacity-50" /><p className="text-sm">No comments found</p>
            {statusFilter !== "all" && <button onClick={() => setStatusFilter("all")} className="text-xs text-[var(--admin-accent)] hover:underline mt-1">View all comments</button>}
          </div>
        ) : (
          <table className="admin-table w-full min-w-[960px]">
            <thead><tr>
              <th className="w-10"><input type="checkbox" checked={selectedComments.size === comments.length && comments.length > 0} onChange={toggleSelectAll} className="accent-[#C5AA8A]" /></th>
              <th className="w-[180px]">Author</th><th>Comment</th><th className="w-[200px]">Article</th>
              <th className="w-[100px]">Status</th><th className="w-[60px]">Votes</th><th className="w-[90px]">Date</th><th className="w-[160px]">Actions</th>
            </tr></thead>
            <tbody>
              {comments.map((comment) => {
                const isDeleted = comment.status === "DELETED";
                const isPending = comment.status === "PENDING";
                return (
                  <tr key={comment.id} className={`border-t border-[var(--admin-border)] transition-colors cursor-pointer ${detailComment?.id === comment.id ? "bg-[#C5AA8A]/5" : "hover:bg-[var(--admin-bg-hover)]"} ${isPending ? "bg-[#FBBF24]/[0.03]" : ""} ${isDeleted ? "opacity-50" : ""}`}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedComments.has(comment.id)} onChange={() => toggleSelect(comment.id)} className="accent-[#C5AA8A]" /></td>
                    <td onClick={() => setDetailComment(comment)}>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#C5AA8A]/20 flex items-center justify-center text-[10px] font-medium text-[var(--admin-accent)] flex-shrink-0">
                          {(comment.user?.name || comment.guestName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{comment.user?.name || comment.guestName || "Anonymous"}</div>
                          {comment.parent && <div className="text-[10px] text-[var(--admin-text-muted)] truncate">Replied to a comment</div>}
                        </div>
                      </div>
                    </td>
                    <td onClick={() => setDetailComment(comment)}>
                      <p className="text-sm text-[var(--admin-text-secondary)] leading-relaxed line-clamp-2">{comment.content}</p>
                    </td>
                    <td onClick={() => setDetailComment(comment)}>
                      <div className="text-sm text-[var(--admin-text-secondary)] truncate max-w-[200px]">{comment.article?.title || "Unknown"}</div>
                    </td>
                    <td onClick={() => setDetailComment(comment)}>{getStatusBadge(comment.status)}</td>
                    <td onClick={() => setDetailComment(comment)}>
                      <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                        <span className="flex items-center gap-1"><ThumbsUp size={12} className="text-[#4ADE80]" />{comment.upvotes}</span>
                        <span className="flex items-center gap-1"><ThumbsDown size={12} className="text-[#F87171]" />{comment.downvotes}</span>
                      </div>
                    </td>
                    <td onClick={() => setDetailComment(comment)} className="text-xs text-[var(--admin-text-muted)] whitespace-nowrap">{formatDate(comment.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {isPending && (<>
                          <button onClick={() => handleSilentAction(comment.id, "approve")} disabled={actionLoading === comment.id} className="p-1.5 rounded hover:bg-[#4ADE80]/10 text-[#4ADE80] transition-colors disabled:opacity-30" title="Approve"><Check size={14} /></button>
                          <button onClick={() => handleSilentAction(comment.id, "reject")} disabled={actionLoading === comment.id} className="p-1.5 rounded hover:bg-[#F87171]/10 text-[#F87171] transition-colors disabled:opacity-30" title="Mark as Spam"><X size={14} /></button>
                        </>)}
                        {comment.status === "SPAM" && !isDeleted && (
                          <button onClick={() => handleSilentAction(comment.id, "approve")} disabled={actionLoading === comment.id} className="p-1.5 rounded hover:bg-[#4ADE80]/10 text-[#4ADE80] transition-colors disabled:opacity-30" title="Unmark Spam"><Check size={14} /></button>
                        )}
                        {isDeleted && (
                          <button onClick={() => handleRestore(comment.id)} disabled={actionLoading === comment.id} className="p-1.5 rounded hover:bg-[#FBBF24]/10 text-[#FBBF24] transition-colors disabled:opacity-30" title="Restore"><RotateCcw size={14} /></button>
                        )}
                        {!isDeleted && (
                          <button onClick={() => handleSilentAction(comment.id, "delete")} disabled={actionLoading === comment.id} className="p-1.5 rounded hover:bg-[#F87171]/10 text-[#F87171] transition-colors disabled:opacity-30" title="Delete"><Trash2 size={14} /></button>
                        )}
                        {comment.article && (
                          <a href={`/articles/${comment.article.slug}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded hover:bg-[#C5AA8A]/10 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors" title="View article"><ExternalLink size={14} /></a>
                        )}
                        <Link href={`/admin/comments/${comment.id}`} onClick={(e) => e.stopPropagation()} className="p-1.5 rounded hover:bg-[#C5AA8A]/10 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors" title="View details"><Eye size={14} /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-[var(--admin-text-muted)]">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30"><ChevronLeft size={14} /> Previous</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pn = start + i;
              if (pn > totalPages) return null;
              return <button key={pn} onClick={() => setPage(pn)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page === pn ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]" : "bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)]"}`}>{pn}</button>;
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-center gap-1"><AlertTriangle size={12} /> Actions use silent optimistic updates. Use bulk actions with caution.</div>

      <CommentDetailDrawer comment={detailComment} open={!!detailComment} onClose={() => setDetailComment(null)}
        onAction={async (id, action, notify) => {
          setActionLoading(id);
          try { await fetch("/api/v1/comments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, notify: notify ?? true }) }); setRefreshKey((k) => k + 1); }
          catch (err) { console.error(err); } finally { setActionLoading(null); }
        }}
        onRefresh={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

