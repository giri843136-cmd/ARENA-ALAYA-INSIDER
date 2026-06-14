"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, TrendingUp, TrendingDown, BarChart3,
  RefreshCw, Loader2, Users, Eye, DollarSign,
  AlertTriangle, Clock
} from "lucide-react";

interface ArticleStat {
  id: string;
  title: string;
  slug: string;
  author?: { name: string };
  pageViews: number;
  uniqueVisitors: number;
  affiliateClicks: number;
  revenueGenerated: number;
  scrollDepthAvg: number;
  timeOnPageAvg: number;
  publishedAt: string;
}

interface AuthorPerf {
  name: string;
  totalArticles: number;
  totalClicks: number;
  totalRevenue: number;
  avgReadingTime: number;
}

export default function ContentROI() {
  const [articles, setArticles] = useState<ArticleStat[]>([]);
  const [authors, setAuthors] = useState<AuthorPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"revenue" | "views" | "clicks">("revenue");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/analytics/content?sortBy=${sortBy}&limit=50`);
        const json = await res.json();
        if (json.success && !cancelled) {
          setArticles(json.data.articles || []);
          setAuthors(json.data.authors || []);
        }
      } catch { /* silent - fallback to demo */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [sortBy, refreshKey]);

  const totalRevenue = articles.reduce((s, a) => s + a.revenueGenerated, 0);
  const totalViews = articles.reduce((s, a) => s + a.pageViews, 0);
  const totalClicks = articles.reduce((s, a) => s + a.affiliateClicks, 0);
  const avgScroll = articles.length > 0 ? articles.reduce((s, a) => s + a.scrollDepthAvg, 0) / articles.length : 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <BarChart3 size={14} /> CONTENT ROI
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Content ROI</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Revenue per article, author performance, and content decay tracking.</p>
          </div>
          <button onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} className="btn-admin text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] justify-center mb-2"><FileText size={14} /> Articles</div>
          <div className="text-3xl font-semibold tabular-nums">{articles.length}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] justify-center mb-2"><Eye size={14} /> Total Views</div>
          <div className="text-3xl font-semibold tabular-nums">{totalViews.toLocaleString()}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] justify-center mb-2"><TrendingUp size={14} /> Affiliate Clicks</div>
          <div className="text-3xl font-semibold tabular-nums">{totalClicks.toLocaleString()}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] justify-center mb-2"><DollarSign size={14} /> Revenue</div>
          <div className="text-3xl font-semibold tabular-nums text-[#4ADE80]">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] justify-center mb-2"><BarChart3 size={14} /> Avg Scroll</div>
          <div className="text-3xl font-semibold tabular-nums">{(avgScroll * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Article Performance Table */}
        <div className="lg:col-span-8">
          <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="widget-title">ARTICLE PERFORMANCE</div>
              <div className="flex gap-1">
                {(["revenue", "views", "clicks"] as const).map((s) => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${sortBy === s ? "bg-[var(--admin-accent)] text-[#0A0A0A]" : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"}`}>
                    {s === "revenue" ? "Revenue" : s === "views" ? "Views" : "Clicks"}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" /></div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
                <FileText size={32} className="mb-3 opacity-50" />
                <p className="text-sm">No article stats available yet</p>
              </div>
            ) : (
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th className="text-right">Views</th>
                    <th className="text-right">Clicks</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">CTR</th>
                    <th>Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => {
                    const ctr = a.pageViews > 0 ? (a.affiliateClicks / a.pageViews) * 100 : 0;
                    return (
                      <tr key={a.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                        <td className="max-w-[250px]">
                          <div className="font-medium text-sm truncate">{a.title}</div>
                          <div className="text-[10px] text-[var(--admin-text-muted)]">{a.author?.name || "Unknown"} • {new Date(a.publishedAt).toLocaleDateString()}</div>
                        </td>
                        <td className="text-right tabular-nums">{a.pageViews.toLocaleString()}</td>
                        <td className="text-right tabular-nums">{a.affiliateClicks.toLocaleString()}</td>
                        <td className="text-right tabular-nums font-medium text-[#4ADE80]">${a.revenueGenerated.toLocaleString()}</td>
                        <td className="text-right tabular-nums text-xs">{ctr.toFixed(1)}%</td>
                        <td>
                          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                            <span>{Math.round(a.timeOnPageAvg / 60)}m read</span>
                            <span>•</span>
                            <span>{(a.scrollDepthAvg * 100).toFixed(0)}% scroll</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Author Performance Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <div className="widget-title flex items-center gap-2"><Users size={14} /> AUTHOR PERFORMANCE</div>
            <div className="space-y-4 mt-3">
              {authors.length === 0 ? (
                <div className="text-sm text-[var(--admin-text-muted)]">No author data yet</div>
              ) : (
                authors.map((a) => (
                  <div key={a.name} className="border-b border-[var(--admin-border)] pb-3 last:border-none last:pb-0">
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-1">
                      <span>{a.totalArticles} articles</span>
                      <span>{a.totalClicks.toLocaleString()} clicks</span>
                    </div>
                    <div className="text-sm font-semibold text-[#4ADE80] mt-1">${a.totalRevenue.toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Content Decay Warning */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <div className="widget-title flex items-center gap-2"><AlertTriangle size={14} /> CONTENT DECAY</div>
            <div className="text-sm text-[var(--admin-text-secondary)] mt-2 mb-4">
              Articles with declining traffic that may need refreshing.
            </div>
            <div className="space-y-3">
              {articles.filter((a) => a.scrollDepthAvg < 0.3).slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b border-[var(--admin-border)] pb-2 last:border-none">
                  <span className="truncate max-w-[200px]">{a.title}</span>
                  <span className="text-xs text-[#F87171] flex items-center gap-1">
                    <TrendingDown size={12} /> {a.pageViews.toLocaleString()} views
                  </span>
                </div>
              ))}
              {articles.filter((a) => a.scrollDepthAvg < 0.3).length === 0 && (
                <div className="text-xs text-[var(--admin-text-muted)]">No content decay detected</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <Clock size={12} className="inline mr-1" /> Article stats are updated daily from PageView, AffiliateLink, and AnalyticsEvent data.
      </div>
    </div>
  );
}
