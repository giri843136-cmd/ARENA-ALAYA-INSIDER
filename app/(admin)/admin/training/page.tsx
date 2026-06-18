"use client";

import React, { useState } from "react";
import {
  BookOpen, Video, FileText, ExternalLink, Search, CheckCircle,
  GraduationCap, BookMarked, Lightbulb, Users, Bot, Shield,
  DollarSign, BarChart3, Package, Settings, ChevronDown
} from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  completed?: boolean;
  links: { label: string; url: string; type: "docs" | "guide" | "reference" }[];
}

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "admin-overview",
    title: "Admin Platform Overview",
    description: "Navigate the admin dashboard, understand the sidebar, and use the Command Palette (⌘K).",
    category: "Getting Started",
    icon: GraduationCap,
    duration: "10 min",
    level: "beginner",
    links: [
      { label: "Admin Guide (README)", url: "https://github.com/alayainsider/platform/blob/main/README-ADMIN.md", type: "docs" },
      { label: "Architecture Overview", url: "https://github.com/alayainsider/platform/blob/main/docs/ARCHITECTURE_OVERVIEW.md", type: "reference" },
    ],
  },
  {
    id: "product-studio",
    title: "Product Studio",
    description: "Create, edit, and manage products. Understand status workflow, affiliate linking, and bulk operations.",
    category: "Content",
    icon: Package,
    duration: "15 min",
    level: "beginner",
    links: [
      { label: "Product CMS Docs", url: "https://github.com/alayainsider/platform/blob/main/lib/backend/cms/productCMS.ts", type: "reference" },
      { label: "Bulk Import Guide", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/affiliate-import/page.tsx", type: "guide" },
    ],
  },
  {
    id: "ai-workspace",
    title: "AI Workspace & Automation",
    description: "Use the 8 AI tools (Content Architect, SEO Strategist, Trend Radar, etc.) and configure automation rules.",
    category: "Intelligence",
    icon: Bot,
    duration: "20 min",
    level: "intermediate",
    links: [
      { label: "AI Agent Overview", url: "https://github.com/alayainsider/platform/blob/main/lib/ai/agents/index.ts", type: "reference" },
      { label: "Automation Center", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/automation/page.tsx", type: "guide" },
    ],
  },
  {
    id: "revenue-intelligence",
    title: "Revenue Intelligence & Forecasting",
    description: "Understand revenue attribution, commission tracking, forecasting models, and the revenue dashboard.",
    category: "Revenue",
    icon: DollarSign,
    duration: "15 min",
    level: "intermediate",
    links: [
      { label: "Revenue Forecasting Service", url: "https://github.com/alayainsider/platform/blob/main/lib/analytics/services/revenueForecasting.ts", type: "reference" },
      { label: "Commission Splitting Guide", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/commission-split/page.tsx", type: "guide" },
    ],
  },
  {
    id: "affiliate-management",
    title: "Affiliate & Link Management",
    description: "Manage affiliate links, monitor link health, run automated scans, and use the best merchant selector.",
    category: "Revenue",
    icon: BarChart3,
    duration: "15 min",
    level: "intermediate",
    links: [
      { label: "Link Health Monitor", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/link-health/page.tsx", type: "guide" },
      { label: "Merchant Selector Engine", url: "https://github.com/alayainsider/platform/blob/main/lib/backend/affiliate/merchant-selector.ts", type: "reference" },
      { label: "Bulk Import Page", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/affiliate-import/page.tsx", type: "guide" },
    ],
  },
  {
    id: "security-center",
    title: "Security Center & Compliance",
    description: "Monitor security events, manage 2FA, audit logs, API keys, delegated access, and compliance checklists.",
    category: "System",
    icon: Shield,
    duration: "20 min",
    level: "advanced",
    links: [
      { label: "Security Dashboard", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/security/dashboard/page.tsx", type: "guide" },
      { label: "Security Operations Manual", url: "https://github.com/alayainsider/platform/blob/main/docs/security/SECURITY_OPERATIONS_MANUAL.md", type: "docs" },
      { label: "Gap Analysis", url: "https://github.com/alayainsider/platform/blob/main/docs/security/GAP_ANALYSIS.md", type: "reference" },
    ],
  },
  {
    id: "inventory-predictions",
    title: "Inventory & Predictive Analytics",
    description: "Use AI-powered inventory predictions, stockout forecasting, and reorder point recommendations.",
    category: "Intelligence",
    icon: Lightbulb,
    duration: "10 min",
    level: "intermediate",
    links: [
      { label: "Inventory Predictions Page", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/inventory/page.tsx", type: "guide" },
      { label: "Predictive Inventory Service", url: "https://github.com/alayainsider/platform/blob/main/lib/analytics/services/predictiveInventory.ts", type: "reference" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment & DevOps",
    description: "Trigger one-click deploys, monitor deploy history, and understand the production infrastructure.",
    category: "System",
    icon: Settings,
    duration: "10 min",
    level: "advanced",
    links: [
      { label: "One-Click Deploy Page", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/deploy/page.tsx", type: "guide" },
      { label: "Deployment Instructions", url: "https://github.com/alayainsider/platform/blob/main/DEPLOYMENT_INSTRUCTIONS.md", type: "docs" },
      { label: "Nginx Configuration", url: "https://github.com/alayainsider/platform/blob/main/nginx.conf", type: "reference" },
    ],
  },
  {
    id: "seo-content",
    title: "SEO & Content Optimization",
    description: "Use SEO audits, content ROI analysis, internal linking tools, and the editorial workflow.",
    category: "Content",
    icon: FileText,
    duration: "15 min",
    level: "intermediate",
    links: [
      { label: "SEO Command Center", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/seo/page.tsx", type: "guide" },
      { label: "Content ROI Page", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/content-roi/page.tsx", type: "guide" },
      { label: "Story Builder", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/story-builder/page.tsx", type: "guide" },
    ],
  },
  {
    id: "users-roles",
    title: "User Management & RBAC",
    description: "Manage users, roles, permissions, delegated access, and moderation workflows.",
    category: "System",
    icon: Users,
    duration: "15 min",
    level: "beginner",
    links: [
      { label: "Users Page", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/users/page.tsx", type: "guide" },
      { label: "RBAC Implementation", url: "https://github.com/alayainsider/platform/blob/main/lib/backend/security/admin-guard.ts", type: "reference" },
      { label: "Moderation Logs", url: "https://github.com/alayainsider/platform/blob/main/app/(admin)/admin/moderation-logs/page.tsx", type: "guide" },
    ],
  },
];

const CATEGORIES = ["All", "Getting Started", "Content", "Revenue", "Intelligence", "System"];

const LEVEL_BADGES: Record<string, string> = {
  beginner: "badge-admin-success",
  intermediate: "badge-admin-warning",
  advanced: "badge-admin-neutral",
};

export default function TrainingPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const filtered = TRAINING_MODULES.filter((m) => {
    const matchesSearch = search === "" ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || m.category === category;
    return matchesSearch && matchesCategory;
  });

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <BookOpen size={14} /> TRAINING & DOCUMENTATION
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Admin Training</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Learn to use every feature of the ALAYA INSIDER admin platform. {completed.size}/{TRAINING_MODULES.length} modules completed.
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {completed.size > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[var(--admin-text-secondary)] mb-1">
            <span>Training Progress</span>
            <span>{Math.round((completed.size / TRAINING_MODULES.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#C5A26F] transition-all duration-500"
              style={{ width: `${(completed.size / TRAINING_MODULES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="input-admin w-full pl-9 text-sm py-2"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                category === cat
                  ? "bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30"
                  : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-active)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((module) => {
          const isExpanded = expanded === module.id;
          const isCompleted = completed.has(module.id);
          const Icon = module.icon;

          return (
            <div
              key={module.id}
              className={`admin-card border border-[var(--admin-border)] transition-all ${
                isCompleted ? "ring-1 ring-[#4ADE80]/30" : ""
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? "bg-[#4ADE80]/10" : "bg-[var(--admin-bg-subtle)]"
                    }`}>
                      <Icon size={18} className={isCompleted ? "text-[#4ADE80]" : "text-[var(--admin-accent)]"} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{module.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--admin-text-muted)]">{module.duration}</span>
                        <span className={`badge-admin text-[9px] ${LEVEL_BADGES[module.level]}`}>
                          {module.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCompleted(module.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isCompleted ? "text-[#4ADE80] bg-[#4ADE80]/10" : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-active)]"
                    }`}
                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>

                <p className="text-xs text-[var(--admin-text-secondary)] mb-3 line-clamp-2">
                  {module.description}
                </p>

                {/* Resource links */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : module.id)}
                  className="flex items-center gap-1 text-[10px] text-[var(--admin-accent)] hover:underline"
                >
                  <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  {module.links.length} {module.links.length === 1 ? "resource" : "resources"}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-1.5 pl-4 border-l border-[var(--admin-border)]">
                    {module.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] transition-colors group"
                      >
                        {link.type === "docs" ? (
                          <BookMarked size={12} className="text-[var(--admin-text-muted)] group-hover:text-[var(--admin-accent)]" />
                        ) : link.type === "guide" ? (
                          <FileText size={12} className="text-[var(--admin-text-muted)]" />
                        ) : (
                          <Video size={12} className="text-[var(--admin-text-muted)]" />
                        )}
                        <span className="flex-1">{link.label}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[var(--admin-text-muted)]">
          <GraduationCap size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No training modules found</p>
          <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-xs text-[var(--admin-accent)] hover:underline mt-2">
            Clear filters
          </button>
        </div>
      )}

      {/* Documentation index */}
      <div className="mt-10">
        <div className="widget-title mb-4">REFERENCE DOCUMENTATION</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: "Admin Guide", href: "README-ADMIN.md", icon: BookOpen },
            { name: "Architecture", href: "docs/ARCHITECTURE_OVERVIEW.md", icon: BookOpen },
            { name: "Deployment Guide", href: "DEPLOYMENT_INSTRUCTIONS.md", icon: BookOpen },
            { name: "Security Manual", href: "docs/security/SECURITY_OPERATIONS_MANUAL.md", icon: Shield },
            { name: "Cloudflare Setup", href: "docs/infra/CLOUDFLARE_SETUP.md", icon: Shield },
            { name: "Compliance Checklist", href: "docs/security/COMPLIANCE_CHECKLIST.md", icon: Shield },
            { name: "Search Docs", href: "README-SEARCH.md", icon: BookOpen },
            { name: "Analytics Docs", href: "README-ANALYTICS.md", icon: BarChart3 },
          ].map((doc, i) => (
            <a
              key={i}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)] transition-colors text-xs text-[var(--admin-text-secondary)]"
            >
              <doc.icon size={14} className="text-[var(--admin-accent)] shrink-0" />
              <span className="truncate">{doc.name}</span>
              <ExternalLink size={10} className="shrink-0 ml-auto opacity-40" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        <GraduationCap size={12} className="inline mr-1" />
        Training modules link to source code, documentation, and admin pages. All documentation is maintained in the repository.
      </div>
    </div>
  );
}
