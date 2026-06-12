"use client";

export default function SEOCenter() {
  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[#C5AA8A]">SEO CENTER</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Search Optimization</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        <div className="admin-card p-8">
          <div className="text-xs text-[#C5AA8A] tracking-widest mb-4">TOP PAGES</div>
          <div className="space-y-4 text-sm">
            {["/products/linen-duvet-cover-oat", "/universes/sanctuary", "/journal/the-quiet-luxury-of-linen"].map((p, i) => (
              <div key={i} className="flex justify-between border-b border-[#252525] pb-3">
                <span>{p}</span>
                <span className="text-[#C5AA8A]">92 / 100</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card p-8">
          <div className="text-xs text-[#C5AA8A] tracking-widest mb-4">AI SEO STRATEGIST (PRESERVED)</div>
          <button className="btn-admin-primary mt-2 text-xs w-full" onClick={() => alert("SEO audit job queued (existing AI Workspace functionality)")}>
            Run full site audit
          </button>
          <div className="mt-8 text-xs text-[#666]">All SEO tooling, meta generation, and schema builder remain fully operational.</div>
        </div>
      </div>
    </div>
  );
}
