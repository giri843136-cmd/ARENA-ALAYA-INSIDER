"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield, RefreshCw, ChevronLeft, ChevronRight, Download,
  Search, Filter, AlertTriangle, Check, X, Trash2, RotateCcw, Clock
} from "lucide-react";

interface LogEntry {
  id: string;
  commentId: string | null;
  editorId: string | null;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  source: string;
  createdAt: string;
  comment: {
    id: string;
    content: string;
    status: string;
    article: { id: string; slug: string; title: string } | null;
  } | null;
}

interface SummaryItem { action: string; count: number }

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  approve: { label: "Approved", icon: <Check size={14} />, color: "badge-admin-success" },
  reject: { label: "Marked Spam", icon: <X size={14} />, color: "badge-admin-warning" },
  delete: { label: "Deleted", icon: <Trash2 size={14} />, color: "badge-admin-error" },
  restore: { label: "Restored", icon: <RotateCcw size={14} />, color: "badge-admin-success" },
  edit: { label: "Edited", icon: <Check size={14} />, color: "badge-admin-neutral" },
  block_user: { label: "User Blocked", icon: <Shield size={14} />, color: "badge-admin-error" },
};

export default function ModerationLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchDateStart, setSearchDateStart] = useState("");
  const [searchDateEnd, setSearchDateEnd] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (searchDateStart) params.set("startDate", searchDateStart);
      if (searchDateEnd) params.set("endDate", searchDateEnd);

      const res = await fetch(`/api/v1/admin/moderation-logs?${params}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
        setSummary(json.data.summary);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch moderation logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, searchDateStart, searchDateEnd]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCSV = () => {
    const header = "Time,Action,Comment ID,Article,Source\n";
    const rows = logs.map((l) =>
      `"${formatDate(l.createdAt)}","${l.action}","${l.commentId || ""}","${l.comment?.article?.title || ""}","${l.source}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `moderation-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[#C5AA8A]">
          <Shield size={14} /> MODERATION
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Moderation Logs</h1>
            <p className="text-[#A1A1A1] mt-2 text-sm">Audit trail of all comment moderation actions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="btn-admin text-xs"><Download size={14} /> Export CSV</button>
            <button onClick={() => { setPage(1); fetchLogs(); }} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>
      </div>

      {/* Summary Dashboard */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {summary.map((s) => {
            const info = ACTION_LABELS[s.action] || { label: s.action, icon: <Shield size={14} />, color: "badge-admin-neutral" };
            return (
              <div key={s.action} className="admin-card p-4 text-center">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] ${info.color} mb-2`}>
                  {info.icon} {info.label}
                </div>
                <div className="text-2xl font-semibold tabular-nums">{s.count}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-[#666]"><Filter size={14} /> Filters</div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-xs text-white"
        >
          <option value="all">All Actions</option>
          <option value="approve">Approved</option>
          <option value="reject">Marked Spam</option>
          <option value="delete">Deleted</option>
          <option value="restore">Restored</option>
          <option value="edit">Edited</option>
        </select>
        <input type="date" value={searchDateStart} onChange={(e) => { setSearchDateStart(e.target.value); setPage(1); }}
          className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-xs text-white" />
        <span className="text-xs text-[#666]">to</span>
        <input type="date" value={searchDateEnd} onChange={(e) => { setSearchDateEnd(e.target.value); setPage(1); }}
          className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-xs text-white" />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden border border-[#252525] overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Clock size={18} className="animate-spin text-[#A1A1A1]" />
            <span className="text-sm text-[#A1A1A1] ml-2">Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#666]">
            <Shield size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No moderation logs found</p>
          </div>
        ) : (
          <table className="admin-table w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="w-[140px]">Time</th>
                <th className="w-[120px]">Action</th>
                <th className="w-[100px]">Comment</th>
                <th>Article</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const info = ACTION_LABELS[log.action] || { label: log.action, icon: <Shield size={14} />, color: "badge-admin-neutral" };
                return (
                  <tr key={log.id} className="border-t border-[#252525] hover:bg-[#1A1A1A]">
                    <td className="text-xs text-[#666] whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td>
                      <span className={`badge-admin ${info.color}`}>{info.icon} {info.label}</span>
                    </td>
                    <td>
                      {log.commentId ? (
                        <Link href={`/admin/comments/${log.commentId}`} className="text-xs text-[#C5AA8A] hover:underline">
                          {log.commentId.slice(0, 8)}...
                        </Link>
                      ) : <span className="text-xs text-[#666]">—</span>}
                    </td>
                    <td className="text-xs text-[#A1A1A1] max-w-[200px] truncate">
                      {log.comment?.article?.title || "—"}
                    </td>
                    <td className="text-xs text-[#666] max-w-[150px] truncate">{log.oldValue || "—"}</td>
                    <td className="text-xs text-[#A1A1A1] max-w-[150px] truncate">{log.newValue || "—"}</td>
                    <td className="text-xs text-[#666]">{log.source}</td>
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
          <div className="text-xs text-[#666]">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="btn-admin btn-admin-ghost text-xs disabled:opacity-30"><ChevronLeft size={14} /> Previous</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pn = start + i;
              if (pn > totalPages) return null;
              return (
                <button key={pn} onClick={() => setPage(pn)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${page === pn ? "bg-[#C5AA8A] text-[#0A0A0A]" : "bg-[#1A1A1A] text-[#A1A1A1] hover:bg-[#252525]"}`}>
                  {pn}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="btn-admin btn-admin-ghost text-xs disabled:opacity-30">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-[#666] border-t border-[#252525] pt-6 flex items-center gap-1">
        <AlertTriangle size={12} /> All actions are logged immutably. Audit trail retained for compliance.
      </div>
    </div>
  );
}
