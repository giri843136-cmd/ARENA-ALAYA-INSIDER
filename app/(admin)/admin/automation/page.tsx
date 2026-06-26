"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Loader2, Play, Pause } from "lucide-react";

interface AutomationRule {
  name: string; type: string; schedule: string; status: string; lastRun: string;
}

function CreateAutomationModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (rule: AutomationRule) => void }) {
  const [form, setForm] = useState({ name: "", type: "Link validation", schedule: "", status: "active" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.schedule) { toast.error("Name and schedule are required"); return; }
    setSubmitting(true);
    // Add to local state immediately
    onCreated({ ...form, lastRun: "Never" });
    toast.success(`Automation "${form.name}" created`);
    setForm({ name: "", type: "Link validation", schedule: "", status: "active" });
    setSubmitting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Automation Rule</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#252525] rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Rule Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm"
              placeholder="Daily link health check" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm">
              <option>Link validation</option>
              <option>Price alerts</option>
              <option>AI workflow</option>
              <option>Graph</option>
              <option>Content refresh</option>
              <option>SEO audit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Schedule *</label>
            <input value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm"
              placeholder="Every day at 03:00" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-admin-primary text-xs disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Plus size={14} className="mr-1" />}
              Create Rule
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const defaultRules: AutomationRule[] = [
  { name: "Daily Affiliate Link Health Check", type: "Link validation", schedule: "Every day at 03:00", status: "active", lastRun: "Today 03:12" },
  { name: "Weekly Price Monitoring", type: "Price alerts", schedule: "Mondays 09:00", status: "active", lastRun: "Yesterday 09:01" },
  { name: "Auto-generate SEO for new products", type: "AI workflow", schedule: "On publish", status: "active", lastRun: "Today 07:34" },
  { name: "Monthly Recommendation Graph Refresh", type: "Graph", schedule: "1st of month", status: "paused", lastRun: "Jun 1 03:00" },
];

export default function AutomationCenter() {
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [showCreate, setShowCreate] = useState(false);

  const toggleStatus = (index: number) => {
    setRules(rules.map((r, i) => i === index ? { ...r, status: r.status === "active" ? "paused" : "active" } : r));
    toast.success(`Rule ${rules[index].status === "active" ? "paused" : "activated"}`);
  };

  return (
    <div className="p-8 max-w-[1200px]">
      <CreateAutomationModal open={showCreate} onClose={() => setShowCreate(false)}
        onCreated={(rule) => setRules([rule, ...rules])} />

      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">AUTOMATION CENTER</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Workflows &amp; Scheduled Jobs</h1>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">{rules.length} rules configured</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-admin-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Create New Automation
        </button>
      </div>

      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        <table className="admin-table w-full text-sm min-w-[820px]">
          <thead>
            <tr className="bg-[var(--admin-bg-elevated)]">
              <th>Rule</th><th>Type</th><th>Schedule</th><th>Status</th><th>Last Run</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-[var(--admin-text-muted)] text-sm">No automation rules yet. Create one to get started.</td></tr>
            ) : rules.map((r, i) => (
              <tr key={i} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                <td className="font-medium">{r.name}</td>
                <td className="text-[var(--admin-text-secondary)]">{r.type}</td>
                <td className="text-[var(--admin-text-secondary)]">{r.schedule}</td>
                <td>
                  <button onClick={() => toggleStatus(i)}
                    className={`badge-admin cursor-pointer ${r.status === "active" ? "badge-admin-success" : "badge-admin-warning"}`}>
                    {r.status === "active" ? <Play size={10} className="inline mr-1" /> : <Pause size={10} className="inline mr-1" />}
                    {r.status}
                  </button>
                </td>
                <td className="text-xs text-[var(--admin-text-muted)]">{r.lastRun}</td>
                <td className="text-right">
                  <button onClick={() => { toast.success(`Editing: ${r.name}`); }} className="text-xs text-[var(--admin-accent)] hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[var(--admin-text-muted)]">Automations run via background job queue (BullMQ).</div>
    </div>
  );
}
