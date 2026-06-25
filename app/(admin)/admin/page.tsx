"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart3, TrendingUp, Package, BookOpen, Zap, 
  ShoppingCart, Heart, Users, Eye,
  Loader2, Megaphone 
} from "lucide-react";
import { SocialProofControls } from "@/components/admin/ui/SocialProofControls";
import { RevenueForecastWidget } from "@/components/admin/widgets/RevenueForecastWidget";

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
      // No fallback — show empty state instead of demo data
      setStats({
        productCount: 0,
        articleCount: 0,
        brandCount: 0,
        categoryCount: 0,
        commentCount: 0,
        userCount: 0,
        dealCount: 0,
        pendingReviewCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const hasData = stats && (stats.productCount > 0 || stats.articleCount > 0 || stats.userCount > 0);

  const kpis = stats ? [
    { label: "Published Products", value: stats.productCount.toLocaleString(), change: stats.productCount > 0 ? null : "Add your first", icon: Package, sub: "Products" },
    { label: "Published Articles", value: stats.articleCount.toLocaleString(), change: stats.articleCount > 0 ? null : "Start writing", icon: BookOpen, sub: "Articles" },
    { label: "Active Brands", value: stats.brandCount.toLocaleString(), change: stats.brandCount > 0 ? null : "Add brands", icon: TrendingUp, sub: "Partners" },
    { label: "Comments", value: stats.commentCount.toLocaleString(), change: stats.pendingReviewCount > 0 ? `${stats.pendingReviewCount} pending` : null, icon: Eye, sub: "Reviews" },
    { label: "Active Deals", value: stats.dealCount.toLocaleString(), change: stats.dealCount > 0 ? null : "Create deals", icon: Zap, sub: "Running" },
    { label: "Total Users", value: stats.userCount.toLocaleString(), change: stats.userCount > 0 ? null : "Awaiting signups", icon: Users, sub: "Registered" },
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
                {kpi.change && (
                  <div className="text-xs mt-3 text-[var(--admin-text-muted)]">{kpi.change}</div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Forecast Widget */}
            <div className="lg:col-span-5">
              <RevenueForecastWidget />
            </div>

            {/* Top Products — Shows only when data is available */}
            {hasData && (
              <div className="lg:col-span-4 widget">
                <div className="widget-title flex justify-between">
                  TOP PRODUCTS <span className="text-[var(--admin-text-muted)] cursor-pointer text-xs">See all →</span>
                </div>
                <div className="text-sm text-[var(--admin-text-secondary)] py-4 text-center">
                  Product data will appear once products are added and tracked.
                </div>
              </div>
            )}

            {!hasData && (
              <div className="lg:col-span-4 widget">
                <div className="widget-title">TOP PRODUCTS</div>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package size={24} className="text-[var(--admin-text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--admin-text-secondary)]">No products yet</p>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">Import CSV or add your first product to see top sellers.</p>
                </div>
              </div>
            )}

            {/* System Health */}
            <div className="lg:col-span-3 widget">
              <div className="widget-title">SYSTEM HEALTH</div>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Products", status: stats && stats.productCount > 0 ? "healthy" : "empty", value: stats?.productCount && stats.productCount > 0 ? `${stats.productCount.toLocaleString()} active` : "No products yet" },
                  { label: "Content Reviews", status: stats && stats.pendingReviewCount > 0 ? "warning" : "healthy", value: stats?.pendingReviewCount && stats.pendingReviewCount > 0 ? `${stats.pendingReviewCount} pending` : "Up to date" },
                  { label: "Active Deals", status: stats && stats.dealCount > 0 ? "healthy" : "empty", value: stats?.dealCount && stats.dealCount > 0 ? `${stats.dealCount} running` : "No active deals" },
                  { label: "Categories", status: stats && stats.categoryCount > 0 ? "healthy" : "empty", value: stats?.categoryCount && stats.categoryCount > 0 ? `${stats.categoryCount} total` : "No categories" },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>{s.label}</div>
                    <div className={`text-xs ${s.status === "healthy" ? "text-[#4ADE80]" : s.status === "warning" ? "text-[#FBBF24]" : "text-[var(--admin-text-muted)]"}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity */}
            <div className="lg:col-span-7 widget">
              <div className="widget-title">LIVE ACTIVITY</div>
              {!hasData ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Megaphone size={24} className="text-[var(--admin-text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--admin-text-secondary)]">Activity feed will appear here</p>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">Events like publishing articles, user signups, and system operations will show here in real time.</p>
                </div>
              ) : (
                <div className="text-sm text-[var(--admin-text-secondary)] py-4 text-center">
                  Activity feed ready — events will appear as they happen.
                </div>
              )}
            </div>

            {/* Social Proof Analytics */}
            <div className="lg:col-span-12 widget">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-2"><Eye size={14} /> LIVE SOCIAL PROOF</div>
                <div className="ml-auto flex items-center gap-3 text-[10px] tracking-wider text-[var(--admin-text-muted)]">
                  <SocialProofControls />
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Ready</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><Users size={13} /> TOP VIEWED TODAY</div>
                  <div className="text-2xl font-semibold tabular-nums text-[var(--admin-text-muted)]">—</div>
                  <div className="text-xs text-[var(--admin-text-muted)] mt-1">Awaiting data</div>
                </div>
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><ShoppingCart size={13} /> RECENT PURCHASES (24H)</div>
                  <div className="text-2xl font-semibold tabular-nums text-[var(--admin-text-muted)]">—</div>
                  <div className="text-xs text-[var(--admin-text-muted)] mt-1">Awaiting data</div>
                </div>
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><Heart size={13} /> WISHLIST ACTIVITY</div>
                  <div className="text-2xl font-semibold tabular-nums text-[var(--admin-text-muted)]">—</div>
                  <div className="text-xs text-[var(--admin-text-muted)] mt-1">Awaiting data</div>
                </div>
                <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2"><BarChart3 size={13} /> COMPARISON TOOL</div>
                  <div className="text-2xl font-semibold tabular-nums text-[var(--admin-text-muted)]">—</div>
                  <div className="text-xs text-[var(--admin-text-muted)] mt-1">Awaiting data</div>
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
                  <button 
                    key={i} 
                    onClick={() => {
                      if (action === "Bulk import products") window.location.href = "/admin/feed-manager";
                      else if (action === "Export revenue report") alert("Revenue report export queued");
                      else alert(`Action: ${action}`);
                    }} 
                    className="btn-admin justify-center"
                  >
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
          <span>Could not load stats — </span>
          <button onClick={fetchStats} className="underline hover:no-underline">Retry</button>
        </div>
      )}
    </div>
  );
}
