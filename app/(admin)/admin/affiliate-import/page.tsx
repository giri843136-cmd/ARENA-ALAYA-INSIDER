"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload, Download, FileText, Loader2, CheckCircle, XCircle,
  AlertTriangle, Database, RefreshCw, Search, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

interface ImportPreview {
  name: string;
  brand: string;
  product: string;
  category: string;
  tags: string;
  variants: string;
  hasAffiliateLink: string;
  hasImage: string;
  price: string;
  status: string;
}

interface ImportResult {
  imported: number;
  matched: number;
  failed: number;
  total: number;
  fileName: string;
  categoriesLinked: number;
  tagsLinked: number;
  affiliateLinksCreated: number;
  mediaCreated: number;
  errors: { row: number; message: string; name: string }[];
}

interface HistoryItem {
  id: string;
  fileName: string;
  totalRows: number;
  newRows: number;
  matchedRows: number;
  failedRows: number;
  status: string;
  createdAt: string;
  errors: any;
}

const PRESETS = [
  { id: "alaya", name: "ALAYA Standard" },
  { id: "impact", name: "Impact Radius" },
  { id: "cj", name: "CJ Affiliate" },
  { id: "shareasale", name: "ShareASale" },
  { id: "amazon", name: "Amazon Associates" },
  { id: "walmart", name: "Walmart Affiliate" },
  { id: "shopify", name: "Shopify Export" },
];

