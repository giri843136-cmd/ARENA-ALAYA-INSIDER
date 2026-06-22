"use client";

import React, { useState, useEffect } from "react";
import {
  MousePointerClick, Activity, Globe, Smartphone, Monitor,
  TrendingUp, Clock, RefreshCw, ExternalLink,
  Search, AlertCircle
} from "lucide-react";

interface ClickEvent {
  id: string;
  productName: string;
  productSlug: string;
  merchant: string;
  network: string;
  ipHash: string;
  country?: string;
  device: string;
  timestamp: string;
  revenue?: number;
}

// Simulated click data — in production, this would come from Supabase Realtime
function generateMockClick(): ClickEvent {
  const products = [
    { name: "Cashmere Throw Blanket", slug: "cashmere-throw-blanket" },
    { name: "Artisan Coffee Maker", slug: "artisan-coffee-maker" },
    { name: "Bamboo Cutting Board Set", slug: "bamboo-cutting-board-set" },
    { name: "Handcrafted Ceramic Vase", slug: "handcrafted-ceramic-vase" },
    { name: "Linen Bed Sheet Set", slug: "linen-bed-sheet-set" },
    { name: "Smart LED Floor Lamp", slug: "smart-led-floor-lamp" },
    { name: "Wool Knit Beanie", slug: "wool-knit-beanie" },
    { name: "Leather Journal Notebook", slug: "leather-journal-notebook" },
  ];
  const merchants = ["Amazon", "Walmart", "Target", "Nordstrom", "Etsy", "West Elm"];
  const networks = ["AMAZON", "WALMART", "IMPACT", "CJ", "SHAREASALE", "BRAND_DIRECT"];
  const devices = ["Desktop", "Mobile", "Tablet"];
  const countries = ["US", "UK", "CA", "AU", "DE", "FR"];

  const product = products[Math.floor(Math.random() * products.length)];
  const idx = Math.floor(Math.random() * merchants.length);

  return {
    id: Math.random().toString(36).slice(2),
    productName: product.name,
    productSlug: product.slug,
    merchant: merchants[idx],
    network: networks[idx],
    ipHash: `${Math.random().toString(36).slice(2, 6)}:${Math.random().toString(36).slice(2, 6)}`,
    country: countries[Math.floor(Math.random() * countries.length)],
    device: devices[Math.floor(Math.random() * devices.length)],
    timestamp: new Date().toISOString(),
    revenue: Math.random() > 0.7 ? Number((Math.random() * 15 + 2).toFixed(2)) : undefined,
  };
}

export default function LiveClicksPage() {
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [search, setSearch] = useState("");
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Generate real-time clicks
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!isLive) return;

    // Generate initial batch
    const initial = Array.from({ length: 8 }, () => generateMockClick());
    setClicks(initial);
    setTotalClicks(initial.length);
    setTotalRevenue(initial.reduce((sum, c) => sum + (c.revenue || 0), 0));

    // Add new clicks every 2-5 seconds
    const interval = setInterval(() => {
      const newClicks = Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => generateMockClick()
      );
      setClicks((prev) => {
        const updated = [...newClicks, ...prev].slice(0, 100);
        setTotalClicks((t) => t + newClicks.length);
        setTotalRevenue((r) => r + newClicks.reduce((s, c) => s + (c.revenue || 0), 0));
        return updated;
      });
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const filtered = clicks.filter((c) =>
    c.productName.toLowerCase().includes(search.toLowerCase()) ||
    c.merchant.toLowerCase().includes(search.toLowerCase()) ||
    c.network.toLowerCase().includes(search.toLowerCase())
  );

  const deviceIcon = (device: string) => {
    switch (device) {
      case "Mobile": return <Smartphone size={12} />;
      case "Tablet": return <Smartphone size={12} />;
      default: return <Monitor size={12} />;
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <MousePointerClick size={14} /> LIVE AFFILIATE CLICKS
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Click Stream</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Real-time affiliate click activity — updates every few seconds
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isLive
                  ? "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30"
                  : "bg-[var(--admin-bg-subtle)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-[#4ADE80] animate-pulse" : "bg-[#666]"}`} />
              {isLive ? "LIVE" : "PAUSED"}
            </button>
            <button
              onClick={() => setClicks(Array.from({ length: 8 }, () => generateMockClick()))}
              className="p-1.5 rounded-lg hover:bg-[var(--admin-bg-active)] transition-colors"
            >
              <RefreshCw size={14} className="text-[var(--admin-text-muted)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Clicks (Session)", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-blue-400" },
          { label: "Est. Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Avg. Conversion", value: `${((totalRevenue > 0 ? 12 : 0)).toFixed(1)}%`, icon: Activity, color: "text-amber-400" },
          { label: "Active Products", value: new Set(clicks.map((c) => c.productSlug)).size.toString(), icon: Globe, color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="admin-card p-4 border border-[var(--admin-border)]">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="text-[10px] text-[var(--admin-text-muted)] tracking-wider">{stat.label}</span>
            </div>
            <div className="text-xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search filter */}
      <div className="relative max-w-sm mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product, merchant, or network..."
          className="input-admin w-full pl-9 text-sm py-2"
        />
      </div>

      {/* Click stream */}
      <div className="admin-card border border-[var(--admin-border)] overflow-hidden">
        <div className="p-3 border-b border-[var(--admin-border)] text-[10px] text-[var(--admin-text-muted)] tracking-wider font-medium flex items-center gap-2">
          <Clock size={12} />
          RECENT CLICKS ({filtered.length} showing)
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--admin-text-muted)]">
            <MousePointerClick size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No click activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--admin-border)] max-h-[600px] overflow-y-auto">
            {filtered.map((click) => (
              <div
                key={click.id}
                className="flex items-center gap-4 p-3 hover:bg-[var(--admin-bg-hover)] transition-colors animate-in slide-in-from-left-1 fade-in duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--admin-bg-subtle)] flex items-center justify-center shrink-0">
                  <MousePointerClick size={14} className="text-[var(--admin-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{click.productName}</span>
                    <a
                      href={`/products/${click.productSlug}`}
                      className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)]"
                    >
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--admin-text-muted)] mt-0.5">
                    <span>{click.merchant}</span>
                    <span className="px-1 py-0.5 rounded bg-[var(--admin-bg-subtle)]">{click.network}</span>
                    <span className="flex items-center gap-1">{deviceIcon(click.device)}{click.device}</span>
                    <span className="flex items-center gap-1"><Globe size={10} />{click.country}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-[var(--admin-text-muted)]">{formatTime(click.timestamp)}</div>
                  {click.revenue && (
                    <div className="text-xs font-medium text-emerald-400">+${click.revenue.toFixed(2)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-[10px] text-[var(--admin-text-muted)] flex items-center gap-2">
        <AlertCircle size={10} />
        Showing simulated real-time data. In production, connect to Supabase Realtime for live affiliate click events.
      </div>
    </div>
  );
}
