"use client";

import React, { useState } from "react";
import {
  Mail, Plus, X, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface EmailCampaign {
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

const defaultCampaigns: EmailCampaign[] = [
  { id: "1", name: "Weekly Digest — Sanctuary Edit", subject: "Your weekly dose of quiet luxury", status: "SENT", sentAt: "2026-06-12", scheduledAt: null, audienceSize: 84200, opens: 32410, clicks: 4892, revenue: 28420 },
  { id: "2", name: "New Arrivals: Linen Collection", subject: "Introducing our latest linen collection", status: "SCHEDULED", sentAt: null, scheduledAt: "2026-06-18", audienceSize: 91200, opens: 0, clicks: 0, revenue: 0 },
  { id: "3", name: "Summer Sale — Last Chance", subject: "20% off select items", status: "DRAFT", sentAt: null, scheduledAt: null, audienceSize: 78400, opens: 0, clicks: 0, revenue: 0 },
];

function CreateEmailModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (campaign: EmailCampaign) => void }) {
  const [form, setForm] = useState({ name: "", subject: "", audienceSize: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject) { toast.error("Name and subject are required"); return; }
    setSubmitting(true);
    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: form.name,
      subject: form.subject,
      status: "DRAFT",
      sentAt: null,
      scheduledAt: null,
      audienceSize: Number(form.audienceSize) || 0,
      opens: 0,
      clicks: 0,
      revenue: 0,
    };
    onCreated(campaign);
    toast.success(`Campaign "${form.name}" created as draft`);
    setForm({ name: "", subject: "", audienceSize: "" });
    setSubmitting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Email Campaign</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#252525] rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Campaign Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Subject Line *</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Audience Size</label>
            <input type="number" value={form.audienceSize} onChange={e => setForm({ ...form, audienceSize: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-admin-primary text-xs disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Mail size={14} className="mr-1" />}
              {submitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(defaultCampaigns);
  const [showCreate, setShowCreate] = useState(false);

  const totalSent = campaigns.filter((c) => c.status === "SENT").length;
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const avgOpenRate = campaigns.filter((c) => c.status === "SENT").length > 0
    ? campaigns.filter((c) => c.status === "SENT").reduce((s, c) => s + (c.audienceSize > 0 ? (c.opens / c.audienceSize) * 100 : 0), 0) / campaigns.filter((c) => c.status === "SENT").length
    : 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <CreateEmailModal open={showCreate} onClose={() => setShowCreate(false)}
        onCreated={(c) => setCampaigns([c, ...campaigns])} />

      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Mail size={14} /> EMAIL MARKETING
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Email Campaigns</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Create, schedule, and analyze email campaigns.</p>
          </div>
          <button className="btn-admin-primary text-xs" onClick={() => setShowCreate(true)}>
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
      {campaigns.length === 0 ? (
        <div className="admin-card border border-[var(--admin-border)] py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--admin-bg-active)] flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-[var(--admin-text-tertiary)]" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight mb-2">No email campaigns yet</h3>
          <p className="text-[var(--admin-text-secondary)] text-sm max-w-md mx-auto mb-8">
            Create your first email campaign to reach your audience.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-admin-primary flex items-center gap-2 text-sm px-6 py-3 mx-auto">
            <Plus size={16} /> Create First Campaign
          </button>
        </div>
      ) : (
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
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Email campaigns are sent via Resend. Subscriber management and templates available in the email settings.
      </div>
    </div>
  );
}
