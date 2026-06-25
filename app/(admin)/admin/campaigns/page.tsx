"use client";

import React, { useState } from "react";
import {
  Globe, Plus, TrendingUp, Users,
  DollarSign, BarChart3, Megaphone
} from "lucide-react";

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

export default function CampaignCenter() {
  const [campaigns] = useState<Campaign[]>([]);

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
          <button className="btn-admin-primary text-xs" onClick={() => alert("New campaign creation form")}>
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
          <div className="text-3xl font-semibold tabular-nums">—</div>
        </div>
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <DollarSign size={14} /> Total Revenue
          </div>
          <div className="text-3xl font-semibold tabular-nums">$0</div>
        </div>
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <TrendingUp size={14} /> Avg. Conversion
          </div>
          <div className="text-3xl font-semibold tabular-nums">—</div>
        </div>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="admin-card border border-[var(--admin-border)] py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--admin-bg-active)] flex items-center justify-center mx-auto mb-6">
            <Megaphone size={28} className="text-[var(--admin-text-tertiary)]" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight mb-2">No campaigns yet</h3>
          <p className="text-[var(--admin-text-secondary)] text-sm max-w-md mx-auto mb-8">
            Create your first marketing campaign to track reach, conversions, and revenue across email, social, and multi-channel.
          </p>
          <button className="btn-admin-primary flex items-center gap-2 text-sm px-6 py-3 mx-auto">
            <Plus size={16} /> Create First Campaign
          </button>
        </div>
      )}

      {/* Campaigns Table */}
      {campaigns.length > 0 && (
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
                    <button className="btn-admin btn-admin-ghost text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Campaign data will appear once you create and launch campaigns.
      </div>
    </div>
  );
}
