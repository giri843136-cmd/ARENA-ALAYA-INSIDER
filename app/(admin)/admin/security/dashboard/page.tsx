"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Key,
  Smartphone,
  RefreshCw,
  Loader2,
  LogIn,
  AlertOctagon,
  FileText,  Ban, Eye, Clock, Server, Lock, Globe, BarChart3,
} from "lucide-react";

interface DashboardData {
  posture: { score: number; label: string; updatedAt: string };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    warningEvents: number;
    failedLogins: number;
    successfulLogins: number;
    loginSuccessRate: number;
    cspViolations: number;
    activeApiKeys: number;
    twoFAEnabled: number;
    totalUsers: number;
    totalAuditEntries: number;
  };
  recentEvents: { id: string; action: string; details?: string; severity: string; createdAt: string; userId?: string }[];
  loginStats: { failed: number; successful: number; total: number; successRate: number };
  eventBreakdown: { severity: string; count: number }[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#F87171",
  warning: "#FBBF24",
  info: "#4ADE80",
};

const SEVERITY_BG: Record<string, string> = {
  critical: "bg-[#F87171]/10 border-[#F87171]/20 text-[#F87171]",
  warning: "bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]",
  info: "bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#4ADE80]",
};

function PostureGauge({ score }: { score: number }) {
  const color = score >= 90 ? "#4ADE80" : score >= 70 ? "#FBBF24" : "#F87171";
  const label = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Poor";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--admin-border)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 314} 314`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-semibold tabular-nums" style={{ color }}>{score}</div>
            <div className="text-[9px] text-[var(--admin-text-muted)] tracking-wider">POSTURE</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] tracking-wider mt-2 px-3 py-1 rounded-full border" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>
        {label}
      </div>
    </div>
  );
}

