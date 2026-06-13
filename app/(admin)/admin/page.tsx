"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart3, TrendingUp, Package, BookOpen, Zap, 
  ShoppingCart, Heart, Users, Eye,
  Loader2 
} from "lucide-react";
import { SocialProofControls } from "@/components/admin/ui/SocialProofControls";

interface Stats {
  productCount: number;
  articleCount: number;
  brandCount: number;
  categoryCount: number;
  commentCount: number;
  userCount: number;
  dealCount: number;
  pendingReviewCount: number;
}

export default function CommandCenter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    setCurrentTime(greeting);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      } else {
        throw new Error(json.error?.message || "Failed to load stats");
      }
    } catch (err: any) {
      setError(err.message);
      // Fall back to demo data
      setStats({
        productCount: 18420,
        articleCount: 102,
        brandCount: 52,
        categoryCount: 24,
        commentCount: 1247,
        userCount: 284192,
        dealCount: 12,
        pendingReviewCount: 47,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const kpis = stats ? [
    { label: "Published Products", value: stats.productCount.toLocaleString(), change: "+312", icon: Package, sub: "Active" },
    { label: "Published Articles", value: stats.articleCount.toLocaleString(), change: "+14", icon: BookOpen, sub: "This month" },
    { label: "Active Brands", value: stats.brandCount.toLocaleString(), change: "+3", icon: TrendingUp, sub: "Partners" },
    { label: "Comments", value: stats.commentCount.toLocaleString(), change: `${stats.pendingReviewCount} pending`, icon: Eye, sub: "Need review" },
    { label: "Active Deals", value: stats.dealCount.toLocaleString(), change: "Live now", icon: Zap, sub: "Running" },
    { label: "Total Users", value: stats.userCount.toLocaleString(), change: "+3,841", icon: Users, sub: "This week" },
  ] : [];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[2px] text-[var(--admin-accent)] font-medium">COMMAND CENTER</div>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">
          {loading ? "Loading..." : `${currentTime}, GIRI.`}
        </h1>
        <p className="text-[var(--admin-text-secondary)] mt-1">
          {stats 
            ? `${stats.productCount.toLocaleString()} products • ${stats.articleCount} articles • ${stats.brandCount} brands`
            : "Loading dashboard..."}
        </p>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-3">Loading dashboard...</span>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div key={i} className="widget">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[var(--admin-text-secondary)]">{kpi.label}</div>
                    <div className="text-2xl font-semibold tabular-nums mt-1">{kpi.value}</div>
                  </div>
                  <div className="text-[var(--admin-accent)]"><kpi.icon size={20} /></div>
                </div>
                <div className={`text-xs mt-3 ${kpi.change.startsWith("+") ? "text-[#4ADE80]" : "text-[#FBBF24]"}`}>
                  {kpi.change} <span className="text-[var(--admin-text-muted)]">• {kpi.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue + Performance */}
            <div className="lg:col-span-5 widget">
              <div className="widget-title flex items-center gap-2"><BarChart3 size={14} /> REVENUE INTELLIGENCE</div>
              <div className="h-64 flex items-center justify-center text-[var(--admin-text-muted)] text-sm border border-[var(--admin-border)] rounded-xl">
                [Recharts Area Chart — Revenue by day + Commission breakdown]
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                <div>Top Network: <span className="font-medium text-[var(--admin-accent)]">Impact</span></div>
                <div>Top Brand: <span className="font-medium">Ferm Living</span></div>
                <div>Conversion: <span className="font-medium text-[#4ADE80]">18.4%</span></div>
              </div>
            </div>

            {/* Top Products */}
            <div className="lg:col-span-4 widget">
              <div className="widget-title flex justify-between">
                TOP PRODUCTS <span className="text-[var(--admin-text-muted)] cursor-pointer text-xs">See all →</span>
              </div>
              <div className="space-y-3 text-sm">
                {["Linen Duvet Cover — Oat", "Italian Cashmere Crewneck", "Mulberry Silk Sleep Mask", "Cast Iron Skillet 10\"", "Ceramic Vase — Matte Taupe"].map((p, i) => (
                  <div key={i} className="flex justify-between border-b border-[var(--admin-border)] pb-3 last:border-none last:pb-0">
                    <div>{p}</div>
                    <div className="text-[var(--admin-text-secondary)] tabular-nums">${(184 + i * 31).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="lg:col-span-3 widget">
              <div className="widget-title">SYSTEM HEALTH</div>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Products", status: "healthy", value: `${stats?.productCount.toLocaleString() || "—"} active` },
                  { label: "Content Reviews", status: stats && stats.pendingReviewCount > 0 ? "warning" : "healthy", value: `${stats?.pendingReviewCount || 0} pending` },
                  { label: "Active Deals", status: "healthy", value: `${stats?.dealCount || 0} running` },
                  { label: "Categories", status: "healthy", value: `${stats?.categoryCount || 0} total` },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>{s.label}</div>
                    <div className={`text-xs ${s.status === "healthy" ? "text-[#4ADE80]" : "text-[#FBBF24]"}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity */}
            <div className="lg:col-span-7 widget">
              <div className="widget-title">LIVE ACTIVITY</div>
              <div className="text-sm space-y-2.5">
                {[
                  "Elena Voss published “The Quiet Luxury of Linen”",
                  "System ran 184 affiliate link health checks — 2 degraded",
                  "SEO Strategist completed 312 meta descriptions",
                  "New user signed up: priya@studio.com (Canada)",
                  "Recommendation graph refreshed",
                ].map((a, i) => (
                  <div key={i} className="flex gap-3 text-[var(--admin-text-secondary)]">
                    <div className="text-[var(--admin-text-muted)] tabular-nums w-14 shrink-0">{10 - i}:4{i}</div>
                    <div>{a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof Analytics */}
            <div className="lg:col-span-12 widget">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-2"><Eye size={14} /> LIVE SOCIAL PROOF</div>
                <div className="ml-auto flex items-center gap-3 text-[10px] tracking-wider text-[var(--admin-text-muted)]">
                  <SocialProofControls />
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Active</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><Users size={13} /> TOP VIEWED TODAY</div>
                  <div className="text-2xl font-semibold tabular-nums">8,420</div>
                  <div className="text-xs text-[#4ADE80] mt-1">+12% vs yesterday</div>
                </div>
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><ShoppingCart size={13} /> RECENT PURCHASES (24H)</div>
                  <div className="text-2xl font-semibold tabular-nums">1,842</div>
                  <div className="text-xs text-[#4ADE80] mt-1">+8% conversion rate</div>
                </div>
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><Heart size={13} /> WISHLIST ACTIVITY</div>
                  <div className="text-2xl font-semibold tabular-nums">4,291</div>
                  <div className="text-xs text-[#4ADE80] mt-1">+22% saves this week</div>
                </div>
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><BarChart3 size={13} /> COMPARISON TOOL</div>
                  <div className="text-2xl font-semibold tabular-nums">1,204</div>
                  <div className="text-xs text-[#4ADE80] mt-1">+31% compare sessions</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-12 widget">
              <div className="widget-title">QUICK ACTIONS</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                {[
                  "Bulk import products",
                  "Run AI Content Architect",
                  "Validate all affiliate links",
                  "Generate sitemap",
                  "Refresh recommendation graph",
                  "Export revenue report"
                ].map((action, i) => (
                  <button key={i} onClick={() => alert(`Action: ${action} (demo)`)} className="btn-admin justify-center">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 text-xs text-[#F87171] flex items-center gap-2">
          <span>Using demo data — </span>
          <button onClick={fetchStats} className="underline hover:no-underline">Retry</button>
        </div>
      )}
    </div>
  );
}
