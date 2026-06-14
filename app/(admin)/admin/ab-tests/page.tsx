"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical, Plus, ChevronLeft, ChevronRight, RefreshCw,
  Search, ToggleLeft, ToggleRight, BarChart3, Users, Eye, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface AbTest {
  id: string;
  name: string;
  hypothesis: string | null;
  featureFlagId: string | null;
  variants: any;
  status: string;
  results: any[];
  createdAt: string;
  featureFlag: { key: string; enabled: boolean } | null;
}

export default function AbTestManager() {
  const [tests, setTests] = useState<AbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newTest, setNewTest] = useState({ name: "", hypothesis: "", variants: "control,variant_a" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (search.trim()) params.set("search", search.trim());
        const res = await fetch(`/api/v1/admin/ab-tests?${params}`);
        const json = await res.json();
        if (json.success && !cancelled) {
          setTests(json.data);
          setTotalPages(Math.ceil((json.pagination?.total || 1) / 20));
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [page, search, refreshKey]);

  const createTest = async () => {
    if (!newTest.name.trim() || !newTest.variants.trim()) {
      toast.error("Name and variants are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/v1/admin/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTest.name.trim(),
          hypothesis: newTest.hypothesis.trim() || undefined,
          variants: newTest.variants.split(",").map((v) => v.trim()),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("A/B test created");
        setShowCreateModal(false);
        setNewTest({ name: "", hypothesis: "", variants: "control,variant_a" });
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(json.error?.message || "Failed to create test");
      }
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <FlaskConical size={14} /> EXPERIMENTATION
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">A/B Tests</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Run experiments on content, pricing, and layouts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
            <button onClick={() => setShowCreateModal(true)} className="btn-admin-primary text-xs"><Plus size={14} /> New Test</button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tests..." className="input-admin w-full pl-10" />
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading tests...</span>
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
          <FlaskConical size={32} className="mb-3 opacity-50" />
          <p className="text-sm">No A/B tests found</p>
          <button onClick={() => setShowCreateModal(true)} className="text-xs text-[var(--admin-accent)] hover:underline mt-2">Create your first test</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <div key={test.id} className="admin-card p-6 border border-[var(--admin-border)] hover:border-[var(--admin-accent)]/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-lg tracking-tight">{test.name}</h3>
                <span className={`badge-admin text-[10px] ${test.status === "ACTIVE" ? "badge-admin-success" : "badge-admin-neutral"}`}>
                  {test.status || "DRAFT"}
                </span>
              </div>
              {test.hypothesis && (
                <p className="text-sm text-[var(--admin-text-secondary)] mb-4 line-clamp-2">{test.hypothesis}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-[var(--admin-text-muted)] mb-4">
                <span className="flex items-center gap-1"><BarChart3 size={12} /> {test.variants?.length || 0} variants</span>
                <span className="flex items-center gap-1"><Users size={12} /> {test.results?.length || 0} results</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-admin text-xs flex-1"><Eye size={12} /> View Results</button>
                {test.status === "ACTIVE" ? (
                  <button className="btn-admin text-xs text-[#F87171]"><ToggleRight size={14} /> Stop</button>
                ) : (
                  <button className="btn-admin text-xs text-[#4ADE80]"><ToggleLeft size={14} /> Activate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-[var(--admin-text-muted)]">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30"><ChevronLeft size={14} /> Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={() => setShowCreateModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161616] border border-[var(--admin-border)] rounded-xl p-6 z-[10000] w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">New A/B Test</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Test Name *</label>
                <input value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="e.g. Homepage Hero CTA" className="input-admin w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Hypothesis</label>
                <textarea value={newTest.hypothesis} onChange={(e) => setNewTest({ ...newTest, hypothesis: e.target.value })}
                  placeholder="e.g. Changing CTA from 'Shop' to 'Discover' will increase click-through rate by 15%"
                  className="input-admin w-full h-24 resize-y" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Variants (comma-separated) *</label>
                <input value={newTest.variants} onChange={(e) => setNewTest({ ...newTest, variants: e.target.value })}
                  placeholder="control,variant_a,variant_b" className="input-admin w-full" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-admin btn-admin-ghost text-xs">Cancel</button>
              <button onClick={createTest} disabled={creating} className="btn-admin-primary text-xs">
                {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Test"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">All tests are logged to activity audit trail.</div>
    </div>
  );
}
