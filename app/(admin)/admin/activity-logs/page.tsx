"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity, RefreshCw, ChevronLeft, ChevronRight, Download,
  Filter, AlertTriangle, Clock, Shield
} from "lucide-react";

interface LogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null } | null;
}

interface SummaryItem { action: string; entityType: string; count: number }

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ACTION_COLORS: Record<string, string> = {
  publish: "badge-admin-success", approve: "badge-admin-success",
  reject: "badge-admin-warning", delete: "badge-admin-error",
  update: "badge-admin-neutral", create: "badge-admin-success",
  edit: "badge-admin-neutral", rollback: "badge-admin-warning",
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter !== "all") params.set("entityType", entityFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/v1/admin/activity-logs?${params}`);
      const json = await res.json();
      if (json.success) { setLogs(json.data.logs); setSummary(json.data.summary); setTotalPages(json.pagination.totalPages); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, actionFilter, entityFilter, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCSV = () => {
    const header = "Time,User,Action,Entity Type,Entity ID\n";
    const rows = logs.map((l) => `"${formatDate(l.createdAt)}","${l.user?.name || ""}","${l.action}","${l.entityType}","${l.entityId || ""}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)]"><Activity size={14} /> AUDIT &amp; ACTIVITY</div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Activity Logs</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Full audit trail of all admin actions across the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="btn-admin text-xs"><Download size={14} /> Export CSV</button>
            <button onClick={() => { setPage(1); fetchLogs(); }} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {summary.slice(0, 12).map((s, i) => (
            <div key={i} className="admin-card p-3 text-center">
              <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${ACTION_COLORS[s.action] || "badge-admin-neutral"} mb-1`}>{s.action}</div>
              <div className="text-xs text-[var(--admin-text-muted)]">{s.entityType}</div>
              <div className="text-xl font-semibold tabular-nums">{s.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-[var(--admin-text-muted)]"><Filter size={14} /> Filters</span>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1.5 text-xs text-white">
          <option value="all">All Actions</option>
          <option value="publish">Publish</option><option value="approve">Approve</option><option value="reject">Reject</option>
          <option value="delete">Delete</option><option value="update">Update</option><option value="create">Create</option><option value="edit">Edit</option>
        </select>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1.5 text-xs text-white">
          <option value="all">All Types</option>
          <option value="product">Product</option><option value="article">Article</option><option value="comment">Comment</option>
          <option value="brand">Brand</option><option value="user">User</option><option value="category">Category</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1.5 text-xs text-white" />
        <span className="text-xs text-[var(--admin-text-muted)]">to</span>
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1.5 text-xs text-white" />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Clock size={18} className="animate-spin text-[var(--admin-text-secondary)]" /><span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading logs...</span></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]"><Activity size={32} className="mb-3 opacity-50" /><p className="text-sm">No activity logs found</p></div>
        ) : (
          <table className="admin-table w-full min-w-[800px]">
            <thead><tr>
              <th className="w-[140px]">Time</th><th className="w-[160px]">User</th><th className="w-[100px]">Action</th><th className="w-[100px]">Type</th><th className="w-[160px]">Entity</th><th>IP Address</th>
            </tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                  <td className="text-xs text-[var(--admin-text-muted)] whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td><span className="text-sm font-medium">{log.user?.name || "System"}</span></td>
                  <td><span className={`badge-admin ${ACTION_COLORS[log.action] || "badge-admin-neutral"}`}>{log.action}</span></td>
                  <td className="text-xs text-[var(--admin-text-secondary)]">{log.entityType}</td>
                  <td className="text-xs text-[var(--admin-text-muted)]">{log.entityId ? `${log.entityType.slice(0, 3)}_${log.entityId.slice(0, 8)}...` : "—"}</td>
                  <td className="text-xs text-[var(--admin-text-muted)] font-mono">{log.ipAddress || "—"}</td>
                </tr>
              ))}
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

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-center gap-1"><AlertTriangle size={12} /> All admin actions are logged immutably. Retained for compliance.</div>
    </div>
  );
}

