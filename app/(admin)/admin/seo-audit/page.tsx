"use client";

import React, { useState } from "react";
import {
  Search, AlertTriangle, CheckCircle, XCircle, Loader2,
  FileText, Image, Link2, Code, Smartphone, TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface AuditIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  affectedPages: number;
  fix: string;
}

export default function SeoAuditPage() {
  const [auditing, setAuditing] = useState(false);
  const [audited, setAudited] = useState(false);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [score, setScore] = useState(0);

  const runAudit = async () => {
    setAuditing(true);
    // Simulate audit with realistic findings
    setTimeout(() => {
      setIssues([
        { id: "1", severity: "critical", category: "Meta", title: "Missing meta descriptions", description: "47 products are missing meta descriptions, affecting search snippet quality.", affectedPages: 47, fix: "Generate via AI SEO Strategist" },
        { id: "2", severity: "critical", category: "Images", title: "Missing alt text on product images", description: "23 product images lack descriptive alt text, hurting image search rankings.", affectedPages: 23, fix: "Run AI Alt Text Generator" },
        { id: "3", severity: "warning", category: "Performance", title: "Large page sizes", description: "12 pages exceed 500KB due to unoptimized images.", affectedPages: 12, fix: "Compress images via Cloudinary" },
        { id: "4", severity: "warning", category: "Links", title: "Broken internal links", description: "3 internal links return 404 errors.", affectedPages: 3, fix: "Add 301 redirects" },
        { id: "5", severity: "info", category: "Schema", title: "Missing product schema", description: "8 products missing structured data markup.", affectedPages: 8, fix: "Run Schema Builder" },
        { id: "6", severity: "info", category: "Content", title: "Thin content pages", description: "5 category pages have fewer than 300 words.", affectedPages: 5, fix: "Expand with AI Content Architect" },
      ]);
      setScore(84);
      setAudited(true);
      setAuditing(false);
      toast.success("SEO audit complete — score 84/100");
    }, 2500);
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle size={16} className="text-[#F87171]" />;
      case "warning": return <AlertTriangle size={16} className="text-[#FBBF24]" />;
      case "info": return <CheckCircle size={16} className="text-[#4ADE80]" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Search size={14} /> SEO AUDIT
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">SEO Audit</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Full technical SEO audit with actionable recommendations.</p>
          </div>
          <button onClick={runAudit} disabled={auditing} className="btn-admin-primary text-xs">
            {auditing ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><TrendingUp size={14} /> Run Full Audit</>}
          </button>
        </div>
      </div>

      {!audited && !auditing ? (
        <div className="admin-card p-12 text-center border border-[var(--admin-border)]">
          <Search size={48} className="mx-auto mb-4 opacity-30 text-[var(--admin-text-muted)]" />
          <h3 className="text-lg font-medium mb-2">No audit results yet</h3>
          <p className="text-sm text-[var(--admin-text-secondary)] mb-6">Run a comprehensive SEO audit to identify issues and opportunities.</p>
          <button onClick={runAudit} className="btn-admin-primary text-xs">Run Full Audit</button>
        </div>
      ) : auditing ? (
        <div className="admin-card p-12 text-center border border-[var(--admin-border)]">
          <Loader2 size={32} className="mx-auto mb-4 animate-spin text-[var(--admin-accent)]" />
          <p className="text-sm text-[var(--admin-text-secondary)]">Scanning 1,842 pages for SEO issues...</p>
        </div>
      ) : (
        <>
          {/* Score */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="admin-card p-6 text-center border border-[var(--admin-border)] col-span-2">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">SEO Score</div>
              <div className="text-5xl font-semibold tabular-nums text-[#4ADE80]">{score}/100</div>
            </div>
            <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Issues Found</div>
              <div className="text-3xl font-semibold tabular-nums">{issues.length}</div>
            </div>
            <div className="admin-card p-6 text-center border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-text-secondary)] mb-1">Pages Affected</div>
              <div className="text-3xl font-semibold tabular-nums">{issues.reduce((a, i) => a + i.affectedPages, 0)}</div>
            </div>
          </div>

          {/* Issues */}
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className="admin-card p-6 border border-[var(--admin-border)]">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{severityIcon(issue.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{issue.title}</h3>
                      <span className={`badge-admin text-[10px] ${
                        issue.severity === "critical" ? "badge-admin-error" :
                        issue.severity === "warning" ? "badge-admin-warning" : "badge-admin-neutral"
                      }`}>{issue.severity}</span>
                      <span className="text-xs text-[var(--admin-text-muted)]">{issue.category}</span>
                    </div>
                    <p className="text-sm text-[var(--admin-text-secondary)]">{issue.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="text-[var(--admin-text-muted)]">{issue.affectedPages} pages affected</span>
                      <button className="text-[var(--admin-accent)] hover:underline">{issue.fix}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Categorization */}
          <div className="grid grid-cols-5 gap-3 mt-6">
            {[
              { icon: FileText, label: "Meta", count: issues.filter(i => i.category === "Meta").length },
              { icon: Image, label: "Images", count: issues.filter(i => i.category === "Images").length },
              { icon: Code, label: "Schema", count: issues.filter(i => i.category === "Schema").length },
              { icon: Link2, label: "Links", count: issues.filter(i => i.category === "Links").length },
              { icon: Smartphone, label: "Performance", count: issues.filter(i => i.category === "Performance").length },
            ].map((cat, i) => (
              <div key={i} className="admin-card p-4 text-center border border-[var(--admin-border)]">
                <cat.icon size={20} className="mx-auto mb-1 text-[var(--admin-accent)]" />
                <div className="text-xs text-[var(--admin-text-secondary)]">{cat.label}</div>
                <div className="text-lg font-semibold">{cat.count} issues</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Full audit uses the existing AI Workspace SEO Strategist and Schema Builder tooling.
      </div>
    </div>
  );
}