export default function SecurityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/security/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { /* graceful fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[var(--admin-accent)] mx-auto mb-3" />
          <div className="text-sm text-[var(--admin-text-secondary)]">Loading security dashboard...</div>
        </div>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[2px] text-[var(--admin-accent)] font-medium">
            <Shield size={14} /> SECURITY DASHBOARD
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Security Posture &amp; Monitoring</h1>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Real-time security overview, threat detection, and system health.
          </p>
        </div>
        <button onClick={fetchData} disabled={loading} className="btn-admin text-xs">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Posture + Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Posture Score */}
        <div className="lg:col-span-3 widget flex items-center justify-center py-6">
          <PostureGauge score={d.posture.score} />
        </div>

        {/* Summary Stats */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="widget py-5 px-4">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2">
              <AlertTriangle size={12} /> CRITICAL EVENTS (7D)
            </div>
            <div className={`text-2xl font-semibold tabular-nums ${d.summary.criticalEvents > 0 ? "text-[#F87171]" : "text-[#4ADE80]"}`}>
              {d.summary.criticalEvents}
            </div>
            <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">
              {d.summary.criticalEvents > 0 ? "Requires immediate attention" : "No critical events"}
            </div>
          </div>
          <div className="widget py-5 px-4">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2">
              <AlertOctagon size={12} /> WARNING EVENTS (7D)
            </div>
            <div className={`text-2xl font-semibold tabular-nums ${d.summary.warningEvents > 0 ? "text-[#FBBF24]" : "text-[#4ADE80]"}`}>
              {d.summary.warningEvents}
            </div>
            <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">
              {d.summary.warningEvents > 0 ? "Review recommended" : "All clear"}
            </div>
          </div>
          <div className="widget py-5 px-4">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2">
              <LogIn size={12} /> LOGIN SUCCESS RATE
            </div>
            <div className="text-2xl font-semibold tabular-nums text-[#4ADE80]">
              {d.summary.loginSuccessRate}%
            </div>
            <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">
              {d.summary.successfulLogins} success / {d.summary.failedLogins} failed (24h)
            </div>
          </div>
          <div className="widget py-5 px-4">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2">
              <Globe size={12} /> CSP VIOLATIONS (24H)
            </div>
            <div className={`text-2xl font-semibold tabular-nums ${d.summary.cspViolations > 10 ? "text-[#FBBF24]" : "text-[#4ADE80]"}`}>
              {d.summary.cspViolations}
            </div>
            <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">
              {d.summary.cspViolations > 0 ? "Possible injection attempts" : "No violations"}
            </div>
          </div>
          <div className="widget py-5 px-4">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2">
              <Smartphone size={12} /> 2FA ADOPTION
            </div>
            <div className="text-2xl font-semibold tabular-nums text-[var(--admin-accent)]">
              {d.summary.twoFAEnabled}
            </div>
            <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">
              Admin accounts with 2FA enabled
            </div>
          </div>
          <div className="widget py-5 px-4">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] text-[10px] tracking-wider mb-2">
              <Key size={12} /> ACTIVE API KEYS
            </div>
            <div className="text-2xl font-semibold tabular-nums text-[var(--admin-accent)]">
              {d.summary.activeApiKeys}
            </div>
            <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">
              {d.summary.totalAuditEntries.toLocaleString()} total audit entries
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Security Events */}
        <div className="lg:col-span-7 widget">
          <div className="widget-title flex items-center justify-between mb-4">
            <span className="flex items-center gap-2"><Activity size={14} /> RECENT SECURITY EVENTS (24H)</span>
            <span className="text-[var(--admin-text-muted)] text-[10px]">{d.summary.totalEvents} events</span>
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {d.recentEvents.length === 0 ? (
              <div className="text-center py-8 text-[var(--admin-text-muted)] text-xs">
                <CheckCircle size={24} className="mx-auto mb-2 text-[#4ADE80]" />
                No security events in the last 24 hours
              </div>
            ) : (
              d.recentEvents.slice(0, 30).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--admin-bg-hover)] transition-colors group"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: SEVERITY_COLORS[event.severity] || "#666" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium text-[var(--admin-text-secondary)] truncate">
                        {event.action.replace(/_/g, " ")}
                      </div>
                      <div className={`text-[9px] px-1.5 py-0.5 rounded ${SEVERITY_BG[event.severity] || "text-[#666]"}`}>
                        {event.severity}
                      </div>
                    </div>
                    {event.details && (
                      <div className="text-[10px] text-[var(--admin-text-muted)] mt-0.5 truncate" title={event.details}>
                        {event.details}
                      </div>
                    )}
                    <div className="text-[9px] text-[var(--admin-text-muted)] mt-0.5 flex items-center gap-2">
                      <Clock size={9} />
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {d.recentEvents.length > 30 && (
            <div className="border-t border-[var(--admin-border)] pt-3 mt-2 text-center">
              <a href="/admin/security" className="text-[10px] text-[var(--admin-accent)] hover:underline">
                View all {d.recentEvents.length} events →
              </a>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Event Severity Breakdown */}
          <div className="widget">
            <div className="widget-title flex items-center gap-2 mb-4">
              <BarChart3 size={14} /> EVENT SEVERITY BREAKDOWN (7D)
            </div>
            <div className="space-y-3">
              {d.eventBreakdown.length === 0 ? (
                <div className="text-xs text-[var(--admin-text-muted)] text-center py-4">No events</div>
              ) : (
                d.eventBreakdown.map((item) => {
                  const total = d.eventBreakdown.reduce((s, e) => s + e.count, 0);
                  const pct = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.severity}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.severity] }} />
                          <span className="capitalize">{item.severity}</span>
                        </div>
                        <span className="tabular-nums text-[var(--admin-text-muted)]">{item.count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: SEVERITY_COLORS[item.severity] }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Login Activity */}
          <div className="widget">
            <div className="widget-title flex items-center gap-2 mb-4">
              <LogIn size={14} /> LOGIN ACTIVITY (24H)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-[#4ADE80]/5 border border-[#4ADE80]/20">
                <CheckCircle size={20} className="text-[#4ADE80] mx-auto mb-2" />
                <div className="text-2xl font-semibold tabular-nums text-[#4ADE80]">
                  {d.loginStats.successful}
                </div>
                <div className="text-[10px] text-[var(--admin-text-muted)]">Successful</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#F87171]/5 border border-[#F87171]/20">
                <XCircle size={20} className="text-[#F87171] mx-auto mb-2" />
                <div className="text-2xl font-semibold tabular-nums text-[#F87171]">
                  {d.loginStats.failed}
                </div>
                <div className="text-[10px] text-[var(--admin-text-muted)]">Failed</div>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F87171] to-[#4ADE80]"
                style={{ width: `${d.loginStats.successRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[var(--admin-text-muted)] mt-1">
              <span>{d.loginStats.successRate}% success rate</span>
              <span>{d.loginStats.total} total attempts</span>
            </div>
          </div>

          {/* Quick Security Actions */}
          <div className="widget">
            <div className="widget-title flex items-center gap-2 mb-4">
              <Server size={14} /> QUICK ACTIONS
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Security Center", icon: Shield, href: "/admin/security" },
                { label: "Activity Logs", icon: FileText, href: "/admin/security?tab=activity" },
                { label: "API Keys", icon: Key, href: "/admin/api-keys" },
                { label: "Integrations", icon: Globe, href: "/admin/integrations" },
              ].map((action, i) => (
                <a
                  key={i}
                  href={action.href}
                  className="flex items-center gap-2 p-3 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)] transition-colors text-xs text-[var(--admin-text-secondary)]"
                >
                  <action.icon size={14} className="text-[var(--admin-accent)] shrink-0" />
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-[9px] text-[var(--admin-text-muted)] flex items-center gap-2">
        <Clock size={10} />
        Last updated: {d.posture.updatedAt ? new Date(d.posture.updatedAt).toLocaleString() : "N/A"}
        <span className="mx-1">•</span>
        <span>{d.summary.totalAuditEntries.toLocaleString()} total audit entries</span>
      </div>
    </div>
  );
}

