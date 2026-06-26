"use client";

import React, { useState } from "react";
import {
  Tag, Plus, Trash2, Percent,
  Calendar, AlertTriangle, X, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  productName: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  type: "percent" | "fixed";
  expiresAt: string;
  active: boolean;
}

function CreateDealModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (deal: Deal) => void }) {
  const [form, setForm] = useState({ title: "", description: "", discount: "", productName: "", endsAt: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.discount || !form.productName) { toast.error("Title, discount, and product are required"); return; }
    setSubmitting(true);
    const deal: Deal = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      discount: Number(form.discount),
      productName: form.productName,
      startsAt: new Date().toISOString().split("T")[0],
      endsAt: form.endsAt || "",
      active: true,
    };
    onCreated(deal);
    toast.success(`Deal "${form.title}" created`);
    setForm({ title: "", description: "", discount: "", productName: "", endsAt: "" });
    setSubmitting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Deal</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#252525] rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Discount (%) *</label>
            <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required min={1} max={100} />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Product *</label>
            <input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm resize-none h-20" />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">End Date</label>
            <input type="date" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-admin-primary text-xs disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Tag size={14} className="mr-1" />}
              {submitting ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function CreateCouponModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (coupon: Coupon) => void }) {
  const [form, setForm] = useState({ code: "", description: "", discount: "", type: "percent" as "percent" | "fixed", expiresAt: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discount) { toast.error("Code and discount are required"); return; }
    setSubmitting(true);
    const coupon: Coupon = {
      id: Date.now().toString(),
      code: form.code.toUpperCase(),
      description: form.description,
      discount: Number(form.discount),
      type: form.type,
      expiresAt: form.expiresAt || "",
      active: true,
    };
    onCreated(coupon);
    toast.success(`Coupon "${form.code.toUpperCase()}" created`);
    setForm({ code: "", description: "", discount: "", type: "percent", expiresAt: "" });
    setSubmitting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Coupon</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#252525] rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Code *</label>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm font-mono uppercase" required placeholder="SUMMER20" />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm">
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">{form.type === "percent" ? "Discount (%)" : "Discount ($)"} *</label>
            <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" required min={1} />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Expires</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-admin-primary text-xs disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Percent size={14} className="mr-1" />}
              {submitting ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const defaultDeals: Deal[] = [
  { id: "1", title: "Summer Sanctuary Sale", description: "20% off select bedding", discount: 20, productName: "Linen Duvet Cover — Oat", startsAt: "2026-06-01", endsAt: "2026-06-30", active: true },
  { id: "2", title: "Cashmere Bundle", description: "15% off when you buy 2+", discount: 15, productName: "Italian Cashmere Crewneck", startsAt: "2026-06-10", endsAt: "2026-06-25", active: true },
];

const defaultCoupons: Coupon[] = [
  { id: "c1", code: "WELCOME10", description: "New customer discount", discount: 10, type: "percent", expiresAt: "2026-12-31", active: true },
  { id: "c2", code: "FREESHIP", description: "Free shipping on orders over $100", discount: 0, type: "fixed", expiresAt: "2026-07-31", active: true },
];

export default function DealManager() {
  const [deals, setDeals] = useState<Deal[]>(defaultDeals);
  const [coupons, setCoupons] = useState<Coupon[]>(defaultCoupons);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [showNewCoupon, setShowNewCoupon] = useState(false);

  const activeDeals = deals.filter((d) => d.active && (!d.endsAt || new Date(d.endsAt) > new Date())).length;
  const activeCoupons = coupons.filter((c) => c.active).length;

  const toggleDeal = (id: string) => {
    setDeals(deals.map(d => d.id === id ? { ...d, active: !d.active } : d));
    toast.success("Deal status toggled");
  };

  const toggleCoupon = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
    toast.success("Coupon status toggled");
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success("Coupon deleted");
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <CreateDealModal open={showNewDeal} onClose={() => setShowNewDeal(false)}
        onCreated={(deal) => setDeals([deal, ...deals])} />
      <CreateCouponModal open={showNewCoupon} onClose={() => setShowNewCoupon(false)}
        onCreated={(coupon) => setCoupons([coupon, ...coupons])} />

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
            <button className="btn-admin text-xs" onClick={() => setShowNewDeal(true)}><Plus size={14} /> New Deal</button>
            <button className="btn-admin-primary text-xs" onClick={() => setShowNewCoupon(true)}><Percent size={14} /> New Coupon</button>
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
          {deals.length === 0 ? (
            <div className="admin-card p-8 text-center border border-[var(--admin-border)] text-sm text-[var(--admin-text-muted)]">
              No deals yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((d) => (
                <div key={d.id} className={`admin-card p-5 border border-[var(--admin-border)] flex items-center justify-between ${!d.active ? "opacity-50" : ""}`}>
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-[var(--admin-text-secondary)] mt-1">{d.productName}</div>
                    {d.description && <div className="text-xs text-[var(--admin-text-muted)] mt-0.5">{d.description}</div>}
                  </div>
                  <div className="text-right flex items-center gap-4">
                    {d.discount > 0 && <span className="text-lg font-semibold text-[#FBBF24]">{d.discount}% OFF</span>}
                    <div className="text-[10px] text-[var(--admin-text-muted)] flex items-center gap-1">
                      <Calendar size={10} /> {d.endsAt || "No end date"}
                    </div>
                    <button onClick={() => toggleDeal(d.id)} className={`btn-admin-ghost text-xs p-1.5 ${d.active ? "text-[#FBBF24]" : "text-[#4ADE80]"}`}>
                      {d.active ? "Pause" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupons */}
        <div className="lg:col-span-5">
          <div className="widget-title mb-4">COUPON CODES</div>
          {coupons.length === 0 ? (
            <div className="admin-card p-8 text-center border border-[var(--admin-border)] text-sm text-[var(--admin-text-muted)]">
              No coupons yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c.id} className={`admin-card p-5 border border-[var(--admin-border)] ${!c.active ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-lg font-semibold tracking-wider text-[var(--admin-accent)]">{c.code}</code>
                      {c.active ? (
                        <span className="badge-admin badge-admin-success text-[10px]">Active</span>
                      ) : (
                        <span className="badge-admin badge-admin-neutral text-[10px]">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleCoupon(c.id)} className="btn-admin-ghost text-xs p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]">{c.active ? "Pause" : "Activate"}</button>
                      <button onClick={() => deleteCoupon(c.id)} className="btn-admin-ghost text-xs p-1 text-[#F87171]"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  {c.description && <div className="text-xs text-[var(--admin-text-secondary)]">{c.description}</div>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--admin-text-muted)]">
                    {c.discount > 0 && <span>{c.type === "percent" ? `${c.discount}%` : `$${c.discount}`}</span>}
                    {c.expiresAt && <span className="flex items-center gap-1"><Calendar size={10} /> Expires {c.expiresAt}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" /> Deals and coupons are applied at checkout and tracked via affiliate network webhooks.
      </div>
    </div>
  );
}
