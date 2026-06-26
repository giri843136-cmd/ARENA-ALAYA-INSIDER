"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ActivityEntry {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  user: { name: string | null } | null;
  metadata: any;
}

export default function ActivityTimeline() {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/activity-logs?page=${page}&limit=25`);
        const json = await res.json();
        if (json.success && !cancelled) {
          setLogs(json.data.logs);
          setTotalPages(json.pagination.totalPages);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const exportCSV = () => {
    if (logs.length === 0) { toast.error("No data to export"); return; }
    const header = "Time,User,Action,Entity Type\n";
    const rows = logs.map((l) =>
      `"${new Date(l.createdAt).toLocaleString()}","${l.user?.name || "System"}","${l.action}","${l.entityType}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `activity-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">AUDIT &amp; ACTIVITY</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Activity Timeline</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-admin text-xs"><Download size={14} /> Export CSV</button>
          <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
            <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading activity...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
            <Activity size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No activity found</p>
          </div>
        ) : (
          <table className="admin-table w-full text-sm min-w-[880px]">
            <thead>
              <tr className="bg-[var(--admin-bg-elevated)]">
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                  <td className="font-mono text-[var(--admin-text-secondary)] text-xs">{formatDate(log.createdAt)}</td>
                  <td className="font-medium">{log.user?.name || "System"}</td>
                  <td>{log.action.replace(/_/g, " ")}</td>
                  <td className="text-[var(--admin-text-secondary)] text-xs">{log.entityType}</td>
                  <td className="text-right text-xs text-[var(--admin-text-muted)]">View diff →</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-[var(--admin-text-muted)]">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30"><ChevronLeft size={14} /> Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-[var(--admin-text-muted)]">All actions are immutable. Full audit trail retained for 7 years.</div>
    </div>
  );
}
