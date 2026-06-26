"use client";

import React, { useState } from "react";
import {
  Globe, Plus, TrendingUp, Users,
  DollarSign, BarChart3, Megaphone, X, Loader2
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

const campaignTypes = ["Email", "Social", "Multi-channel", "Influencer", "Paid Ads", "Content"];

function CreateCampaignModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (campaign: Campaign) => void }) {
  const [form, setForm] = useState({ name: "", type: "Email", startDate: "", endDate: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate) { toast.error("Name and start date are required"); return; }
    setSubmitting(true);
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      status: "draft",
      reach: 0,
      conversions: 0,
      revenue: 0,
      startDate: form.startDate,
      endDate: form.endDate,
    };
    onCreated(campaign);
    toast.success(`Campaign "${form.name}" created as draft`);
    setForm({ name: "", type: "Email", startDate: "", endDate: "" });
    setSubmitting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Campaign</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#252525] rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Campaign Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required
              placeholder="Summer Sale 2026" />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm">
              {campaignTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-admin-primary text-xs disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Plus size={14} className="mr-1" />}
              {submitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function CampaignCenter() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
  const totalReach = campaigns.reduce((a, c) => a + c.reach, 0);

  const launchCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: "active" as const } : c));
    toast.success("Campaign launched!");
  };

  const endCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: "ended" as const } : c));
    toast.success("Campaign ended");
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <CreateCampaignModal open={showCreate} onClose={() => setShowCreate(false)}
        onCreated={(campaign) => setCampaigns([campaign, ...campaigns])} />

      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Globe size={14} /> MARKETING
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Campaign Center</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Manage email, social, and multi-channel marketing campaigns.</p>
          </div>
          <button className="btn-admin-primary text-xs" onClick={() => setShowCreate(true)}>
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
          <div className="text-3xl font-semibold tabular-nums">{totalReach > 0 ? totalReach.toLocaleString() : "—"}</div>
        </div>
        <div className="admin-card p-6 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mb-2">
            <DollarSign size={14} /> Total Revenue
          </div>
          <div className="text-3xl font-semibold tabular-nums">{totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "—"}</div>
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
          <button onClick={() => setShowCreate(true)} className="btn-admin-primary flex items-center gap-2 text-sm px-6 py-3 mx-auto">
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
                  <td className="text-right tabular-nums">{c.reach > 0 ? c.reach.toLocaleString() : "—"}</td>
                  <td className="text-right tabular-nums">{c.conversions > 0 ? c.conversions.toLocaleString() : "—"}</td>
                  <td className="text-right tabular-nums font-medium text-[#4ADE80]">{c.revenue > 0 ? `$${c.revenue.toLocaleString()}` : "—"}</td>
                  <td className="text-xs text-[var(--admin-text-muted)]">{c.startDate}{c.endDate ? ` — ${c.endDate}` : ""}</td>
                  <td className="text-right">
                    {c.status === "draft" && (
                      <button onClick={() => launchCampaign(c.id)} className="btn-admin btn-admin-ghost text-xs text-[#4ADE80]">Launch</button>
                    )}
                    {c.status === "active" && (
                      <button onClick={() => endCampaign(c.id)} className="btn-admin btn-admin-ghost text-xs text-[#F87171]">End</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Campaign data updates in real-time. Launch campaigns to start tracking performance.
      </div>
    </div>
  );
}
