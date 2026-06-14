"use client";

import React, { useState, useEffect } from "react";
import {
  Flag, Plus, RefreshCw, Loader2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  percentage: number;
  rules: any;
  createdAt: string;
  updatedAt: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: "", description: "", enabled: false, percentage: 100 });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/admin/feature-flags");
        const json = await res.json();
        if (json.success && !cancelled) setFlags(json.data);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const toggleFlag = async (flag: FeatureFlag) => {
    setSavingId(flag.id);
    try {
      const res = await fetch("/api/v1/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flag.key, enabled: !flag.enabled, description: flag.description, percentage: flag.percentage, rules: flag.rules }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Flag "${flag.key}" ${!flag.enabled ? "enabled" : "disabled"}`);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(json.error?.message || "Failed to toggle flag");
      }
    } catch { toast.error("Network error"); }
    finally { setSavingId(null); }
  };

  const updatePercentage = async (flag: FeatureFlag, percentage: number) => {
    setSavingId(flag.id);
    try {
      const res = await fetch("/api/v1/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flag.key, percentage, enabled: flag.enabled, description: flag.description, rules: flag.rules }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Rollout set to ${percentage}%`);
        setRefreshKey((k) => k + 1);
      }
    } catch { toast.error("Failed to update"); }
    finally { setSavingId(null); }
  };

  const createFlag = async () => {
    if (!newFlag.key.trim()) { toast.error("Flag key is required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/v1/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newFlag, key: newFlag.key.trim().toUpperCase().replace(/\s+/g, "_") }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Feature flag created");
        setShowCreate(false);
        setNewFlag({ key: "", description: "", enabled: false, percentage: 100 });
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(json.error?.message || "Failed to create flag");
      }
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Flag size={14} /> RELEASE CONTROL
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Feature Flags</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Toggle features on/off and control percentage rollouts.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-admin-primary text-xs"><Plus size={14} /> New Flag</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading flags...</span>
        </div>
      ) : flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
          <Flag size={32} className="mb-3 opacity-50" />
          <p className="text-sm">No feature flags configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <div key={flag.id} className="admin-card p-6 border border-[var(--admin-border)] flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <code className="font-mono text-sm font-medium">{flag.key}</code>
                  {flag.enabled ? (
                    <span className="badge-admin badge-admin-success text-[10px]">ON</span>
                  ) : (
                    <span className="badge-admin badge-admin-neutral text-[10px]">OFF</span>
                  )}
                  {flag.percentage < 100 && flag.enabled && (
                    <span className="text-xs text-[#FBBF24]">{flag.percentage}% rollout</span>
                  )}
                </div>
                {flag.description && (
                  <p className="text-sm text-[var(--admin-text-secondary)] mt-1">{flag.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {flag.enabled && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--admin-text-muted)]">Rollout:</span>
                    <select value={flag.percentage} onChange={(e) => updatePercentage(flag, parseInt(e.target.value))}
                      disabled={savingId === flag.id}
                      className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1 text-xs text-[var(--admin-text)]">
                      {[1, 5, 10, 25, 50, 75, 100].map((p) => (
                        <option key={p} value={p}>{p}%</option>
                      ))}
                    </select>
                  </div>
                )}
                <button onClick={() => toggleFlag(flag)} disabled={savingId === flag.id}
                  className={`flex-shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
                    flag.enabled ? "bg-[#4ADE80]" : "bg-[#333]"
                  }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    flag.enabled ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={() => setShowCreate(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">New Feature Flag</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Flag Key *</label>
                <input value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                  placeholder="e.g. NEW_CHECKOUT_FLOW" className="input-admin w-full font-mono text-sm uppercase" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Description</label>
                <input value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  placeholder="What does this flag control?" className="input-admin w-full" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newFlag.enabled} onChange={(e) => setNewFlag({ ...newFlag, enabled: e.target.checked })}
                    className="accent-[#C5AA8A]" />
                  Enable by default
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--admin-text-muted)]">Rollout:</span>
                  <select value={newFlag.percentage} onChange={(e) => setNewFlag({ ...newFlag, percentage: parseInt(e.target.value) })}
                    className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] rounded px-2 py-1 text-xs">
                    {[1, 5, 10, 25, 50, 75, 100].map((p) => (
                      <option key={p} value={p}>{p}%</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
              <button onClick={createFlag} disabled={creating} className="btn-admin-primary text-xs">
                {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Flag"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" /> Feature flags are cached at the edge. Changes may take up to 60s to propagate.
      </div>
    </div>
  );
}
