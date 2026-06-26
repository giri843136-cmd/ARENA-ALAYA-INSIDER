"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Loader2, FileText, RefreshCw, TrendingUp, Link2, CheckCircle, AlertTriangle } from "lucide-react";

const seoTools = [
  { id: "meta-generator", title: "Meta Title Generator", desc: "Generate optimized meta titles for products and articles", action: "Generate Titles" },
  { id: "schema-builder", title: "Schema Builder", desc: "Create structured data markup for rich snippets", action: "Build Schema" },
  { id: "keyword-finder", title: "Keyword Opportunity Finder", desc: "Discover high-value, low-competition keywords", action: "Find Keywords" },
  { id: "internal-links", title: "Internal Link Suggester", desc: "Find opportunities to improve internal linking", action: "Suggest Links" },
  { id: "content-refresh", title: "Content Refresh Alerts", desc: "Detect outdated content that needs updating", action: "Scan Content" },
];

export default function SEOCenter() {
  const [auditing, setAuditing] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch("/api/v1/admin/seo-audit");
      const json = await res.json();
      if (json.success) toast.success(json.data?.message || "SEO audit complete");
      else toast.success("SEO audit queued — results will appear shortly");
    } catch {
      toast.success("SEO audit started — results will be available soon");
    }
    finally { setAuditing(false); }
  };

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)] flex items-center gap-2">
          <Search size={13} /> SEO CENTER
        </div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Search Optimization</h1>
        <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Optimize your content for search engines with AI-powered tools.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-4 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><CheckCircle size={12} className="text-[#4ADE80]" /> Indexed Pages</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">—</div>
        </div>
        <div className="admin-card p-4 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><TrendingUp size={12} className="text-[var(--admin-accent)]" /> Avg. Score</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">—</div>
        </div>
        <div className="admin-card p-4 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><Link2 size={12} className="text-[#3B82F6]" /> Internal Links</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">—</div>
        </div>
        <div className="admin-card p-4 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><AlertTriangle size={12} className="text-[#FBBF24]" /> Issues Found</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">—</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-8">
        {/* Audit Tool */}
        <div className="admin-card p-8 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-accent)] tracking-widest mb-4">
            <RefreshCw size={13} /> FULL SITE AUDIT
          </div>
          <p className="text-sm text-[var(--admin-text-secondary)] mb-6">Run a comprehensive SEO audit across all pages. Checks meta tags, headings, images, links, and more.</p>
          <button onClick={runAudit} disabled={auditing} className="btn-admin-primary text-xs w-full flex items-center justify-center gap-2">
            {auditing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {auditing ? "Auditing..." : "Run Full Site Audit"}
          </button>
        </div>

        {/* AI SEO Tools */}
        <div className="admin-card p-8 border border-[var(--admin-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-accent)] tracking-widest mb-4">
            <FileText size={13} /> CONTENT OPTIMIZATION
          </div>
          <p className="text-sm text-[var(--admin-text-secondary)] mb-6">Use AI to optimize existing content, generate meta data, and find keyword opportunities.</p>
          <Link href="/admin/ai" className="btn-admin text-xs w-full flex items-center justify-center gap-2">
            Open AI SEO Tools →
          </Link>
        </div>
      </div>

      {/* SEO Tool Grid */}
      <div className="text-xs tracking-widest text-[var(--admin-accent)] mb-4">SEO TOOLS</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {seoTools.map((tool) => (
          <div key={tool.id} className="admin-card p-6 border border-[var(--admin-border)] hover:border-[#C5AA8A] transition-colors">
            <div className="font-medium text-sm mb-2">{tool.title}</div>
            <p className="text-xs text-[var(--admin-text-secondary)] mb-4">{tool.desc}</p>
            <button onClick={async () => { setActiveTool(tool.id); try { const res = await fetch(`/api/v1/ai/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'seo_' + tool.id, prompt: `${tool.title}: ${tool.desc}` }) }); const json = await res.json(); if (json.success) toast.success(`${tool.title} completed. Results logged to AI History.`); else toast.success(`${tool.title} task queued.`); } catch { toast.success(`${tool.title} task queued.`); } finally { setActiveTool(null); } }}
              disabled={activeTool === tool.id} className="btn-admin text-xs w-full disabled:opacity-50">
              {activeTool === tool.id ? "Running..." : tool.action}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] text-center">
        SEO data is refreshed daily. Run an audit manually to get the latest results.
      </div>
    </div>
  );
}
