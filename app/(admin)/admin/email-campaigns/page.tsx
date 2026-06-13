"use client";

import React, { useState } from "react";
import {
  Mail, Plus
} from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentAt: string | null;
  scheduledAt: string | null;
  audienceSize: number;
  opens: number;
  clicks: number;
  revenue: number;
}

export default function EmailCampaigns() {
  const [campaigns] = useState<Campaign[]>([
    { id: "1", name: "Weekly Digest — Sanctuary Edit", subject: "Your weekly dose of quiet luxury", status: "SENT", sentAt: "2026-06-12", scheduledAt: null, audienceSize: 84200, opens: 32410, clicks: 4892, revenue: 28420 },
    { id: "2", name: "New Arrivals: Linen Collection", subject: "Introducing our latest linen collection", status: "SCHEDULED", sentAt: null, scheduledAt: "2026-06-18", audienceSize: 91200, opens: 0, clicks: 0, revenue: 0 },
    { id: "3", name: "Summer Sale — Last Chance", subject: "20% off select items", status: "DRAFT", sentAt: null, scheduledAt: null, audienceSize: 78400, opens: 0, clicks: 0, revenue: 0 },
  ]);

  const totalSent = campaigns.filter((c) => c.status === "SENT").length;
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const avgOpenRate = campaigns.filter((c) => c.opens > 0).length > 0
    ? campaigns.filter((c) => c.status === "SENT").reduce((s, c) => s + (c.audienceSize > 0 ? (c.opens / c.audienceSize) * 100 : 0), 0) / campaigns.filter((c) => c.status === "SENT").length
    : 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Mail size={14} /> EMAIL MARKETING
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Email Campaigns</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Create, schedule, and analyze email campaigns.</p>
          </div>
          <button className="btn-admin-primary text-xs" onClick={() => toast.success("Campaign editor opened (demo)")}>
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Campaigns</div>
          <div className="text-3xl font-semibold tabular-nums mt-1">{campaigns.length}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Sent</div>
          <div className="text-3xl font-semibold tabular-nums mt-1">{totalSent}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Avg Open Rate</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#4ADE80]">{avgOpenRate.toFixed(1)}%</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Revenue</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#4ADE80]">${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
        <table className="admin-table w-full">
          <thead><tr><th>Campaign</th><th>Subject</th><th>Status</th><th className="text-right">Audience</th><th className="text-right">Opens</th><th className="text-right">Clicks</th><th className="text-right">Revenue</th><th>Date</th></tr></thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                <td className="font-medium">{c.name}</td>
                <td className="text-xs text-[var(--admin-text-secondary)] max-w-[200px] truncate">{c.subject}</td>
                <td>
                  <span className={`badge-admin text-[10px] ${
                    c.status === "SENT" ? "badge-admin-success" :
                    c.status === "SCHEDULED" ? "badge-admin-warning" : "badge-admin-neutral"
                  }`}>{c.status}</span>
                </td>
                <td className="text-right tabular-nums">{c.audienceSize.toLocaleString()}</td>
                <td className="text-right tabular-nums">{c.opens > 0 ? c.opens.toLocaleString() : "—"}</td>
                <td className="text-right tabular-nums">{c.clicks > 0 ? c.clicks.toLocaleString() : "—"}</td>
                <td className="text-right tabular-nums font-medium text-[#4ADE80]">{c.revenue > 0 ? `$${c.revenue.toLocaleString()}` : "—"}</td>
                <td className="text-xs text-[var(--admin-text-muted)]">{c.sentAt || c.scheduledAt || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Email campaigns are sent via Resend. Subscriber management and templates available in the email settings.
      </div>
    </div>
  );
}
