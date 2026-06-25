"use client";

import React, { useState } from "react";
import { Search, Plus, Download, Upload, Filter, Package } from "lucide-react";
import Link from "next/link";

export default function ProductStudio() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Products will load from the API. Currently no products — import CSV or create manually.
  const products: any[] = [];
  const filtered = search.trim()
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
      )
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">PRODUCT STUDIO</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Products</h1>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Manage your product catalog — import via CSV or add products manually.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/feed-manager" className="btn-admin flex items-center gap-2 text-xs"><Upload size={15} /> Import CSV</Link>
          <button onClick={handleExport} disabled={exporting} className="btn-admin flex items-center gap-2 text-xs"><Download size={15} /> {exporting ? "Exporting..." : "Export"}</button>
          <button className="btn-admin-primary flex items-center gap-2 text-xs"><Plus size={15} /> New Product</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-3.5 text-[var(--admin-text-muted)]" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, brands, SKUs, universes..."
            className="input-admin w-full pl-12 text-sm py-3"
          />
        </div>
        <button className="btn-admin flex items-center gap-2 text-xs"><Filter size={15} /> Filters</button>
        <div className="ml-auto flex items-center gap-2 border border-[var(--admin-border)] rounded-full overflow-hidden text-xs">
          <button onClick={() => setView("table")} className={`px-5 py-2 transition-all ${view === "table" ? "bg-[var(--admin-bg-active)] text-white" : "hover:bg-[var(--admin-bg-hover)]"}`}>Table</button>
          <button onClick={() => setView("grid")} className={`px-5 py-2 transition-all ${view === "grid" ? "bg-[var(--admin-bg-active)] text-white" : "hover:bg-[#1A1A1A]"}`}>Grid</button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="admin-card border border-[var(--admin-border)] py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--admin-bg-active)] flex items-center justify-center mx-auto mb-6">
            <Package size={28} className="text-[var(--admin-text-tertiary)]" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight mb-2">No products yet</h3>
          <p className="text-[var(--admin-text-secondary)] text-sm max-w-md mx-auto mb-8">
            Your product catalog is empty. Import products via CSV from the Feed Manager or create your first product.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/admin/feed-manager" className="btn-admin-primary flex items-center gap-2 text-sm px-6 py-3">
              <Upload size={16} /> Import CSV
            </Link>
            <button className="btn-admin flex items-center gap-2 text-sm px-6 py-3">
              <Plus size={16} /> Add Manually
            </button>
          </div>
        </div>
      )}

      {/* Table View */}
      {filtered.length > 0 && view === "table" && (
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
                <th>Affiliate</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--admin-bg-hover)] cursor-pointer border-t border-[var(--admin-border)]">
                  <td className="pl-5"><input type="checkbox" /></td>
                  <td className="font-medium text-[var(--admin-text)]">{p.name}</td>
                  <td className="text-[var(--admin-text-secondary)]">{p.brand}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded bg-[var(--admin-bg-active)]">{p.universe}</span></td>
                  <td className="text-right tabular-nums font-medium">${p.price}</td>
                  <td>
                    <span className={`badge-admin ${p.status === "PUBLISHED" ? "badge-admin-success" : "badge-admin-neutral"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>★ {p.rating}</td>
                  <td>
                    <span className={`badge-admin ${p.affiliateHealth === "HEALTHY" ? "badge-admin-success" : "badge-admin-warning"}`}>
                      {p.affiliateHealth}
                    </span>
                  </td>
                  <td className="text-right pr-5 text-[var(--admin-text-muted)]">⋯</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {filtered.slice(0, 16).map((p: any, i: number) => (
            <div key={i} className="admin-card p-5 cursor-pointer hover:border-[var(--admin-accent)] transition-colors">
              <div className="h-28 bg-[var(--admin-bg-active)] rounded-xl mb-4 flex items-center justify-center text-[var(--admin-text-tertiary)] text-xs tracking-widest">IMAGE</div>
              <div className="font-medium text-sm leading-tight">{p.name}</div>
              <div className="text-xs text-[var(--admin-text-secondary)] mt-1">{p.brand} • ${p.price}</div>
              <div className="flex gap-2 mt-3">
                <span className="badge-admin badge-admin-neutral text-[9px]">{p.status}</span>
                <span className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">★{p.rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-6 text-xs text-[var(--admin-text-muted)] flex items-center gap-4 flex-wrap">
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
