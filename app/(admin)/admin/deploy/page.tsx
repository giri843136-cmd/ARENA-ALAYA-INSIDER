"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket, RefreshCw, Loader2, CheckCircle, XCircle, Clock,
  GitBranch, AlertTriangle, History, Server
} from "lucide-react";
import { toast } from "sonner";

interface DeployStatus {
  configured: boolean;
  config: {
    repo: string | null;
    branch: string;
    workflow: string;
    hasDeployHook: boolean;
  };
  recentDeploys: {
    id: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    error: string | null;
  }[];
}

export default function DeployPage() {
  const [status, setStatus] = useState<DeployStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [branch, setBranch] = useState("main");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/admin/deploy");
        const json = await res.json();
        if (!cancelled && json.success) {
          setStatus(json.data);
          setBranch(json.data.config.branch || "main");
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/v1/admin/deploy");
      const json = await res.json();
      if (!json.success) return;
      setStatus(json.data);
    } catch { /* silent */ }
  };

  const triggerDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch("/api/v1/admin/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data.message);
        fetchStatus();
      } else {
        toast.error(json.data?.message || "Deploy failed");
      }
    } catch {
      toast.error("Failed to trigger deploy");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Rocket size={14} /> DEPLOYMENT
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">One-Click Deploy</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Trigger production deployments directly from the admin panel.
            </p>
          </div>
          <button onClick={fetchStatus} disabled={loading} className="btn-admin text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {loading && !status ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-3">Loading deploy configuration...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deploy Controls */}
          <div className="lg:col-span-7">
            <div className="widget-title mb-4">DEPLOY NOW</div>
            <div className="admin-card p-6 border border-[var(--admin-border)]">
              {/* Config status */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[var(--admin-bg-subtle)]">
                {status?.configured ? (
                  <>
                    <CheckCircle size={16} className="text-[#4ADE80]" />
                    <div className="text-xs">
                      <span className="font-medium">Deploy configured</span>
                      {status?.config.repo && (
                        <div className="text-[var(--admin-text-muted)] mt-0.5">
                          Repo: {status.config.repo} ({status.config.branch})
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-[#FBBF24]" />
                    <div className="text-xs">
                      <span className="font-medium">Deploy not configured</span>
                      <div className="text-[var(--admin-text-muted)] mt-0.5">
                        Set DEPLOY_HOOK_URL or GITHUB_REPO in environment variables
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Branch selector */}
              <div className="mb-4">
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Branch</label>
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="text-[var(--admin-text-muted)]" />
                  <input
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="input-admin flex-1 text-sm font-mono"
                    placeholder="main"
                  />
                </div>
              </div>

              {/* Deploy button */}
              <button
                onClick={triggerDeploy}
                disabled={deploying}
                className="btn-admin-primary w-full py-3 text-sm font-semibold"
              >
                {deploying ? (
                  <><Loader2 size={16} className="animate-spin" /> Deploying...</>
                ) : (
                  <><Rocket size={16} /> Deploy {branch}</>
                )}
              </button>

              {!status?.configured && (
                <div className="mt-4 p-3 rounded-lg bg-[#FBBF24]/5 border border-[#FBBF24]/20">
                  <div className="text-xs text-[var(--admin-text-secondary)]">
                    <span className="font-medium text-[#FBBF24]">Configuration required:</span>
                    <ul className="mt-1 space-y-1 text-[10px] text-[var(--admin-text-muted)]">
                      <li>• <code className="text-[#FBBF24]">DEPLOY_HOOK_URL</code> — Webhook URL (Vercel, Render, Railway)</li>
                      <li>• <code className="text-[#FBBF24]">GITHUB_REPO</code> — e.g. &quot;owner/repo-name&quot;</li>
                      <li>• <code className="text-[#FBBF24]">GITHUB_BRANCH</code> — Default branch (default: main)</li>
                      <li>• <code className="text-[#FBBF24]">GITHUB_DEPLOY_WORKFLOW</code> — Workflow file (default: deploy.yml)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Deploys */}
          <div className="lg:col-span-5">
            <div className="widget-title mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><History size={14} /> RECENT DEPLOYS</span>
            </div>
            <div className="space-y-2">
              {!status?.recentDeploys || status.recentDeploys.length === 0 ? (
                <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
                  <Rocket size={24} className="mx-auto mb-2 text-[var(--admin-text-muted)] opacity-50" />
                  <div className="text-xs text-[var(--admin-text-secondary)]">No deployments yet</div>
                </div>
              ) : (
                status.recentDeploys.map((d) => (
                  <div key={d.id} className="admin-card p-4 border border-[var(--admin-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {d.status === "success" ? (
                        <CheckCircle size={14} className="text-[#4ADE80]" />
                      ) : d.status === "failed" ? (
                        <XCircle size={14} className="text-[#F87171]" />
                      ) : (
                        <Loader2 size={14} className="animate-spin text-[#FBBF24]" />
                      )}
                      <div>
                        <div className="text-xs font-medium capitalize">{d.status}</div>
                        <div className="text-[10px] text-[var(--admin-text-muted)]">
                          {new Date(d.startedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {d.error && (
                      <span className="text-[9px] text-[#F87171] max-w-[150px] truncate" title={d.error}>
                        {d.error}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-center gap-4">
        <Server size={12} />
        <span>Deployments are logged to cron logs for audit trail.</span>
        <span className="mx-1">•</span>
        <Clock size={12} />
        <span>All deploys trigger security audit events.</span>
      </div>
    </div>
  );
}
