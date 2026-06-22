"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  WebhookIcon, Plus, RefreshCw, Loader2, Trash2, Play,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
  lastTriggeredAt: string | null;
}

const EVENT_OPTIONS = [
  "product.created", "product.updated", "product.deleted",
  "article.published", "article.updated",
  "comment.created", "comment.approved",
  "order.completed", "order.refunded",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/webhooks");
      const json = await res.json();
      if (json.success) setWebhooks(json.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { /* eslint-disable react-hooks/set-state-in-effect */ fetchWebhooks(); /* eslint-enable react-hooks/set-state-in-effect */ }, [fetchWebhooks]);

  const createWebhook = async () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0) {
      toast.error("Name, URL, and at least one event are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/v1/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhook),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Webhook created");
        setShowCreate(false);
        setNewWebhook({ name: "", url: "", events: [] });
        fetchWebhooks();
      } else {
        toast.error(json.error?.message || "Failed to create webhook");
      }
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  };

  const testWebhook = async (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      toast.success("Test event sent (simulated)");
      setTestingId(null);
    }, 1200);
  };

  const toggleEvent = (event: string) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <WebhookIcon size={14} /> INTEGRATIONS
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Webhooks</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Send real-time events to external services.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-admin-primary text-xs"><Plus size={14} /> New Endpoint</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading webhooks...</span>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
          <WebhookIcon size={32} className="mb-3 opacity-50" />
          <p className="text-sm">No webhook endpoints configured</p>
          <button onClick={() => setShowCreate(true)} className="text-xs text-[var(--admin-accent)] hover:underline mt-2">Add your first endpoint</button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <div key={wh.id} className="admin-card p-6 border border-[var(--admin-border)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-lg tracking-tight">{wh.name}</h3>
                    <span className={`badge-admin text-[10px] ${wh.isActive ? "badge-admin-success" : "badge-admin-warning"}`}>
                      {wh.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <code className="text-sm text-[var(--admin-text-secondary)] mt-1 block">{wh.url}</code>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => testWebhook(wh.id)} disabled={testingId === wh.id}
                    className="btn-admin text-xs">
                    {testingId === wh.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    Test
                  </button>
                  <button className="btn-admin text-xs text-[#F87171]"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wh.events.map((event) => (
                  <span key={event} className="badge-admin badge-admin-neutral text-[10px]">{event}</span>
                ))}
              </div>
              <div className="text-xs text-[var(--admin-text-muted)] mt-3">
                Created {new Date(wh.createdAt).toLocaleDateString()}
                {wh.lastTriggeredAt && ` • Last triggered ${new Date(wh.lastTriggeredAt).toLocaleDateString()}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={() => setShowCreate(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">New Webhook Endpoint</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Name *</label>
                <input value={newWebhook.name} onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="e.g. Slack Notifications" className="input-admin w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Endpoint URL *</label>
                <input value={newWebhook.url} onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..." className="input-admin w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Events *</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {EVENT_OPTIONS.map((event) => (
                    <button key={event} onClick={() => toggleEvent(event)}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                        newWebhook.events.includes(event)
                          ? "bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30"
                          : "bg-[var(--admin-bg-active)] text-[var(--admin-text-secondary)] border border-transparent hover:border-[var(--admin-border)]"
                      }`}>
                      {event}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
              <button onClick={createWebhook} disabled={creating} className="btn-admin-primary text-xs">
                {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Endpoint"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" /> Webhooks are signed with a secret. Verify signatures in your receiving service.
      </div>
    </div>
  );
}
