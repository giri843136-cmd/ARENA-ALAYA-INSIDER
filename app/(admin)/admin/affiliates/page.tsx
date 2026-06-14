"use client";

import React, { useState, useEffect } from "react";
import {
  Link2, RefreshCw, Loader2, ExternalLink, AlertTriangle,
  Search
} from "lucide-react";

interface AffiliateLink {
  id: string;
  network: string;
  url: string;
  label: string;
  commissionRate: number | null;
  health: string;
  clicks: number;
  conversions: number;
  revenue: number;
  lastChecked: string | null;
  product?: { name: string; slug: string };
  brand?: { name: string };
}

export default function AffiliatePerformance() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (networkFilter !== "all") params.set("network", networkFilter);
        if (healthFilter !== "all") params.set("health", healthFilter);
        const res = await fetch(`/api/v1/admin/affiliate-links?${params}`);
        const json = await res.json();
        if (json.success && !cancelled) setLinks(json.data.links || json.data);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [networkFilter, healthFilter, refreshKey]);

  const filtered = links.filter((l) =>
    (search === "" || l.label.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase())) &&
    (networkFilter === "all" || l.network === networkFilter) &&
    (healthFilter === "all" || l.health === healthFilter)
  );

  const totalClicks = filtered.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = filtered.reduce((s, l) => s + l.conversions, 0);
  const totalRevenue = filtered.reduce((s, l) => s + l.revenue, 0);
  const overallEpc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const brokenCount = links.filter((l) => l.health === "BROKEN" || l.health === "EXPIRED").length;

  const networks = [...new Set(links.map((l) => l.network))];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Link2 size={14} /> AFFILIATE PERFORMANCE
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Affiliate Links</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Performance metrics for all affiliate links across networks.</p>
          </div>
          <button onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} className="btn-admin text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="admin-card p-4 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Total Links</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{filtered.length}</div>
        </div>
        <div className="admin-card p-4 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Clicks</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{totalClicks.toLocaleString()}</div>
        </div>
        <div className="admin-card p-4 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Conversions</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{totalConversions.toLocaleString()}</div>
          <div className="text-[10px] text-[#4ADE80]">{conversionRate.toFixed(1)}% rate</div>
        </div>
        <div className="admin-card p-4 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Revenue</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-[#4ADE80]">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="admin-card p-4 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">EPC</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">${overallEpc.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by label or URL..." className="input-admin w-full pl-9 text-sm py-2" />
        </div>
        <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value)}
          className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1.5 text-xs">
          <option value="all">All Networks</option>
          {networks.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}
          className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1.5 text-xs">
          <option value="all">All Health</option>
          <option value="HEALTHY">Healthy</option>
          <option value="DEGRADED">Degraded</option>
          <option value="BROKEN">Broken</option>
          <option value="EXPIRED">Expired</option>
        </select>
        {brokenCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-[#F87171]">
            <AlertTriangle size={12} /> {brokenCount} need attention
          </span>
        )}
      </div>

      {/* Links Table */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
            <Link2 size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No affiliate links found</p>
          </div>
        ) : (
          <table className="admin-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th>Label</th>
                <th>Network</th>
                <th>Product</th>
                <th className="text-right">Clicks</th>
                <th className="text-right">Conv.</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">EPC</th>
                <th>Health</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => (
                <tr key={link.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                  <td className="font-medium text-sm max-w-[200px] truncate">{link.label}</td>
                  <td><span className="badge-admin badge-admin-neutral text-[10px]">{link.network}</span></td>
                  <td className="text-xs text-[var(--admin-text-secondary)]">{link.product?.name || link.brand?.name || "—"}</td>
                  <td className="text-right tabular-nums">{link.clicks.toLocaleString()}</td>
                  <td className="text-right tabular-nums">{link.conversions.toLocaleString()}</td>
                  <td className="text-right tabular-nums font-medium text-[#4ADE80]">${link.revenue.toLocaleString()}</td>
                  <td className="text-right tabular-nums text-xs">{link.clicks > 0 ? `$${(link.revenue / link.clicks).toFixed(2)}` : "—"}</td>
                  <td>
                    <span className={`badge-admin text-[10px] ${
                      link.health === "HEALTHY" ? "badge-admin-success" :
                      link.health === "DEGRADED" ? "badge-admin-warning" : "badge-admin-error"
                    }`}>{link.health}</span>
                  </td>
                  <td className="text-right">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn-admin btn-admin-ghost text-xs p-1.5">
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-center gap-2">
        <AlertTriangle size={12} /> Data from AffiliateLink records. Clicks and conversions are tracked via affiliate network webhooks.
      </div>
    </div>
  );
}
