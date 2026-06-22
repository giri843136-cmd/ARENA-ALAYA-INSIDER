"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Upload, Loader2, AlertTriangle,
  FileText, Download, Tags, FolderTree, Link2, Image,
  Eye, FileDown, CheckCircle, XCircle, Settings, Save, Trash2
} from "lucide-react";
import { toast } from "sonner";

interface ImportJob {
  id: string;
  fileName: string;
  totalRows: number;
  matchedRows: number;
  newRows: number;
  failedRows: number;
  errors?: { row: number; message: string; name: string }[];
  status: "processing" | "completed" | "failed";
  createdAt: string;
  categoriesLinked?: number;
  tagsLinked?: number;
  affiliateLinksCreated?: number;
  mediaCreated?: number;
}

interface PreviewRow {
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

interface Preset {
  id: string;
  name: string;
  network: string;
  description: string;
  columnCount: number;
}

interface SavedPreset {
  id: string;
  name: string;
  network: string;
  columns: Record<string, string>;
}

const STANDARD_FIELDS = [
  "name", "slug", "brand", "price", "salePrice", "currency",
  "sku", "upc", "asin", "gtin",
  "shortDescription", "longDescription",
  "availability", "status",
  "category", "universe", "tags",
  "benefits", "pros", "cons", "perfectFor",
  "imageUrl", "affiliateUrl", "affiliateNetwork", "commissionRate",
  "seoTitle", "metaDescription",
  "variantSkus", "variantColors", "variantSizes", "variantMaterials", "variantPriceAdjustments",
];

export default function FeedManager() {
  const [imports, setImports] = useState<ImportJob[]>([]);
  const [importsLoading, setImportsLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [selectedJobErrors, setSelectedJobErrors] = useState<{ row: number; message: string; name: string }[] | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [previewSummary, setPreviewSummary] = useState<any>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewCsvHeaders, setPreviewCsvHeaders] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("alaya");
  const [showMapper, setShowMapper] = useState(false);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [newPresetName, setNewPresetName] = useState("");

  // Move function declarations before useEffect to solve hoisting issue
  const loadImportHistory = async (search?: string, status?: string) => {
    setImportsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/v1/admin/import-history?${params}`);
      const j = await res.json();
      if (j.success) setImports(j.data);
    } catch {}
    finally { setImportsLoading(false); }
  };

  const loadSavedPresets = async () => {
    try {
      const res = await fetch("/api/v1/admin/import-presets");
      const j = await res.json();
      if (j.success) setSavedPresets(j.data);
    } catch {}
  };

  const clearHistory = async () => {
    if (!confirm("Clear all import history?")) return;
    try {
      await fetch("/api/v1/admin/import-history", { method: "DELETE" });
      setImports([]);
      toast.success("History cleared");
    } catch { toast.error("Failed to clear history"); }
  };

  const viewJobErrors = (job: ImportJob) => {
    if (job.errors && job.errors.length > 0) {
      setSelectedJobErrors(job.errors);
    } else {
      toast.info("No error details for this import");
    }
  };

  // Load presets + saved presets + import history on mount
  useEffect(() => {
    fetch("/api/v1/admin/products/import/presets")
      .then((r) => r.json())
      .then((j) => { if (j.success) setPresets(j.data); })
      .catch(() => {});
    loadSavedPresets();
    loadImportHistory();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setPreview(null);
    setPreviewSummary(null);
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    // Read first line to detect headers
    const text = await file.slice(0, 4096).text();
    const firstLine = text.split("\n")[0];
    const headers = firstLine.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
    setPreviewCsvHeaders(headers);

    // Auto-detect best preset
    try {
      const res = await fetch(`/api/v1/admin/products/import/presets?headers=${encodeURIComponent(headers.join(","))}`);
      const j = await res.json();
      if (j.success && j.recommended) {
        setSelectedPreset(j.recommended.id);
        toast.success(`Auto-detected: ${j.recommended.name} (${j.recommended.score}% match)`);
      }
    } catch {}

    setPreviewFile(file);
  }, []);

  const runPreview = useCallback(async (file: File, preset: string) => {
    setPreviewing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("preset", preset);
    try {
      const res = await fetch("/api/v1/admin/products/import/validate", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setPreview(json.data.preview);
        setPreviewSummary(json.data.summary);
      } else {
        toast.error(json.error?.message || "Preview failed");
      }
    } catch { toast.error("Preview request failed"); }
    finally { setPreviewing(false); }
  }, []);

  // Debounced history search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadImportHistory(historySearch || undefined, historyStatus || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [historySearch, historyStatus, historyRefresh]);

  useEffect(() => {
    if (previewFile) {
      runPreview(previewFile, selectedPreset);
    }
  }, [previewFile, selectedPreset, runPreview]);

  const doImport = async () => {
    if (!previewFile) return;
    setProcessing(true);
    const formData = new FormData();
    formData.append("file", previewFile);
    formData.append("preset", selectedPreset);
    try {
      const res = await fetch("/api/v1/admin/products/import", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        const summary = [
          d.imported > 0 && `${d.imported} new`,
          d.matched > 0 && `${d.matched} matched`,
          d.categoriesLinked > 0 && `${d.categoriesLinked} categories`,
          d.tagsLinked > 0 && `${d.tagsLinked} tags`,
          d.affiliateLinksCreated > 0 && `${d.affiliateLinksCreated} affiliate links`,
          d.mediaCreated > 0 && `${d.mediaCreated} images`,
        ].filter(Boolean).join(", ");
        toast.success(summary || "Import completed");
        // History will auto-reload via the useEffect watching historySearch/historyStatus
        // Trigger refresh by toggling a state
        setHistoryRefresh((n) => n + 1);
        setPreview(null);
        setPreviewSummary(null);
        setPreviewFile(null);
      } else {
        toast.error(json.error?.message || "Import failed");
      }
    } catch { toast.error("Import failed"); }
    finally { setProcessing(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let page = 1;
      const csvParts: string[] = [];
      let hasMore = false;
      do {
        const res = await fetch(`/api/v1/admin/products/export?page=${page}`);
        if (!res.ok) { toast.error("Export failed"); return; }
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
      toast.success("Export downloaded");
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  // Custom mapping editor
  const openMapper = () => {
    // Pre-fill from saved or built-in preset
    const sp = savedPresets.find((x) => x.id === selectedPreset);
    const bp = presets.find((x) => x.id === selectedPreset);
    // For built-in presets, we need the actual column definitions - use the description as fallback
    setCustomMapping(sp?.columns || {});
    setNewPresetName(bp?.name || sp?.name || "");
    setShowMapper(true);
  };

  const saveCustomPreset = async (): Promise<string | null> => {
    const name = newPresetName.trim() || `Custom ${Date.now()}`;
    try {
      const res = await fetch("/api/v1/admin/import-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, network: "CUSTOM", columns: customMapping }),
      });
      const j = await res.json();
      if (j.success) {
        toast.success(`Saved preset: ${name}`);
        setShowMapper(false);
        await loadSavedPresets();
        return j.data.id;
      } else {
        toast.error(j.error?.message || "Save failed");
        return null;
      }
    } catch { toast.error("Save failed"); return null; }
  };

  const applyCustomMapping = async () => {
    // Save to DB first so the import/validate API can look it up
    const id = await saveCustomPreset();
    if (id) {
      setSelectedPreset(id);
      setShowMapper(false);
      toast.success("Custom mapping applied");
    }
  };

  const deleteSavedPreset = async (id: string) => {
    try {
      await fetch(`/api/v1/admin/import-presets?id=${id}`, { method: "DELETE" });
      toast.success("Preset deleted");
      loadSavedPresets();
      if (selectedPreset === id) setSelectedPreset("alaya");
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Upload size={14} /> FEED MANAGER
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Bulk Product Import</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Import, preview, and export products via CSV with full entity resolution.</p>
          </div>
          <button onClick={handleExport} disabled={exporting} className="btn-admin text-xs flex items-center gap-1.5">
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
            {exporting ? "Exporting..." : "Export All CSV"}
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`admin-card p-12 text-center border-2 border-dashed transition-all cursor-pointer mb-8 ${
          dragging ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5" : "border-[var(--admin-border)]"
        }`}
      >
        <Upload size={40} className="mx-auto mb-4 text-[var(--admin-text-muted)]" />
        <h3 className="text-lg font-medium mb-2">Drop CSV file here, or click to browse</h3>
        <p className="text-sm text-[var(--admin-text-secondary)] mb-4">Auto-detects format • Brand, category, tag, variant, affiliate &amp; media resolution</p>

        {/* Preset Selector + Mapper Button */}
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <label className="text-xs text-[var(--admin-text-secondary)]">Column format:</label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="bg-[#111] border border-[#333] rounded px-3 py-1.5 text-xs text-white max-w-[220px]"
          >
            <optgroup label="Built-in">
              {presets.map((p) => (
                <option key={p.id} value={p.id} title={p.description}>
                  {p.name} ({p.columnCount} fields)
                </option>
              ))}
            </optgroup>
            {savedPresets.length > 0 && (
              <optgroup label="Saved">
                {savedPresets.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({Object.keys(sp.columns).length} fields)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <button onClick={openMapper} className="btn-admin text-xs flex items-center gap-1">
            <Settings size={12} /> Map Columns
          </button>
          {savedPresets.length > 0 && (
            <select
              onChange={(e) => { if (e.target.value) deleteSavedPreset(e.target.value); e.target.value = ""; }}
              className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-[10px] text-[#F87171]"
              defaultValue=""
            >
              <option value="" disabled>Delete saved...</option>
              {savedPresets.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          )}
        </div>

        <a href="/samples/product-import-template.csv" download className="btn-admin text-xs mb-4 inline-block">
          <Download size={12} /> Download Sample CSV Template
        </a>
        <div className="mt-3">
          <label className="btn-admin-primary text-xs cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleDrop({ preventDefault: () => {}, dataTransfer: { files: [file] } } as any);
            }} />
            Select File
          </label>
        </div>
        {(previewing || processing) && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[var(--admin-text-secondary)]">
            <Loader2 size={16} className="animate-spin" /> {previewing ? "Analyzing file..." : "Importing..."}
          </div>
        )}
      </div>

      {/* Custom Mapping Editor Modal */}
      {showMapper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMapper(false)}>
          <div className="admin-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Custom Column Mapping</h2>
              <button onClick={() => setShowMapper(false)} className="text-[var(--admin-text-muted)] hover:text-white text-sm">✕</button>
            </div>
            <p className="text-xs text-[var(--admin-text-secondary)] mb-4">Map your CSV columns to standard fields. Mappings are saved as a reusable preset.</p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {previewCsvHeaders.map((header) => (
                <div key={header} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-[var(--admin-accent)] w-40 truncate" title={header}>{header}</span>
                  <span className="text-[var(--admin-text-muted)]">→</span>
                  <select
                    value={customMapping[header] || ""}
                    onChange={(e) => setCustomMapping((prev) => ({ ...prev, [header]: e.target.value }))}
                    className="bg-[#111] border border-[#333] rounded px-2 py-1 text-xs text-white flex-1"
                  >
                    <option value="">— Skip this column —</option>
                    {STANDARD_FIELDS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {previewCsvHeaders.length === 0 && (
              <p className="text-sm text-[var(--admin-text-muted)] text-center py-8">Drop a CSV file first to see column names</p>
            )}

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--admin-border)]">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Save as preset name..."
                className="bg-[#111] border border-[#333] rounded px-3 py-1.5 text-xs text-white flex-1"
              />
              <button onClick={saveCustomPreset} className="btn-admin text-xs flex items-center gap-1">
                <Save size={12} /> Save Only
              </button>
              <button onClick={applyCustomMapping} className="btn-admin-primary text-xs">
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Preview */}
      {preview && previewSummary && !processing && (
        <div className="admin-card border border-[var(--admin-border)] mb-8 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[var(--admin-border)]">
            <div className="flex items-center justify-between mb-3">
              <div className="widget-title">VALIDATION PREVIEW</div>
              <div className="flex items-center gap-2">
                <button onClick={doImport} className="btn-admin-primary text-xs flex items-center gap-1.5">
                  <Upload size={12} /> Import {previewSummary.newProducts + previewSummary.updates} Products
                </button>
                <button onClick={() => { setPreview(null); setPreviewSummary(null); setPreviewFile(null); }}
                  className="btn-admin btn-admin-ghost text-xs">Cancel</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <CheckCircle size={11} className="text-[#4ADE80]" /> {previewSummary.updates} updates</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <XCircle size={11} className="text-[var(--admin-accent)]" /> {previewSummary.newProducts} new</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <Download size={11} className="text-[#3B82F6]" /> {previewSummary.newBrands} new brands</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <FolderTree size={11} className="text-[#8B5CF6]" /> {previewSummary.newCategories} new categories</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <Link2 size={11} /> {previewSummary.withAffiliateLinks} affiliate</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <Image size={11} /> {previewSummary.withImages} images</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A]">
                <Tags size={11} /> {previewSummary.withVariants} variants</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
            <table className="admin-table w-full min-w-[1000px] text-xs">
              <thead><tr className="sticky top-0 bg-[#0A0A0A]">
                <th>Product</th><th>Brand</th><th>Action</th><th>Category</th>
                <th>Tags</th><th>Variants</th><th>Affiliate</th><th>Image</th>
                <th className="text-right">Price</th><th>Status</th>
              </tr></thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-[var(--admin-border)]">
                    <td className="font-medium max-w-[160px] truncate" title={row.name}>{row.name}</td>
                    <td className={row.brand.startsWith("✓") ? "text-[#4ADE80]" : "text-[var(--admin-accent)]"}>{row.brand.replace("✓ ", "").replace("✗ ", "")}</td>
                    <td><span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${row.product.startsWith("✓") ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"}`}>{row.product.startsWith("✓") ? "Update" : "Create"}</span></td>
                    <td className="text-[var(--admin-text-secondary)]">{row.category}</td>
                    <td className="text-[var(--admin-text-secondary)] max-w-[120px] truncate" title={row.tags}>{row.tags}</td>
                    <td className="text-[var(--admin-text-secondary)] max-w-[100px] truncate" title={row.variants}>{row.variants}</td>
                    <td className="text-center">{row.hasAffiliateLink}</td>
                    <td className="text-center">{row.hasImage}</td>
                    <td className="text-right tabular-nums">${row.price}</td>
                    <td><span className={`badge-admin text-[10px] ${row.status === "PUBLISHED" ? "badge-admin-success" : "badge-admin-neutral"}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import History */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
        <div className="widget-title px-6 pt-6 flex items-center justify-between">
          <span>IMPORT HISTORY</span>
          <div className="flex items-center gap-2">
            {imports.length > 0 && (
              <button onClick={clearHistory} className="btn-admin text-[10px] px-2 py-1 flex items-center gap-1">
                <Trash2 size={10} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search by filename..."
            className="bg-[#111] border border-[#333] rounded px-3 py-1.5 text-xs text-white flex-1 max-w-xs"
          />
          <select
            value={historyStatus}
            onChange={(e) => setHistoryStatus(e.target.value)}
            className="bg-[#111] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
        </div>

        {importsLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--admin-text-muted)]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : imports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--admin-text-muted)]">
            <FileText size={32} className="mb-3 opacity-50" /><p className="text-sm">No imports yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-[1100px]">
              <thead><tr>
                <th>File</th><th className="text-right">Rows</th><th className="text-right">New</th>
                <th className="text-right">Matched</th><th className="text-right">Failed</th>
                <th className="text-right" title="Categories"><FolderTree size={12} className="inline" /></th>
                <th className="text-right" title="Tags"><Tags size={12} className="inline" /></th>
                <th className="text-right" title="Affiliate links"><Link2 size={12} className="inline" /></th>
                <th className="text-right" title="Media"><Image size={12} className="inline" /></th>
                <th>Status</th><th>Date</th><th></th>
              </tr></thead>
              <tbody>
                {imports.map((job) => (
                  <tr key={job.id} className="border-t border-[var(--admin-border)]">
                    <td className="font-medium text-sm max-w-[180px] truncate" title={job.fileName}>{job.fileName}</td>
                    <td className="text-right tabular-nums text-[var(--admin-text-secondary)]">{job.totalRows}</td>
                    <td className="text-right tabular-nums text-[var(--admin-accent)]">{job.newRows}</td>
                    <td className="text-right tabular-nums text-[#4ADE80]">{job.matchedRows}</td>
                    <td className="text-right">
                      {job.failedRows > 0 ? (
                        <button onClick={() => viewJobErrors(job)} className="tabular-nums text-[#F87171] underline hover:no-underline cursor-pointer">{job.failedRows}</button>
                      ) : (
                        <span className="tabular-nums text-[var(--admin-text-secondary)]">0</span>
                      )}
                    </td>
                    <td className="text-right tabular-nums text-[var(--admin-text-secondary)]">{job.categoriesLinked || "—"}</td>
                    <td className="text-right tabular-nums text-[var(--admin-text-secondary)]">{job.tagsLinked || "—"}</td>
                    <td className="text-right tabular-nums text-[var(--admin-text-secondary)]">{job.affiliateLinksCreated || "—"}</td>
                    <td className="text-right tabular-nums text-[var(--admin-text-secondary)]">{job.mediaCreated || "—"}</td>
                    <td><span className={`badge-admin text-[10px] ${job.status === "completed" ? "badge-admin-success" : job.status === "processing" ? "badge-admin-warning" : "badge-admin-error"}`}>{job.status}</span></td>
                    <td className="text-xs text-[var(--admin-text-muted)] whitespace-nowrap">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      {job.failedRows > 0 && (
                        <button onClick={() => viewJobErrors(job)} className="text-[#F87171] text-[10px] underline">Errors</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error Details Modal */}
      {selectedJobErrors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedJobErrors(null)}>
          <div className="admin-card p-6 max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Row-Level Errors</h2>
              <button onClick={() => setSelectedJobErrors(null)} className="text-[var(--admin-text-muted)] hover:text-white text-sm">✕</button>
            </div>
            <div className="space-y-2">
              {selectedJobErrors.map((err, i) => (
                <div key={i} className="bg-[#1A1A1A] rounded p-3 text-xs border border-[#333]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#F87171] font-medium">Row {err.row}</span>
                    <span className="text-[var(--admin-text-secondary)]">—</span>
                    <span className="text-[var(--admin-text)] font-medium">{err.name}</span>
                  </div>
                  <code className="text-[var(--admin-text-muted)] block mt-1">{err.message}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-start gap-4 flex-wrap">
        <span className="flex items-center gap-1"><FolderTree size={11} /> Categories auto-created</span>
        <span className="flex items-center gap-1"><Tags size={11} /> Tags auto-created</span>
        <span className="flex items-center gap-1"><Link2 size={11} /> Affiliate links created</span>
        <span className="flex items-center gap-1"><Image size={11} /> Media &amp; variants created</span>
        <span className="flex items-center gap-1"><Settings size={11} /> Custom column mapping</span>
        <span className="flex items-center gap-1"><Save size={11} /> Save &amp; reuse presets</span>
        <span className="flex items-center gap-1"><Eye size={11} /> Auto-detect format</span>
        <span className="flex items-center gap-1"><AlertTriangle size={11} /> Matched by SKU/UPC/ASIN</span>
      </div>
    </div>
  );
}
