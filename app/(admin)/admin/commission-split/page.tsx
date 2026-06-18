"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Percent, PieChart, Plus, RefreshCw, Loader2, CheckCircle,
  AlertTriangle, DollarSign, Users, Network
} from "lucide-react";
import { toast } from "sonner";

interface SplitEntry {
  recipientId: string;
  recipientType: string;
  share: number;
}

interface SplitRule {
  id: string;
  name: string;
  description?: string;
  splits: SplitEntry[];
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface CommissionSummary {
  totalCommission: number;
  totalEvents: number;
  periodDays: number;
  byNetwork: { network: string; amount: number }[];
  lastUpdated: string;
}

const TYPE_LABELS: Record<string, string> = {
  author: "Content Author",
  platform: "Platform",
  affiliate_network: "Affiliate Network",
  referrer: "Referrer",
};

const TYPE_COLORS: Record<string, string> = {
  author: "#4ADE80",
  platform: "#C5A26F",
  affiliate_network: "#FBBF24",
  referrer: "#818CF8",
};

export default function CommissionSplitPage() {
  const [rules, setRules] = useState<SplitRule[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<string>("default-70-20-10");
  const [calcCommission, setCalcCommission] = useState("100");
  const [calcResult, setCalcResult] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, summaryRes] = await Promise.all([
        fetch("/api/v1/admin/commission-split?mode=rules"),
        fetch("/api/v1/admin/commission-split?mode=summary&days=30"),
      ]);
      const rulesJson = await rulesRes.json();
      const summaryJson = await summaryRes.json();
      if (rulesJson.success) setRules(rulesJson.data);
      if (summaryJson.success) setSummary(summaryJson.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const calculateSplit = async () => {
    try {
      const res = await fetch(
        `/api/v1/admin/commission-split?mode=calculate&commission=${calcCommission}&ruleId=${selectedRule}`
      );
      const json = await res.json();
      if (json.success) setCalcResult(json.data);
    } catch { toast.error("Calculation failed"); }
  };

  if (loading && rules.length === 0) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Percent size={14} /> COMMISSION SPLITTING
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Commission Splitting</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Configure how affiliate commissions are distributed between authors, affiliates, and the platform.
            </p>
          </div>
          <button onClick={fetchData} disabled={loading} className="btn-admin text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules */}
        <div className="lg:col-span-7">
          <div className="widget-title mb-4">SPLIT RULES</div>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="admin-card p-5 border border-[var(--admin-border)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-sm">{rule.name}</h3>
                    {rule.description && (
                      <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">{rule.description}</p>
                    )}
                  </div>
                  <span className={`badge-admin text-[10px] ${rule.isActive ? "badge-admin-success" : "badge-admin-neutral"}`}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Split visualization */}
                <div className="flex h-8 rounded-lg overflow-hidden mb-3">
                  {rule.splits.map((split, i) => {
                    const colors = Object.values(TYPE_COLORS);
                    const color = colors[i % colors.length];
                    return (
                      <div
                        key={split.recipientId}
                        style={{
                          width: `${split.share}%`,
                          backgroundColor: color,
                        }}
                        className="flex items-center justify-center text-[9px] text-white font-medium first:rounded-l-lg last:rounded-r-lg"
                        title={`${TYPE_LABELS[split.recipientType] || split.recipientType}: ${split.share}%`}
                      >
                        {split.share >= 15 ? `${split.share}%` : ""}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {rule.splits.map((split) => (
                    <div key={split.recipientId} className="flex items-center gap-2 text-xs text-[var(--admin-text-secondary)]">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: TYPE_COLORS[split.recipientType] || "#666" }}
                      />
                      <span className="text-[var(--admin-text-muted)]">{TYPE_LABELS[split.recipientType] || split.recipientType}:</span>
                      <span className="font-semibold">{split.share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Calculator */}
          <div className="admin-card p-5 border border-[var(--admin-border)]">
            <div className="widget-title mb-4">
              <span className="flex items-center gap-2"><PieChart size={14} /> CALCULATOR</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Commission Amount ($)</label>
                <input
                  type="number"
                  value={calcCommission}
                  onChange={(e) => setCalcCommission(e.target.value)}
                  className="input-admin w-full"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Split Rule</label>
                <select
                  value={selectedRule}
                  onChange={(e) => setSelectedRule(e.target.value)}
                  className="input-admin w-full text-sm"
                >
                  {rules.filter((r) => r.isActive).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={calculateSplit} className="btn-admin-primary w-full text-xs">
                <Percent size={14} /> Calculate Split
              </button>
            </div>

            {calcResult && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)]">
                <div className="text-xs font-medium mb-2">Result</div>
                <div className="text-lg font-semibold tabular-nums text-[var(--admin-accent)] mb-2">
                  ${calcResult.totalCommission.toFixed(2)} total
                </div>
                <div className="space-y-1.5">
                  {calcResult.splits.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--admin-text-secondary)]">
                        {TYPE_LABELS[s.recipientType] || s.recipientType}
                      </span>
                      <div className="text-right">
                        <span className="font-semibold tabular-nums">${s.amount.toFixed(2)}</span>
                        <span className="text-[var(--admin-text-muted)] ml-1">({s.share}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-[9px] text-[var(--admin-text-muted)] mt-2">
                  Rule: {calcResult.ruleName}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <div className="admin-card p-5 border border-[var(--admin-border)]">
              <div className="widget-title mb-4">
                <span className="flex items-center gap-2"><DollarSign size={14} /> 30-DAY SUMMARY</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--admin-text-secondary)]">Total Commission</span>
                  <span className="text-lg font-semibold tabular-nums">${summary.totalCommission.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--admin-text-secondary)]">Total Events</span>
                  <span className="font-semibold tabular-nums">{summary.totalEvents}</span>
                </div>
                {summary.byNetwork.length > 0 && (
                  <>
                    <div className="text-xs text-[var(--admin-text-secondary)] font-medium mt-2">By Network</div>
                    {summary.byNetwork.map((n) => (
                      <div key={n.network} className="flex items-center justify-between text-xs">
                        <span className="capitalize">{n.network.toLowerCase()}</span>
                        <span className="tabular-nums">${n.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info card */}
          <div className="admin-card p-5 border border-[var(--admin-border)]">
            <div className="flex items-start gap-3">
              <Users size={16} className="text-[var(--admin-accent)] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium mb-1">How Commission Splitting Works</div>
                <ul className="text-[10px] text-[var(--admin-text-secondary)] space-y-1">
                  <li>• Content authors earn a share of affiliate commissions</li>
                  <li>• Referrers (users who share links) earn from their referrals</li>
                  <li>• Platform share covers operational costs</li>
                  <li>• All splits are recorded for audit trail</li>
                  <li>• Rules are applied at commission attribution time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
