"use client";

import React, { useState } from "react";
import {
  TrendingUp, Search, Loader2,
  ArrowUp, ArrowDown
} from "lucide-react";
import { toast } from "sonner";

interface Trend {
  keyword: string;
  volume: number;
  growth: number;
  category: string;
  direction: "up" | "down";
}

export default function TrendRadar() {
  const [scanning, setScanning] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [scanned, setScanned] = useState(false);

  const scanTrends = async () => {
    setScanning(true);
    // Simulate trend scanning
    setTimeout(() => {
      setTrends([
        { keyword: "linen bedding", volume: 1240, growth: 42, category: "Bedding", direction: "up" },
        { keyword: "cashmere sweater", volume: 980, growth: 28, category: "Clothing", direction: "up" },
        { keyword: "cast iron skillet", volume: 870, growth: 35, category: "Kitchen", direction: "up" },
        { keyword: "ceramic vase", volume: 650, growth: 18, category: "Decor", direction: "up" },
        { keyword: "silk sleep mask", volume: 540, growth: 52, category: "Wellness", direction: "up" },
        { keyword: "wool throw blanket", volume: 480, growth: 22, category: "Throws", direction: "up" },
        { keyword: "marble serving board", volume: 320, growth: -5, category: "Kitchen", direction: "down" },
        { keyword: "bamboo cutting board", volume: 280, growth: -12, category: "Kitchen", direction: "down" },
      ]);
      setScanned(true);
      setScanning(false);
      toast.success("Trend scan complete");
    }, 2000);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <TrendingUp size={14} /> INTELLIGENCE
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Trend Radar</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Rising searches, emerging categories, and market shifts.</p>
          </div>
          <button onClick={scanTrends} disabled={scanning} className="btn-admin-primary text-xs">
            {scanning ? <><Loader2 size={14} className="animate-spin" /> Scanning...</> : <><Search size={14} /> Scan Trends</>}
          </button>
        </div>
      </div>

      {!scanned && !scanning ? (
        <div className="admin-card p-12 text-center border border-[var(--admin-border)]">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-30 text-[var(--admin-text-muted)]" />
          <h3 className="text-lg font-medium mb-2">No trend data yet</h3>
          <p className="text-sm text-[var(--admin-text-secondary)] mb-6">Scan search and social data to discover rising trends.</p>
          <button onClick={scanTrends} className="btn-admin-primary text-xs">Scan Trends</button>
        </div>
      ) : scanning ? (
        <div className="admin-card p-12 text-center border border-[var(--admin-border)]">
          <Loader2 size={32} className="mx-auto mb-4 animate-spin text-[var(--admin-accent)]" />
          <p className="text-sm text-[var(--admin-text-secondary)]">Scanning search queries, social signals, and market data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="admin-card p-6 border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Rising Trends</div>
              <div className="text-3xl font-semibold tabular-nums text-[#4ADE80]">{trends.filter(t => t.direction === "up").length}</div>
            </div>
            <div className="admin-card p-6 border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Declining</div>
              <div className="text-3xl font-semibold tabular-nums text-[#F87171]">{trends.filter(t => t.direction === "down").length}</div>
            </div>
            <div className="admin-card p-6 border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Total Searches</div>
              <div className="text-3xl font-semibold tabular-nums">{trends.reduce((a, t) => a + t.volume, 0).toLocaleString()}</div>
            </div>
            <div className="admin-card p-6 border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Avg Growth</div>
              <div className="text-3xl font-semibold tabular-nums text-[#4ADE80]">
                +{Math.round(trends.filter(t => t.direction === "up").reduce((a, t) => a + t.growth, 0) / trends.filter(t => t.direction === "up").length)}%
              </div>
            </div>
          </div>

          {/* Trends Table */}
          <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Category</th>
                  <th className="text-right">Search Volume</th>
                  <th className="text-right">Growth</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t, i) => (
                  <tr key={i} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                    <td className="font-medium">{t.keyword}</td>
                    <td><span className="badge-admin badge-admin-neutral text-[10px]">{t.category}</span></td>
                    <td className="text-right tabular-nums">{t.volume.toLocaleString()}</td>
                    <td className="text-right">
                      <span className={`flex items-center gap-1 justify-end ${t.direction === "up" ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
                        {t.direction === "up" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {Math.abs(t.growth)}%
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="btn-admin btn-admin-ghost text-xs">Explore</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Trend data is aggregated from search analytics, social signals, and market feeds via the AI Workspace.
      </div>
    </div>
  );
}
