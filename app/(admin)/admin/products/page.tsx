"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Download, Upload, Filter, Package, Loader2, RefreshCw, X, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProductData {
  id: string; name: string; slug: string; price: number; status: string; rating: number;
  brand?: { id: string; name: string; slug: string } | null;
  universe?: { id: string; title: string; slug: string } | null;
  affiliateLinks?: Array<{ id: string; network: string; health: string }>;
  productStats?: { pageViews: number; affiliateClicks: number; revenue: number } | null;
  _count?: { reviews: number };
}

function CreateProductModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", shortDescription: "", price: "", brandId: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price) { toast.error("Name, slug, and price are required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), status: "DRAFT" }),
      });
      const json = await res.json();
      if (json.success) { toast.success(`Product "${form.name}" created`); setForm({ name: "", slug: "", shortDescription: "", price: "", brandId: "" }); onCreated(); onClose(); }
      else { toast.error(json.error?.message || "Failed to create product"); }
    } catch { toast.error("Network error"); }
    finally { setSubmitting(false); }
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Product</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#252525] rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Product Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" placeholder="Linen Duvet Cover" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Slug *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" placeholder="linen-duvet-cover" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Short Description</label>
            <textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm resize-none h-20" placeholder="A brief description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Price (USD) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" placeholder="49.99" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Brand ID</label>
              <input value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" placeholder="Optional brand ID" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-admin-primary text-xs disabled:opacity-50">
              {submitting ? <><Loader2 size={14} className="animate-spin mr-1" /> Creating...</> : <><Plus size={14} className="mr-1" /> Create Product</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function ProductStudio() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/v1/admin/products?${params}`);
      const json = await res.json();
      if (json.success) setProducts(json.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts, refreshKey]);

  const filtered = search.trim()
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/v1/admin/products/export?page=1");
      if (!res.ok) return;
      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `products-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    finally { setExporting(false); }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <CreateProductModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => setRefreshKey(k => k + 1)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">PRODUCT STUDIO</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Products</h1>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/feed-manager" className="btn-admin flex items-center gap-2 text-xs"><Upload size={15} /> Import CSV</Link>
          <button onClick={handleExport} disabled={exporting} className="btn-admin flex items-center gap-2 text-xs"><Download size={15} /> {exporting ? "Exporting..." : "Export"}</button>
          <button onClick={() => setShowCreate(true)} className="btn-admin-primary flex items-center gap-2 text-xs"><Plus size={15} /> New Product</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-3.5 text-[var(--admin-text-muted)]" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, brands..." className="input-admin w-full pl-12 text-sm py-3" />
        </div>
        <button className="btn-admin flex items-center gap-2 text-xs" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={15} /> Refresh</button>
        <button className="btn-admin flex items-center gap-2 text-xs"><Filter size={15} /> Filters</button>
        <div className="ml-auto flex items-center gap-2 border border-[var(--admin-border)] rounded-full overflow-hidden text-xs">
          <button onClick={() => setView("table")} className={`px-5 py-2 transition-all ${view === "table" ? "bg-[var(--admin-bg-active)] text-white" : "hover:bg-[var(--admin-bg-hover)]"}`}>Table</button>
          <button onClick={() => setView("grid")} className={`px-5 py-2 transition-all ${view === "grid" ? "bg-[var(--admin-bg-active)] text-white" : "hover:bg-[#1A1A1A]"}`}>Grid</button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="admin-card border border-[var(--admin-border)] py-20 text-center">
          <Loader2 size={24} className="animate-spin text-[var(--admin-accent)] mx-auto mb-4" />
          <p className="text-sm text-[var(--admin-text-secondary)]">Loading products...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="admin-card border border-[var(--admin-border)] py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--admin-bg-active)] flex items-center justify-center mx-auto mb-6">
            <Package size={28} className="text-[var(--admin-text-tertiary)]" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight mb-2">No products yet</h3>
          <p className="text-[var(--admin-text-secondary)] text-sm max-w-md mx-auto mb-8">
            Your product catalog is empty. Import via CSV or create your first product.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/admin/feed-manager" className="btn-admin-primary flex items-center gap-2 text-sm px-6 py-3"><Upload size={16} /> Import CSV</Link>
            <button onClick={() => setShowCreate(true)} className="btn-admin flex items-center gap-2 text-sm px-6 py-3"><Plus size={16} /> Add Manually</button>
          </div>
        </div>
      )}

      {/* Table View */}
      {!loading && filtered.length > 0 && view === "table" && (
        <div className="admin-card border border-[var(--admin-border)] overflow-x-auto">
          <table className="admin-table w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-[var(--admin-bg-elevated)]">
                <th className="w-8"><input type="checkbox" /></th>
                <th>Product</th>
                <th>Brand</th>
                <th>Universe</th>
                <th className="text-right">Price</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--admin-bg-hover)] cursor-pointer border-t border-[var(--admin-border)]">
                  <td className="pl-5"><input type="checkbox" /></td>
                  <td className="font-medium text-[var(--admin-text)]">{p.name}</td>
                  <td className="text-[var(--admin-text-secondary)]">{p.brand?.name || "—"}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded bg-[var(--admin-bg-active)]">{p.universe?.title || "—"}</span></td>
                  <td className="text-right tabular-nums font-medium">${p.price.toFixed(2)}</td>
                  <td><span className={`badge-admin ${p.status === "PUBLISHED" ? "badge-admin-success" : "badge-admin-neutral"}`}>{p.status}</span></td>
                  <td>★ {p.rating.toFixed(1)}</td>
                  <td className="text-xs text-[var(--admin-text-muted)]">{p._count?.reviews || 0}</td>
                  <td className="text-right pr-5 text-[var(--admin-text-muted)]">⋯</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="admin-card p-5 cursor-pointer hover:border-[var(--admin-accent)] transition-colors">
              <div className="h-28 bg-[var(--admin-bg-active)] rounded-xl mb-4 flex items-center justify-center text-[var(--admin-text-tertiary)] text-xs tracking-widest">IMAGE</div>
              <div className="font-medium text-sm leading-tight">{p.name}</div>
              <div className="text-xs text-[var(--admin-text-secondary)] mt-1">{p.brand?.name || "—"} • ${p.price.toFixed(2)}</div>
              <div className="flex gap-2 mt-3">
                <span className="badge-admin badge-admin-neutral text-[9px]">{p.status}</span>
                <span className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">★{p.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-6 text-xs text-[var(--admin-text-muted)] flex items-center gap-4 flex-wrap">
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""} of {products.length}
        </div>
      )}
    </div>
  );
}
