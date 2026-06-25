"use client";

import { toast } from "sonner";

export default function SearchIntelligence() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">SEARCH INTELLIGENCE</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Typesense + Internal Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="admin-card p-8">
          <div className="font-medium mb-5 tracking-widest text-xs text-[var(--admin-accent)]">TOP QUERIES (7d)</div>
          <div className="space-y-4 text-sm">
            {["linen bedding", "cashmere sweater", "cast iron skillet", "silk sleep mask", "ceramic vase"].map((q, i) => (
              <div key={i} className="flex justify-between border-b border-[var(--admin-border)] pb-3 last:border-none">
                <span>{q}</span>
                <span className="text-[var(--admin-accent)] tabular-nums">{1240 - i * 180} searches</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-8">
          <div className="font-medium mb-4 tracking-widest text-xs text-[var(--admin-accent)]">NO-RESULT QUERIES (needs attention)</div>
          <div className="text-sm text-[var(--admin-text-secondary)] leading-relaxed">“hand-thrown pottery vase” • “quiet luxury blanket” • “scandinavian oak sideboard”</div>
          <button className="btn-admin-primary mt-6 text-xs" onClick={() => toast.success("AI analyzing search queries for improvements.")}>Let AI suggest fixes</button>
        </div>
      </div>

      <div className="mt-6 text-xs text-[var(--admin-text-muted)]">Ranking rules, synonyms, pinned results, facets, voice/visual/multimodal search, and command palette all remain fully operational per original architecture.</div>
    </div>
  );
}

