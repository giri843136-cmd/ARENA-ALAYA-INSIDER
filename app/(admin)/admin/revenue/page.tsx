"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw, Loader2, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS: Record<string, string> = { IMPACT: "#8B5CF6", CJ: "#3B82F6", AMAZON: "#F59E0B", SHAREASALE: "#22C55E", BRAND_DIRECT: "#EC4899", OTHER: "#6B7280" };

export default function RevenueIntelligence() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/commission?days=30");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) return <div className="p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[400px]"><Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" /></div>;

  const trendMonths = [...new Set<string>((data?.monthlyRevenue || []).map((m: any) => m.month))].sort().slice(-12);
  const trendData = trendMonths.map((month) => {
    const entries = (data?.monthlyRevenue || []).filter((m: any) => m.month === month);
    return { month: month.slice(5), revenue: Math.round(entries.reduce((s: number, m: any) => s + m.revenue, 0)), commission: Math.round(entries.reduce((s: number, m: any) => s + m.commission, 0)) };
  });
  const pieData = (data?.byNetwork || []).map((n: any) => ({ name: n.network, value: Math.round(n.revenue), color: COLORS[n.network] || "#6B7280" }));

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">REVENUE INTELLIGENCE</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Revenue &amp; Commission</h1>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Real-time revenue, commissions, and network performance.</p>
        </div>
        <button onClick={fetchData} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-6 border border-[var(--admin-border)]"><div className="text-xs text-[var(--admin-text-secondary)]">Total Revenue (30d)</div><div className="text-3xl font-semibold tabular-nums mt-1 text-[#4ADE80]">${(data?.summary?.totalRevenue || 0).toLocaleString()}</div></div>
        <div className="admin-card p-6 border border-[var(--admin-border)]"><div className="text-xs text-[var(--admin-text-secondary)]">Commission</div><div className="text-3xl font-semibold tabular-nums mt-1">${(data?.summary?.totalCommission || 0).toLocaleString()}</div></div>
        <div className="admin-card p-6 border border-[var(--admin-border)]"><div className="text-xs text-[var(--admin-text-secondary)]">Orders</div><div className="text-3xl font-semibold tabular-nums mt-1">{(data?.summary?.orderCount || 0).toLocaleString()}</div></div>
        <div className="admin-card p-6 border border-[var(--admin-border)]"><div className="text-xs text-[var(--admin-text-secondary)]">Commission Rate</div><div className="text-3xl font-semibold tabular-nums mt-1">{((data?.summary?.commissionRate || 0) * 100).toFixed(1)}%</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 admin-card p-8 border border-[var(--admin-border)]">
          <div className="widget-title flex items-center justify-between mb-4"><span className="flex items-center gap-2"><BarChart3 size={14} /> REVENUE OVER TIME</span><span className="text-[var(--admin-text-muted)] text-xs">Last {trendMonths.length} months</span></div>
          <div className="h-80">{trendData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C5A26F" stopOpacity={0.3} /><stop offset="95%" stopColor="#C5A26F" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#252525" /><XAxis dataKey="month" tick={{ fill: "#666", fontSize: 12 }} axisLine={{ stroke: "#252525" }} /><YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={{ stroke: "#252525" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={{ background: "#161616", border: "1px solid #252525", borderRadius: 8 }} formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, ""]} /><Area type="monotone" dataKey="revenue" stroke="#C5A26F" fill="url(#rg)" strokeWidth={2} /><Area type="monotone" dataKey="commission" stroke="#4ADE80" fill="transparent" strokeWidth={2} strokeDasharray="5 5" /></AreaChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-[var(--admin-text-muted)]">No data yet</div>}</div>
        </div>
        <div className="lg:col-span-4 admin-card p-8 border border-[var(--admin-border)]">
          <div className="widget-title mb-4">NETWORK BREAKDOWN</div>
          <div className="h-64">{pieData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">{pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ background: "#161616", border: "1px solid #252525", borderRadius: 8 }} formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, "Revenue"]} /></PieChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-[var(--admin-text-muted)]">No data</div>}</div>
          <div className="flex flex-wrap gap-3 mt-4 text-xs">{pieData.map((n: any) => (<span key={n.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />{n.name}</span>))}</div>
        </div>
        <div className="lg:col-span-7 admin-card border border-[var(--admin-border)] overflow-x-auto">
          <div className="flex justify-between items-baseline px-8 pt-8 pb-4"><div className="widget-title">TOP EARNING PRODUCTS</div><button className="text-xs text-[var(--admin-accent)]"><Download size={12} /> Export</button></div>
          <table className="admin-table w-full text-sm">
            <thead><tr><th>Product</th><th className="text-right">Revenue</th><th className="text-right">Commission</th><th className="text-right">EPC</th></tr></thead>
            <tbody>{(data?.topProducts || []).map((p: any, i: number) => (<tr key={i} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]"><td className="font-medium">{p.name}</td><td className="text-right tabular-nums">${p.revenue.toLocaleString()}</td><td className="text-right text-[#4ADE80] tabular-nums">${p.commission.toLocaleString()}</td><td className="text-right font-mono text-xs">{p.revenue > 0 ? ((p.commission / p.revenue) * 100).toFixed(1) : "0"}%</td></tr>))}{(data?.topProducts || []).length === 0 && <tr><td colSpan={4} className="text-center text-[var(--admin-text-muted)] py-8">No data available</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
