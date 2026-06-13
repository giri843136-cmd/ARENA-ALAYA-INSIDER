"use client";

import React, { useState } from "react";
import {
  Tag, Plus, Trash2, RefreshCw, Percent,
  Calendar, DollarSign, AlertTriangle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  discount: number | null;
  productId: string;
  productName: string;
  startsAt: string | null;
  endsAt: string | null;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount: number | null;
  type: string;
  expiresAt: string | null;
  active: boolean;
}

export default function DealManager() {
  const [deals] = useState<Deal[]>([
    { id: "1", title: "Summer Sanctuary Sale", description: "20% off select bedding", discount: 20, productId: "p1", productName: "Linen Duvet Cover — Oat", startsAt: "2026-06-01", endsAt: "2026-06-30" },
    { id: "2", title: "Cashmere Bundle", description: "15% off when you buy 2+", discount: 15, productId: "p2", productName: "Italian Cashmere Crewneck", startsAt: "2026-06-10", endsAt: "2026-06-25" },
  ]);

  const [coupons] = useState<Coupon[]>([
    { id: "c1", code: "WELCOME10", description: "New customer discount", discount: 10, type: "percent", expiresAt: "2026-12-31", active: true },
    { id: "c2", code: "FREESHIP", description: "Free shipping on orders over $100", discount: null, type: "fixed", expiresAt: "2026-07-31", active: true },
  ]);

  const activeDeals = deals.filter((d) => !d.endsAt || new Date(d.endsAt) > new Date()).length;
  const activeCoupons = coupons.filter((c) => c.active).length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Tag size={14} /> PROMOTIONS
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Deals &amp; Coupons</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Manage promotions, discounts, and coupon codes.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-admin text-xs" onClick={() => toast.success("New deal form opened")}><Plus size={14} /> New Deal</button>
            <button className="btn-admin-primary text-xs" onClick={() => toast.success("New coupon form opened")}><Percent size={14} /> New Coupon</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Active Deals</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#4ADE80]">{activeDeals}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Active Coupons</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[var(--admin-accent)]">{activeCoupons}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deals */}
        <div className="lg:col-span-7">
          <div className="widget-title mb-4">ACTIVE DEALS</div>
          <div className="space-y-3">
            {deals.map((d) => (
              <div key={d.id} className="admin-card p-5 border border-[var(--admin-border)] flex items-center justify-between">
                <div>
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-[var(--admin-text-secondary)] mt-1">{d.productName}</div>
                  {d.description && <div className="text-xs text-[var(--admin-text-muted)] mt-0.5">{d.description}</div>}
                </div>
                <div className="text-right flex items-center gap-4">
                  {d.discount && <span className="text-lg font-semibold text-[#FBBF24]">{d.discount}% OFF</span>}
                  <div className="text-[10px] text-[var(--admin-text-muted)] flex items-center gap-1">
                    <Calendar size={10} /> {d.endsAt || "No end date"}
                  </div>
                  <button className="btn-admin btn-admin-ghost text-xs p-1.5 text-[#F87171]"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons */}
        <div className="lg:col-span-5">
          <div className="widget-title mb-4">COUPON CODES</div>
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="admin-card p-5 border border-[var(--admin-border)]">
                <div className="flex items-center justify-between mb-2">
                  <code className="font-mono text-lg font-semibold tracking-wider text-[var(--admin-accent)]">{c.code}</code>
                  {c.active ? (
                    <span className="badge-admin badge-admin-success text-[10px]">Active</span>
                  ) : (
                    <span className="badge-admin badge-admin-neutral text-[10px]">Inactive</span>
                  )}
                </div>
                {c.description && <div className="text-xs text-[var(--admin-text-secondary)]">{c.description}</div>}
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--admin-text-muted)]">
                  {c.discount && <span>{c.type === "percent" ? `${c.discount}%` : `$${c.discount}`}</span>}
                  {c.expiresAt && <span className="flex items-center gap-1"><Calendar size={10} /> Expires {c.expiresAt}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" /> Deals and coupons are applied at checkout and tracked via affiliate network webhooks.
      </div>
    </div>
  );
}
