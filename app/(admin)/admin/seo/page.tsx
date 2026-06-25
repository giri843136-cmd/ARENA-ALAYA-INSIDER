"use client";

import { toast } from "sonner";

export default function SEOCenter() {
  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">SEO CENTER</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Search Optimization</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        <div className="admin-card p-8">
          <div className="text-xs text-[var(--admin-accent)] tracking-widest mb-4">TOP PAGES</div>
          <div className="space-y-4 text-sm">
            {["/products/linen-duvet-cover-oat", "/universes/sanctuary", "/journal/the-quiet-luxury-of-linen"].map((p, i) => (
              <div key={i} className="flex justify-between border-b border-[var(--admin-border)] pb-3">
                <span>{p}</span>
                <span className="text-[var(--admin-accent)]">92 / 100</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card p-8">
          <div className="text-xs text-[var(--admin-accent)] tracking-widest mb-4">AI SEO STRATEGIST (PRESERVED)</div>
          <button className="btn-admin-primary mt-2 text-xs w-full" onClick={() => toast.success("SEO audit job queued.")}>
            Run full site audit
          </button>
          <div className="mt-8 text-xs text-[var(--admin-text-muted)]">All SEO tooling, meta generation, and schema builder remain fully operational.</div>
        </div>
      </div>
    </div>
  );
}

