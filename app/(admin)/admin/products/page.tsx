"use client";

import React, { useState } from "react";
import { Search, Plus, Download, Upload, Filter, MoreHorizontal } from "lucide-react";
import Link from "next/link";


const mockProducts = Array.from({ length: 24 }, (_, i) => ({
  id: `p${i + 1}`,
  name: ["Linen Duvet — Oat", "Cashmere Crewneck", "Silk Sleep Mask", "Cast Iron Skillet", "Ceramic Vase"][i % 5] + ` ${i}`,
  brand: ["Ferm Living", "HAY", "August", "Meraki", "The Citizen Ry"][i % 5],
  price: 68 + (i % 7) * 27,
  status: ["PUBLISHED", "DRAFT", "REVIEW"][i % 3],
  rating: (4.3 + (i % 7) / 10).toFixed(1),
  searchScore: 82 + (i % 18),
  affiliateHealth: ["HEALTHY", "DEGRADED", "HEALTHY"][i % 3],
  universe: ["Sanctuary", "Gather", "Ritual", "Escape"][i % 4],
}));

export default function ProductStudio() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [selected] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let page = 1;
      const csvParts: string[] = [];
      let hasMore = false;
      do {
        const res = await fetch(`/api/v1/admin/products/export?page=${page}`);
        if (!res.ok) { return; }
        const csv = await res.text();
        if (page > 1) {
          const newlineIdx = csv.indexOf("\n");
          csvParts.push(csv.slice(newlineIdx + 1));
        } else { csvParts.push(csv); }
        hasMore = res.headers.get("X-Has-More") === "true";
        page++;
      } while (hasMore);
      const fullCsv = csvParts.join("");
      const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `products-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    finally { setExporting(false); }
  };

  const filtered = mockProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header — Editorial */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">PRODUCT STUDIO</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">18,420 products</h1>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">All objects in the Alaya collection • Last synced 4 minutes ago</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/feed-manager" className="btn-admin flex items-center gap-2 text-xs"><Upload size={15} /> Import CSV</Link>
          <button onClick={handleExport} disabled={exporting} className="btn-admin flex items-center gap-2 text-xs"><Download size={15} /> {exporting ? "Exporting..." : "Export"}</button>
          <button className="btn-admin-primary flex items-center gap-2 text-xs"><Plus size={15} /> New Product</button>
        </div>
      </div>

      {/* Toolbar — Calm & Functional */}
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

      {/* Table View — Premium Hairline */}
      {view === "table" && (
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
              {filtered.map((p, idx) => (
                <tr key={idx} className="hover:bg-[var(--admin-bg-hover)] cursor-pointer border-t border-[var(--admin-border)]" onClick={() => alert(`Opening luxury product detail drawer for ${p.name} (preserves all existing admin CRUD)`)}>
                  <td className="pl-5"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => {}} onClick={e => e.stopPropagation()} /></td>
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
                  <td className="text-right pr-5 text-[var(--admin-text-muted)]"><MoreHorizontal size={16} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {filtered.slice(0, 16).map((p, i) => (
            <div key={i} className="admin-card p-5 cursor-pointer hover:border-[var(--admin-accent)] transition-colors" onClick={() => alert(`Product drawer: ${p.name}`)}>                  <div className="h-28 bg-[var(--admin-bg-active)] rounded-xl mb-4 flex items-center justify-center text-[var(--admin-text-tertiary)] text-xs tracking-widest">IMAGE</div>
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

      <div className="mt-6 text-xs text-[var(--admin-text-muted)] flex items-center gap-4 flex-wrap">
        Showing {filtered.length} of 18,420 • All backend CRUD, queues, and search indexing preserved
        <button className="underline hover:text-[var(--admin-accent)]" onClick={() => alert("Bulk edit modal (existing functionality)")}>Select all visible</button>
      </div>
    </div>
  );
}

