"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingDown, Bell, RefreshCw, Loader2, AlertTriangle,
  DollarSign, Clock, Tag
} from "lucide-react";

interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  status: string;
  createdAt: string;
}

interface ActiveDeal {
  id: string;
  title: string;
  discount: number | null;
  productName: string;
  endsAt: string;
}

export default function PriceMonitor() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [deals, setDeals] = useState<ActiveDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [alertsRes, dealsRes] = await Promise.all([
        fetch("/api/v1/price-alerts?limit=50"),
        fetch("/api/v1/deals/active"),
      ]);
      const [alertsJson, dealsJson] = await Promise.all([alertsRes.json(), dealsRes.json()]);
      if (alertsJson.success) setAlerts(alertsJson.data?.alerts || alertsJson.data || []);
      if (dealsJson.success) setDeals(dealsJson.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <TrendingDown size={14} /> PRICE MONITOR
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Price Monitoring &amp; Alerts</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Track price changes, manage alerts, and monitor active deals.</p>
          </div>
          <button onClick={fetchData} disabled={loading} className="btn-admin text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Price Alerts */}
        <div className="lg:col-span-7 widget">
          <div className="widget-title flex items-center gap-2"><Bell size={14} /> ACTIVE PRICE ALERTS</div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" /></div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--admin-text-muted)]">
              <Bell size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No active price alerts</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]">
                  <div>
                    <div className="font-medium text-sm">{a.productName}</div>
                    <div className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                      Current: <span className="text-[#F87171]">${a.currentPrice}</span> → Target: <span className="text-[#4ADE80]">${a.targetPrice}</span>
                    </div>
                  </div>
                  <span className={`badge-admin text-[10px] ${a.status === "ACTIVE" ? "badge-admin-success" : "badge-admin-neutral"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Deals */}
        <div className="lg:col-span-5 widget">
          <div className="widget-title flex items-center gap-2"><Tag size={14} /> ACTIVE DEALS</div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" /></div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--admin-text-muted)]">
              <Tag size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No active deals</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {deals.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--admin-border)]">
                  <div>
                    <div className="font-medium text-sm">{d.title}</div>
                    <div className="text-xs text-[var(--admin-text-muted)]">{d.productName}</div>
                  </div>
                  <div className="text-right">
                    {d.discount && <div className="text-sm font-semibold text-[#FBBF24]">{d.discount}% off</div>}
                    <div className="text-[10px] text-[var(--admin-text-muted)] flex items-center gap-1">
                      <Clock size={10} /> {new Date(d.endsAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price History Summary */}
        <div className="lg:col-span-12 widget">
          <div className="widget-title flex items-center gap-2"><DollarSign size={14} /> PRICE DROP HISTORY</div>
          <div className="h-48 flex items-center justify-center text-[var(--admin-text-muted)] text-sm border border-[var(--admin-border)] rounded-xl">
            [Price history chart — 30-day price trends for tracked products. Powered by PriceHistory records.]
          </div>
          <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-3">
            <span>Tracked products: 18,420</span>
            <span>Active price alerts: {alerts.length}</span>
            <span>Deals ending soon: {deals.filter((d) => new Date(d.endsAt).getTime() - new Date().getTime() < 7 * 86400000).length}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" /> Price monitoring runs daily via the Automation Center. Users receive notifications when their target price is reached.
      </div>
    </div>
  );
}
