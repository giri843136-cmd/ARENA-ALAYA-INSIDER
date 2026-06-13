"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Key, Plus, X, Copy, RefreshCw, Loader2,
  AlertTriangle, Check, Clock
} from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  rawKey?: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState("products:read,products:write");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/api-keys");
      const json = await res.json();
      if (json.success) setKeys(json.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    if (!newName.trim()) { toast.error("Key name is required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/v1/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          scopes: newScopes.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewKeyValue(json.data.rawKey);
        toast.success("API key created — copy it now, it won't be shown again");
        setNewName("");
        fetchKeys();
      } else {
        toast.error(json.error?.message || "Failed to create key");
      }
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Key size={14} /> SECURITY
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">API Keys</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Manage API keys for external integrations.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchKeys} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
            <button onClick={() => { setShowCreate(true); setNewKeyValue(null); }} className="btn-admin-primary text-xs"><Plus size={14} /> New Key</button>
          </div>
        </div>
      </div>

      {/* New Key Reveal */}
      {newKeyValue && (
        <div className="mb-6 p-4 rounded-lg border border-[#FBBF24]/30 bg-[#FBBF24]/5">
          <div className="flex items-center gap-2 text-[#FBBF24] text-xs font-medium mb-2">
            <AlertTriangle size={14} /> This is your only chance to copy this key
          </div>
          <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-3 border border-[var(--admin-border)]">
            <code className="flex-1 text-sm font-mono text-[#4ADE80] break-all">{newKeyValue}</code>
            <button onClick={() => copyToClipboard(newKeyValue, "new-key")}
              className="btn-admin text-xs flex-shrink-0">
              {copiedId === "new-key" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
            <button onClick={() => setNewKeyValue(null)} className="p-1 hover:bg-[var(--admin-bg-hover)] rounded">
              <X size={16} className="text-[var(--admin-text-muted)]" />
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
            <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
            <Key size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No API keys created yet</p>
          </div>
        ) : (
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Scopes</th>
                <th>Created</th>
                <th>Last Used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                  <td className="font-medium">{key.name}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {key.scopes.map((scope) => (
                        <span key={scope} className="badge-admin badge-admin-neutral text-[10px]">{scope}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-xs text-[var(--admin-text-muted)]">{formatDate(key.createdAt)}</td>
                  <td className="text-xs text-[var(--admin-text-muted)]">
                    {key.lastUsedAt ? (
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(key.lastUsedAt)}</span>
                    ) : "Never"}
                  </td>
                  <td className="text-right">
                    <button className="btn-admin btn-admin-ghost text-xs text-[#F87171]">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={() => setShowCreate(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Create API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Key Name *</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Production SDK" className="input-admin w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Scopes (comma-separated)</label>
                <input value={newScopes} onChange={(e) => setNewScopes(e.target.value)}
                  placeholder="products:read,products:write" className="input-admin w-full" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
              <button onClick={createKey} disabled={creating} className="btn-admin-primary text-xs">
                {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Generate Key"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" /> API keys are hashed (SHA-256) before storage. We never store plaintext keys.
      </div>
    </div>
  );
}
