"use client";

import React, { useState } from "react";
import {
  Globe, Plus, TrendingUp, Users,
  DollarSign, BarChart3, Eye
} from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: "active" | "draft" | "ended";
  reach: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "1", name: "Summer Sanctuary Edit", type: "Email", status: "active", reach: 84200, conversions: 3841, revenue: 284920, startDate: "2026-06-01", endDate: "2026-06-30" },
  { id: "2", name: "Linen Collection Launch", type: "Social", status: "active", reach: 124000, conversions: 2190, revenue: 184200, startDate: "2026-05-15", endDate: "2026-06-15" },
  { id: "3", name: "Father's Day Gift Guide", type: "Email", status: "draft", reach: 0, conversions: 0, revenue: 0, startDate: "2026-06-10", endDate: "2026-06-18" },
  { id: "4", name: "Spring Refresh Campaign", type: "Multi-channel", status: "ended", reach: 284000, conversions: 8420, revenue: 524000, startDate: "2026-03-01", endDate: "2026-05-31" },
  { id: "5", name: "New Arrivals - Q3", type: "Email", status: "draft", reach: 0, conversions: 0, revenue: 0, startDate: "2026-07-01", endDate: "2026-07-31" },
];

export default function CampaignCenter() {
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
  const totalReach = campaigns.reduce((a, c) => a + c.reach, 0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Globe size={14} /> MARKETING
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Campaign Center</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Manage email, social, and multi-channel marketing campaigns.</p>
          </div>
          <button className="btn-admin-primary text-xs" onClick={() => toast.success("New campaign creation (demo)")}>
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <BarChart3 size={14} /> Active Campaigns
          </div>
          <div className="text-3xl font-semibold tabular-nums">{activeCampaigns.length}</div>
        </div>
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <Users size={14} /> Total Reach
          </div>
          <div className="text-3xl font-semibold tabular-nums">{(totalReach / 1000).toFixed(1)}k</div>
        </div>
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <DollarSign size={14} /> Total Revenue
          </div>
          <div className="text-3xl font-semibold tabular-nums text-[#4ADE80]">${(totalRevenue / 1000).toFixed(0)}k</div>
        </div>
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <TrendingUp size={14} /> Avg. Conversion
          </div>
          <div className="text-3xl font-semibold tabular-nums">{((campaigns.reduce((a, c) => a + c.conversions, 0) / totalReach) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-right">Reach</th>
              <th className="text-right">Conversions</th>
              <th className="text-right">Revenue</th>
              <th>Date Range</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                <td className="font-medium">{c.name}</td>
                <td><span className="badge-admin badge-admin-neutral text-[10px]">{c.type}</span></td>
                <td>
                  <span className={`badge-admin text-[10px] ${
                    c.status === "active" ? "badge-admin-success" :
                    c.status === "draft" ? "badge-admin-neutral" : "badge-admin-warning"
                  }`}>{c.status}</span>
                </td>
                <td className="text-right tabular-nums">{c.reach.toLocaleString()}</td>
                <td className="text-right tabular-nums">{c.conversions.toLocaleString()}</td>
                <td className="text-right tabular-nums font-medium text-[#4ADE80]">${c.revenue.toLocaleString()}</td>
                <td className="text-xs text-[var(--admin-text-muted)]">{c.startDate} — {c.endDate}</td>
                <td className="text-right">
                  <button className="btn-admin btn-admin-ghost text-xs"><Eye size={12} /> View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Campaign data is synced from email marketing (Resend), social platforms, and affiliate networks.
      </div>
    </div>
  );
}
