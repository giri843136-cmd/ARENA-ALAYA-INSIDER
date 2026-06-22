"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, RefreshCw, Loader2, AlertTriangle, CheckCircle,
  XCircle, Clock, Search
} from "lucide-react";
import { toast } from "sonner";

interface HealthRecord {
  id: string;
  affiliateLinkId: string;
  lastChecked: string;
  isWorking: boolean;
  responseTimeMs: number | null;
  redirectChain: string[];
  errorMessage: string | null;
  affiliateLink?: {
    id: string;
    url: string;
    label: string;
    network: string;
    product?: { name: string };
  };
}

export default function LinkHealthMonitor() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState("");

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/affiliate-links/health?limit=100");
      const json = await res.json();
      if (json.success) setRecords(json.data.records || json.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchHealth(); }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/v1/admin/affiliate-links/health/scan", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(`Scan complete: ${json.data.checked} links checked, ${json.data.broken} broken`);
        fetchHealth();
      }
    } catch { toast.error("Scan failed"); }
    finally { setScanning(false); }
  };

  const filtered = records.filter((r) =>
    search === "" || r.affiliateLink?.label?.toLowerCase().includes(search.toLowerCase())
  );

  const working = records.filter((r) => r.isWorking).length;
  const broken = records.filter((r) => !r.isWorking).length;
  const avgResponse = records.length > 0
    ? records.reduce((s, r) => s + (r.responseTimeMs || 0), 0) / records.length
    : 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Activity size={14} /> LINK HEALTH MONITOR
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Link Health</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Automated link checking with response time and redirect tracking.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchHealth} disabled={loading} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
            <button onClick={runScan} disabled={scanning} className="btn-admin-primary text-xs">
              {scanning ? <><Loader2 size={14} className="animate-spin" /> Scanning...</> : "Run Full Scan"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Total Checked</div>
          <div className="text-3xl font-semibold tabular-nums mt-1">{records.length}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Working</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#4ADE80]">{working}</div>
          <div className="text-xs text-[var(--admin-text-muted)]">{records.length > 0 ? ((working / records.length) * 100).toFixed(1) : 0}%</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Broken</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#F87171]">{broken}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Avg Response</div>
          <div className="text-3xl font-semibold tabular-nums mt-1">{Math.round(avgResponse)}ms</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by label..." className="input-admin w-full pl-9 text-sm py-2" />
        </div>
        {broken > 0 && (
          <span className="flex items-center gap-1 text-xs text-[#F87171]">
            <AlertTriangle size={12} /> {broken} broken links need attention
          </span>
        )}
      </div>

      {/* Health Records */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
            <Activity size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No link health checks recorded yet</p>
            <button onClick={runScan} disabled={scanning} className="btn-admin-primary text-xs mt-4">Run First Scan</button>
          </div>
        ) : (
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Link</th>
                <th>Network</th>
                <th>Status</th>
                <th className="text-right">Response</th>
                <th>Redirect Chain</th>
                <th>Last Checked</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                  <td className="max-w-[250px] truncate">
                    <div className="text-sm font-medium truncate">{r.affiliateLink?.label || "Unknown"}</div>
                    <div className="text-[10px] text-[var(--admin-text-muted)] truncate">{r.affiliateLink?.url}</div>
                  </td>
                  <td><span className="badge-admin badge-admin-neutral text-[10px]">{r.affiliateLink?.network || "—"}</span></td>
                  <td>
                    {r.isWorking ? (
                      <span className="flex items-center gap-1 text-xs text-[#4ADE80]"><CheckCircle size={12} /> Working</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[#F87171]"><XCircle size={12} /> Broken</span>
                    )}
                  </td>
                  <td className="text-right tabular-nums text-xs">{r.responseTimeMs ? `${r.responseTimeMs}ms` : "—"}</td>
                  <td className="max-w-[200px] truncate text-xs text-[var(--admin-text-muted)]">
                    {r.redirectChain.length > 1 ? `${r.redirectChain.length} redirects` : "Direct"}
                  </td>
                  <td className="text-xs text-[var(--admin-text-muted)] whitespace-nowrap">
                    {new Date(r.lastChecked).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    {r.errorMessage && (
                      <span className="text-[10px] text-[#F87171]" title={r.errorMessage}>Error</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <Clock size={12} className="inline mr-1" /> Link health checks are run daily via automation. Results cached for 24 hours.
      </div>
    </div>
  );
}
