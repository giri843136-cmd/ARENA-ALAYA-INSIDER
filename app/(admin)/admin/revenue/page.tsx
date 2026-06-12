"use client";

import React from "react";

export default function RevenueIntelligence() {
  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[#C5AA8A]">REVENUE INTELLIGENCE</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Revenue &amp; Commission Performance</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="admin-card p-8 lg:col-span-8">
          <div className="widget-title mb-5 flex items-center justify-between">
            <span>Revenue Over Time</span>
            <span className="text-[#666] text-xs">Last 30 days • +18% MoM</span>
          </div>
          <div className="h-80 flex items-center justify-center text-[#666] border border-[#252525] rounded-2xl text-sm">
            [Recharts Area Chart — 30-day revenue + commission overlay. All existing analytics preserved.]
          </div>
        </div>

        <div className="admin-card p-8 lg:col-span-4">
          <div className="widget-title">Network Breakdown</div>
          <div className="space-y-5 mt-6 text-sm">
            {[
              { name: "Impact", rev: "$19,420", pct: 47 },
              { name: "Amazon", rev: "$11,890", pct: 29 },
              { name: "CJ Affiliate", rev: "$6,240", pct: 15 },
              { name: "Brand Direct", rev: "$3,730", pct: 9 },
            ].map(n => (
              <div key={n.name} className="flex justify-between items-center">
                <span>{n.name}</span>
                <span className="font-mono text-[#C5AA8A]">{n.rev} <span className="text-[#666]">({n.pct}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card border border-[#252525] overflow-x-auto">
        <div className="flex justify-between mb-6 items-baseline px-8 pt-8">
          <div className="widget-title">Top Earning Products</div>
          <button className="text-xs text-[#C5AA8A]">Download full report →</button>
        </div>
        <table className="admin-table w-full text-sm min-w-[820px]">
          <thead><tr><th>Product</th><th className="text-right">Revenue</th><th className="text-right">Commission</th><th>EPC</th></tr></thead>
          <tbody>
            {["Linen Duvet — Oat", "Cashmere Crewneck", "Silk Sleep Mask", "Cast Iron Skillet", "Ceramic Vase"].map((p, i) => (
              <tr key={i}>
                <td className="font-medium">{p}</td>
                <td className="text-right tabular-nums">${(12400 + i * 3100).toLocaleString()}</td>
                <td className="text-right text-[#4ADE80] tabular-nums">${(2100 + i * 480).toLocaleString()}</td>
                <td className="text-right font-mono text-xs">18.4%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