export default function AffiliateImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState("alaya");
  const [preview, setPreview] = useState<ImportPreview[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setPreview(null);

    // Validate file type
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    // Show preview
    const formData = new FormData();
    formData.append("file", f);
    formData.append("preset", preset);

    try {
      const res = await fetch("/api/v1/admin/products/import/validate", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setPreview(json.data.preview);
        toast.success(`${json.data.totalRows} rows detected`);
      } else {
        toast.error(json.error?.message || "Validation failed");
      }
    } catch {
      toast.error("Failed to validate file");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("preset", preset);

    try {
      const res = await fetch("/api/v1/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        toast.success(`Imported ${json.data.imported} products`);
        loadHistory();
      } else {
        toast.error(json.error?.message || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/v1/admin/import-history");
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  }, []);

  const toggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory(!showHistory);
  };

  const totalStats = history.reduce(
    (s, h) => ({
      rows: s.rows + h.totalRows,
      new: s.new + h.newRows,
      failed: s.failed + h.failedRows,
    }),
    { rows: 0, new: 0, failed: 0 }
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Upload size={14} /> BULK IMPORT
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Affiliate &amp; Product Import</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Bulk upload products, affiliate links, and media via CSV. Supports multiple network formats.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleHistory} className="btn-admin text-xs">
              <Database size={14} /> Import History
            </button>
            <a href="/files/template.csv" download className="btn-admin text-xs">
              <Download size={14} /> Download Template
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Total Imports</div>
          <div className="text-3xl font-semibold tabular-nums mt-1">{history.length}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Total Rows</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[var(--admin-accent)]">{totalStats.rows}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">New Products</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#4ADE80]">{totalStats.new}</div>
        </div>
        <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
          <div className="text-xs text-[var(--admin-text-secondary)]">Failed Rows</div>
          <div className="text-3xl font-semibold tabular-nums mt-1 text-[#F87171]">{totalStats.failed}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-7">
          <div className="widget-title mb-4">IMPORT PRODUCTS</div>
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            {/* Preset selector */}
            <div className="mb-4">
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Import Format Preset</label>
              <select value={preset} onChange={(e) => setPreset(e.target.value)}
                className="input-admin w-full text-sm">
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* File upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--admin-border)] rounded-xl p-10 text-center cursor-pointer hover:border-[var(--admin-accent)]/50 transition-colors"
            >
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <Upload size={32} className="mx-auto mb-3 text-[var(--admin-text-muted)]" />
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {file ? file.name : "Drop a CSV file here or click to browse"}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Supports: product name, brand, price, affiliate URLs, categories, tags, variants
              </p>
            </div>

            {/* Import button */}
            {preview && (
              <div className="mt-4">
                <div className="flex items-center justify-between bg-[var(--admin-bg-subtle)] rounded-lg px-4 py-3 mb-3">
                  <div className="text-sm">
                    <span className="font-medium">{preview.length}</span> rows ready
                    <span className="text-[var(--admin-text-muted)] ml-2 text-xs">
                      ({preview.filter((p) => p.product.startsWith("✗")).length} new,{" "}
                      {preview.filter((p) => p.product.startsWith("✓")).length} updates)
                    </span>
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="btn-admin-primary text-xs"
                  >
                    {importing ? (
                      <><Loader2 size={14} className="animate-spin" /> Importing...</>
                    ) : (
                      <><Upload size={14} /> Start Import</>
                    )}
                  </button>
                </div>

                {/* Preview table */}
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="admin-table w-full text-xs">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Affiliate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((row, i) => (
                        <tr key={i} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                          <td className="max-w-[180px] truncate font-medium">{row.name}</td>
                          <td className="text-xs">{row.brand.startsWith("✓") ? row.brand : <span className="text-[#FBBF24]">{row.brand}</span>}</td>
                          <td className="text-xs">{row.product.startsWith("✓") ? <span className="text-[#4ADE80]">Update</span> : <span className="text-[#FBBF24]">New</span>}</td>
                          <td className="tabular-nums">{row.price}</td>
                          <td className="max-w-[120px] truncate">{row.category}</td>
                          <td className="text-center">{row.hasAffiliateLink}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 50 && (
                    <div className="text-center text-[10px] text-[var(--admin-text-muted)] py-2">
                      + {preview.length - 50} more rows
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Import result */}
            {result && (
              <div className={`mt-4 p-4 rounded-xl border ${
                result.failed > 0 ? "bg-[#FBBF24]/5 border-[#FBBF24]/20" : "bg-[#4ADE80]/5 border-[#4ADE80]/20"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {result.failed > 0 ? (
                    <AlertTriangle size={16} className="text-[#FBBF24]" />
                  ) : (
                    <CheckCircle size={16} className="text-[#4ADE80]" />
                  )}
                  <span className="font-medium text-sm">Import Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#4ADE80] font-semibold">{result.imported}</span> new</div>
                  <div><span className="text-[var(--admin-accent)] font-semibold">{result.matched}</span> updated</div>
                  <div><span className="text-[#F87171] font-semibold">{result.failed}</span> failed</div>
                  <div><span className="font-semibold">{result.categoriesLinked}</span> categories</div>
                  <div><span className="font-semibold">{result.tagsLinked}</span> tags</div>
                  <div><span className="font-semibold">{result.affiliateLinksCreated}</span> affiliate links</div>
                </div>
                {result.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-[10px] text-[#F87171] cursor-pointer">View {result.errors.length} errors</summary>
                    <div className="mt-2 space-y-1">
                      {result.errors.map((e, i) => (
                        <div key={i} className="text-[10px] text-[#F87171] bg-[#F87171]/5 px-2 py-1 rounded">
                          Row {e.row}: {e.name} — {e.message}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-5">
          <div className="widget-title mb-4">IMPORT GUIDE</div>
          <div className="space-y-3">
            <div className="admin-card p-5 border border-[var(--admin-border)]">
              <h4 className="font-medium text-sm mb-2">Supported Columns</h4>
              <div className="space-y-1 text-xs text-[var(--admin-text-secondary)]">
                {[
                  "name, slug, brand",
                  "price, salePrice, currency",
                  "sku, upc, asin, gtin",
                  "shortDescription, longDescription",
                  "category, universe, tags",
                  "benefits, pros, cons, perfectFor",
                  "imageUrl",
                  "affiliateUrl, affiliateNetwork, commissionRate",
                  "seoTitle, metaDescription",
                  "variantSkus, variantColors (pipe | delimited)",
                ].map((col, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ChevronDown size={10} className="text-[var(--admin-text-muted)]" />
                    <code className="text-[10px] text-[var(--admin-accent)]">{col}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card p-5 border border-[var(--admin-border)]">
              <h4 className="font-medium text-sm mb-2">Auto-Detection</h4>
              <ul className="space-y-1 text-xs text-[var(--admin-text-secondary)]">
                <li>• Brand auto-created if not found</li>
                <li>• Category auto-created from names</li>
                <li>• Tags auto-created from comma-separated values</li>
                <li>• Existing products updated by slug/SKU</li>
                <li>• Affiliate links linked to correct network</li>
                <li>• Variants created from pipe-delimited columns</li>
              </ul>
            </div>

            <div className="admin-card p-5 border border-[var(--admin-border)]">
              <h4 className="font-medium text-sm mb-2">Supported Networks</h4>
              <div className="flex flex-wrap gap-1.5">
                {["Amazon", "Walmart", "Impact", "CJ", "ShareASale", "Brand Direct"].map((net) => (
                  <span key={net} className="badge-admin badge-admin-neutral text-[10px]">{net}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import History */}
      {showHistory && (
        <div className="mt-8">
          <div className="widget-title mb-4 flex items-center justify-between">
            <span>IMPORT HISTORY</span>
            <button onClick={loadHistory} disabled={loadingHistory} className="btn-admin text-xs p-1">
              <RefreshCw size={12} className={loadingHistory ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-[var(--admin-text-muted)] text-sm">
                No import history yet
              </div>
            ) : (
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Total</th>
                    <th>New</th>
                    <th>Updated</th>
                    <th>Failed</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                      <td className="max-w-[200px] truncate text-sm">{h.fileName}</td>
                      <td className="tabular-nums text-xs">{h.totalRows}</td>
                      <td className="tabular-nums text-xs text-[#4ADE80]">{h.newRows}</td>
                      <td className="tabular-nums text-xs text-[var(--admin-accent)]">{h.matchedRows}</td>
                      <td className="tabular-nums text-xs text-[#F87171]">{h.failedRows}</td>
                      <td>
                        <span className={`badge-admin text-[10px] ${h.status === "completed" ? "badge-admin-success" : "badge-admin-warning"}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="text-xs text-[var(--admin-text-muted)]">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <AlertTriangle size={12} className="inline mr-1" />
        Imports are processed synchronously. For large files (&gt;1000 rows), consider using the API directly with batch processing.
      </div>
    </div>
  );
}
