"use client";

import React from "react";
import { 
  BarChart3, TrendingUp, Package, BookOpen, Zap, 
  CheckCircle 
} from "lucide-react";

export default function CommandCenter() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[2px] text-[#C5A26F] font-medium">COMMAND CENTER</div>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Good morning, Elena.</h1>
        <p className="text-[#A1A1A1] mt-1">Everything is healthy. 3 new products published overnight.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
        {[
          { label: "Revenue (30d)", value: "$284,920", change: "+18%", icon: BarChart3 },
          { label: "Commission", value: "$41,280", change: "+12%", icon: TrendingUp },
          { label: "Active Products", value: "18,420", change: "+312", icon: Package },
          { label: "Monthly Readers", value: "1.24m", change: "+9%", icon: BookOpen },
          { label: "AI Generations", value: "1,847", change: "+41%", icon: Zap },
          { label: "Link Health", value: "99.7%", change: "↑", icon: CheckCircle },
        ].map((kpi, i) => (
          <div key={i} className="widget">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#A1A1A1]">{kpi.label}</div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{kpi.value}</div>
              </div>
              <div className="text-[#C5A26F]"><kpi.icon size={20} /></div>
            </div>
            <div className="text-xs text-[#4ADE80] mt-3">{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue + Performance */}
        <div className="lg:col-span-5 widget">
          <div className="widget-title flex items-center gap-2"><BarChart3 size={14} /> REVENUE INTELLIGENCE</div>
          <div className="h-64 flex items-center justify-center text-[#666] text-sm">
            [Recharts Area Chart — Revenue by day + Commission breakdown would render here]
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
            <div>Top Network: <span className="font-medium text-[#C5A26F]">Impact</span> ($19.4k)</div>
            <div>Top Product: <span className="font-medium">Linen Duvet — Oat</span></div>
            <div>Best Brand: <span className="font-medium">Ferm Living</span></div>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 widget">
          <div className="widget-title flex justify-between">
            TOP PRODUCTS <span className="text-[#666] cursor-pointer text-xs">See all →</span>
          </div>
          <div className="space-y-3 text-sm">
            {["Linen Duvet Cover — Oat", "Italian Cashmere Crewneck", "Mulberry Silk Sleep Mask", "Cast Iron Skillet 10\"", "Ceramic Vase — Matte Taupe"].map((p, i) => (
              <div key={i} className="flex justify-between border-b border-[#252525] pb-3 last:border-none last:pb-0">
                <div>{p}</div>
                <div className="text-[#A1A1A1] tabular-nums">${(184 + i * 31).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity + Health */}
        <div className="lg:col-span-3 widget">
          <div className="widget-title">SYSTEM HEALTH</div>
          <div className="space-y-4 text-sm">
            {[
              { label: "Typesense", status: "healthy", value: "12ms avg" },
              { label: "Postgres", status: "healthy", value: "98% cache" },
              { label: "Affiliate Links", status: "healthy", value: "2 broken" },
              { label: "AI Jobs", status: "warning", value: "47 queued" },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>{s.label}</div>
                <div className={`text-xs ${s.status === "healthy" ? "text-[#4ADE80]" : "text-[#FBBF24]"}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-7 widget">
          <div className="widget-title">LIVE ACTIVITY</div>
          <div className="text-sm space-y-2.5">
            {[
              "Elena Voss published “The Quiet Luxury of Linen”",
              "System ran 184 affiliate link health checks — 2 degraded",
              "SEO Strategist completed 312 meta descriptions",
              "New user signed up: priya@studio.com (Canada)",
              "Recommendation graph refreshed (18,420 products)"
            ].map((a, i) => (
              <div key={i} className="flex gap-3 text-[#A1A1A1]">
                <div className="text-[#666] tabular-nums w-14 shrink-0">{10 - i}:4{i}</div>
                <div>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-5 widget">
          <div className="widget-title">QUICK ACTIONS</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Bulk import products",
              "Run AI Content Architect",
              "Validate all affiliate links",
              "Generate sitemap",
              "Refresh recommendation graph",
              "Export revenue report"
            ].map((action, i) => (
              <button key={i} onClick={() => alert(`Action: ${action} (demo)`)} className="btn-admin justify-start">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
