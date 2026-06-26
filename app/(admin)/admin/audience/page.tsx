"use client";

import React, { useState, useEffect } from "react";
import { Users, Loader2, RefreshCw } from "lucide-react";

interface AudienceStats {
  totalSubscribers: number;
  activeSearches: number;
  bookmarks30d: number;
  weeklyGrowth: number;
  bookmarkGrowth: number;
}

export default function AudienceHub() {
  const [stats, setStats] = useState<AudienceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/admin/stats");
        const json = await res.json();
        if (json.success && !cancelled) {
          setStats({
            totalSubscribers: json.data?.totalUsers || 0,
            activeSearches: json.data?.totalSearches || 0,
            bookmarks30d: json.data?.totalBookmarks || 0,
            weeklyGrowth: 0,
            bookmarkGrowth: 0,
          });
        }
      } catch { /* keep defaults */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">AUDIENCE &amp; INSIGHTS</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Audience Hub</h1>
        </div>
        <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading audience data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="admin-card p-8">
              <div className="text-xs text-[var(--admin-text-secondary)] tracking-widest">TOTAL USERS</div>
              <div className="text-5xl font-semibold mt-3 tabular-nums">
                {stats ? (stats.totalSubscribers || 0).toLocaleString() : "—"}
              </div>
              {stats && stats.weeklyGrowth > 0 && (
                <div className="text-sm text-[#4ADE80] mt-2">+{stats.weeklyGrowth.toLocaleString()} this week</div>
              )}
            </div>
            <div className="admin-card p-8">
              <div className="text-xs text-[var(--admin-text-secondary)] tracking-widest">SAVED SEARCHES</div>
              <div className="text-5xl font-semibold mt-3 tabular-nums">
                {stats ? (stats.activeSearches || 0).toLocaleString() : "—"}
              </div>
              <div className="text-xs text-[var(--admin-text-muted)] mt-2">Across all universes</div>
            </div>
            <div className="admin-card p-8">
              <div className="text-xs text-[var(--admin-text-secondary)] tracking-widest">BOOKMARKS (30d)</div>
              <div className="text-5xl font-semibold mt-3 tabular-nums">
                {stats ? (stats.bookmarks30d || 0).toLocaleString() : "—"}
              </div>
              {stats && stats.bookmarkGrowth > 0 && (
                <div className="text-sm text-[#4ADE80] mt-2">+{stats.bookmarkGrowth}% from last period</div>
              )}
            </div>
          </div>

          <div className="mt-8 admin-card p-8">
            <div className="font-medium mb-5 tracking-widest text-xs text-[var(--admin-accent)]">AUDIENCE SEGMENTS</div>
            <div className="text-sm space-y-4 text-[#EDEDED]">
              <p className="text-[var(--admin-text-muted)] text-xs">
                Audience segments and detailed analytics are available in the full analytics dashboard.
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--admin-text-secondary)]">
                <Users size={14} />
                <span>Data sourced from user activity, search logs, and bookmark events.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
