"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign, TrendingUp, BarChart3,
  RefreshCw, Loader2, AlertTriangle, CheckCircle,
  Target
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from "recharts";

interface NetworkData {
  network: string;
  revenue: number;
  clicks: number;
  conversions: number;
  linkCount: number;
}

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  revenue: number;
  clicks: number;
  conversions: number;
}

interface CommissionData {
  summary: {
    totalRevenue: number;
    totalCommission: number;
    orderCount: number;
    avgOrderValue: number;
    commissionRate: number;
    forecast: number;
  };
  byNetwork: NetworkData[];
  topProducts: TopProduct[];
  linkHealth: {
    total: number;
    healthy: number;
    broken: number;
    healthRate: number;
  };
  opportunities: string[];
  monthlyRevenue: Array<{ month: string; revenue: number; commission: number; network: string }>;
}

const NETWORK_COLORS: Record<string, string> = {
  IMPACT: "#8B5CF6", CJ: "#3B82F6", AMAZON: "#F59E0B",
  SHAREASALE: "#22C55E", BRAND_DIRECT: "#EC4899", OTHER: "#6B7280",
};

export default function CommissionDashboard() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/commission?days=${days}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-3">Loading commission data...</span>
        </div>
      </div>
    );
  }

  const d = data!;

  // Build monthly trend data for recharts
  const months = [...new Set(d.monthlyRevenue.map((m) => m.month))].sort().slice(-12);
  const trendData = months.map((month) => {
    const monthEntries = d.monthlyRevenue.filter((m) => m.month === month);
    const revenue = monthEntries.reduce((s, m) => s + m.revenue, 0);
    const commission = monthEntries.reduce((s, m) => s + m.commission, 0);
    return { month: month.slice(5), revenue: Math.round(revenue), commission: Math.round(commission) };
  });

  // Network breakdown for bar chart
  const networkChartData = d.byNetwork.map((n) => ({
    name: n.network,
    revenue: Math.round(n.revenue),
    clicks: n.clicks,
  }));

  const maxRev = Math.max(...trendData.map((d) => d.revenue), 1);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <DollarSign size={14} /> COMMISSION INTELLIGENCE
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Commission &amp; Earnings</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Real-time revenue, commission, and affiliate performance data.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-3 py-1.5 text-xs text-[var(--admin-text)]">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
            </select>
            <button onClick={fetchData} disabled={loading} className="btn-admin text-xs">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8">
        <div className="widget">
          <div className="text-xs text-[var(--admin-text-secondary)]">Total Revenue</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-[#4ADE80]">${d.summary.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-[var(--admin-text-muted)] mt-1">All networks</div>
        </div>
        <div className="widget">
          <div className="text-xs text-[var(--admin-text-secondary)]">Commission Earned</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">${d.summary.totalCommission.toLocaleString()}</div>
          <div className="text-xs text-[#4ADE80] mt-1">{d.summary.commissionRate > 0 ? `${(d.summary.commissionRate * 100).toFixed(1)}% rate` : "—"}</div>
        </div>
        <div className="widget">
          <div className="text-xs text-[var(--admin-text-secondary)]">Orders</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{d.summary.orderCount.toLocaleString()}</div>
        </div>
        <div className="widget">
          <div className="text-xs text-[var(--admin-text-secondary)]">Avg Order Value</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">${d.summary.avgOrderValue.toFixed(2)}</div>
        </div>
        <div className="widget">
          <div className="text-xs text-[var(--admin-text-secondary)]">Link Health</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{d.linkHealth.healthRate.toFixed(1)}%</div>
          <div className="text-xs flex items-center gap-1 mt-1">
            <span className="text-[#4ADE80]">{d.linkHealth.healthy} healthy</span>
            {d.linkHealth.broken > 0 && <span className="text-[#F87171]">• {d.linkHealth.broken} broken</span>}
          </div>
        </div>
        <div className="widget">
          <div className="text-xs text-[var(--admin-text-secondary)]">Forecast (30d)</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-[#FBBF24]">${d.summary.forecast.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-8 widget">
          <div className="widget-title flex items-center gap-2"><BarChart3 size={14} /> MONTHLY REVENUE TREND</div>
          <div className="h-72 mt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A26F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C5A26F" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 11 }} axisLine={{ stroke: "#252525" }} />
                  <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={{ stroke: "#252525" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#161616", border: "1px solid #252525", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#EDEDED" }}
                    formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, ""]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C5A26F" fill="url(#revenueGradient)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="commission" stroke="#4ADE80" fill="url(#commissionGradient)" strokeWidth={2} name="Commission" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--admin-text-muted)]">
                No revenue data yet. Data appears after affiliate conversions are tracked.
              </div>
            )}
          </div>
        </div>

        {/* Network Breakdown Chart */}
        <div className="lg:col-span-4 widget">
          <div className="widget-title flex items-center gap-2"><BarChart3 size={14} /> NETWORK BREAKDOWN</div>
          <div className="h-72 mt-4">
            {networkChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={networkChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#EDEDED", fontSize: 12 }} width={80} />
                  <Tooltip
                    contentStyle={{ background: "#161616", border: "1px solid #252525", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {networkChartData.map((entry, idx) => (
                      <Cell key={idx} fill={NETWORK_COLORS[entry.name] || "#6B7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--admin-text-muted)]">No network data yet</div>
            )}
          </div>
        </div>

        {/* Top Earning Products Table */}
        <div className="lg:col-span-7 widget">
          <div className="widget-title flex items-center justify-between">
            <span className="flex items-center gap-2"><Target size={14} /> TOP EARNING PRODUCTS</span>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr>
                  <th>Product</th><th>Brand</th>
                  <th className="text-right">Revenue</th><th className="text-right">Clicks</th><th className="text-right">Conv.</th><th></th>
                </tr>
              </thead>
              <tbody>
                {d.topProducts.map((p) => (
                  <tr key={p.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                    <td className="font-medium">{p.name}</td>
                    <td className="text-[var(--admin-text-secondary)]">{p.brand}</td>
                    <td className="text-right tabular-nums font-medium text-[#4ADE80]">${p.revenue.toLocaleString()}</td>
                    <td className="text-right tabular-nums">{p.clicks.toLocaleString()}</td>
                    <td className="text-right tabular-nums">{p.conversions.toLocaleString()}</td>
                    <td className="text-right"><a href={`/admin/products/${p.slug}`} className="text-xs text-[var(--admin-accent)] hover:underline">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Opportunities */}
        <div className="lg:col-span-5 space-y-6">
          <div className="widget">
            <div className="widget-title flex items-center gap-2"><TrendingUp size={14} /> OPPORTUNITIES</div>
            <div className="space-y-3 mt-3">
              {d.opportunities.map((op, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--admin-bg-active)] border border-[var(--admin-border)]">
                  <TrendingUp size={14} className="text-[#4ADE80] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[var(--admin-text-secondary)]">{op}</span>
                </div>
              ))}
              {d.opportunities.length === 0 && <div className="text-sm text-[var(--admin-text-muted)]">No opportunities identified yet.</div>}
            </div>
          </div>

          <div className="widget">
            <div className="widget-title">LINK HEALTH</div>
            <div className="flex items-center justify-between mb-3 mt-3">
              <span className="text-xs text-[var(--admin-text-muted)]">{d.linkHealth.total} total links</span>
              <span className="text-xs flex items-center gap-1">
                <CheckCircle size={12} className="text-[#4ADE80]" /> {d.linkHealth.healthy}
                <AlertTriangle size={12} className="text-[#F87171] ml-2" /> {d.linkHealth.broken}
              </span>
            </div>
            <div className="w-full bg-[var(--admin-bg-active)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[#4ADE80]" style={{ width: `${d.linkHealth.healthRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Commission data aggregated from affiliate network webhooks (Impact, CJ) and AnalyticsEvent records.
      </div>
    </div>
  );
}
