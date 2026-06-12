"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allCommands = [
  // Content
  { id: "product-studio", label: "Go to Product Studio", action: "/admin/products", category: "Content" },
  { id: "brand-vault", label: "Go to Brand Vault", action: "/admin/brands", category: "Content" },
  { id: "story-builder", label: "Open Story Builder", action: "/admin/story-builder", category: "Content" },
  { id: "new-product", label: "Create New Product", action: "/admin/products/new", category: "Content" },
  { id: "new-article", label: "Write New Article", action: "/admin/journal/new", category: "Content" },
  
  // Intelligence
  { id: "ai-workspace", label: "Open AI Workspace", action: "/admin/ai", category: "Intelligence" },
  { id: "seo-command", label: "Go to SEO Command", action: "/admin/seo", category: "Intelligence" },
  { id: "search-intel", label: "Search Intelligence", action: "/admin/search", category: "Intelligence" },
  { id: "recommendations", label: "Recommendation Engine", action: "/admin/recommendations", category: "Intelligence" },
  
  // System
  { id: "command-center", label: "Command Center", action: "/admin", category: "System" },
  { id: "revenue", label: "Revenue Intelligence", action: "/admin/revenue", category: "System" },
  { id: "security", label: "Security Center", action: "/admin/security", category: "System" },
  { id: "activity", label: "Activity & Audit Logs", action: "/admin/activity", category: "System" },
  
  // Quick Actions
  { id: "bulk-import", label: "Bulk Import Products (CSV)", action: "import", category: "Quick Actions" },
  { id: "generate-seo", label: "Run SEO Strategist on All", action: "ai-seo", category: "Quick Actions" },
  { id: "validate-links", label: "Validate All Affiliate Links", action: "validate-links", category: "Quick Actions" },
];

export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = search.trim()
    ? allCommands.filter(c => 
        c.label.toLowerCase().includes(search.toLowerCase()) || 
        c.category.toLowerCase().includes(search.toLowerCase())
      )
    : allCommands;

  const handleSelect = (item: typeof allCommands[0]) => {
    onOpenChange(false);
    setSearch("");

    if (item.action.startsWith("/")) {
      router.push(item.action);
    } else if (item.action === "import") {
      alert("CSV import modal would open here (demo)");
    } else if (item.action === "ai-seo") {
      alert("SEO Strategist AI job queued for all published content (demo)");
    } else if (item.action === "validate-links") {
      alert("Affiliate link validation job started (demo)");
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-[640px] px-4" onClick={e => e.stopPropagation()}>
        <Command className="command-admin overflow-hidden" shouldFilter={false}>
          <div className="flex items-center gap-3 border-b border-[#252525] px-5 py-4">
            <Search className="h-4 w-4 text-[#666]" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Jump to any section, product, article, or action..."
              className="flex-1 bg-transparent text-lg placeholder:text-[#666] outline-none"
              autoFocus
            />
            <div className="text-xs text-[#666]">ESC</div>
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-[#666]">No results for “{search}”</div>
            )}

            {filtered.map((item) => (
              <Command.Item
                key={item.id}
                onSelect={() => handleSelect(item)}
                className="flex items-center justify-between px-4 py-[13px] rounded-xl cursor-pointer hover:bg-[#1F1F1F] group"
              >
                <div className="flex items-center gap-3">
                  <span>{item.label}</span>
                  <span className="text-[10px] px-2 py-px rounded bg-[#1F1F1F] text-[#666]">{item.category}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-[#666] opacity-0 group-hover:opacity-100 transition" />
              </Command.Item>
            ))}
          </Command.List>

          <div className="border-t border-[#252525] px-5 py-3 text-[10px] text-[#666] flex justify-between">
            <div>⌘K to toggle • ↑↓ navigate • ↵ select</div>
            <div>ALAYA Admin</div>
          </div>
        </Command>
      </div>
    </div>
  );
}
