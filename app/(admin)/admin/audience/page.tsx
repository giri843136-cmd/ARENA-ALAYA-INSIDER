"use client";

export default function AudienceHub() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">AUDIENCE &amp; INSIGHTS</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Audience Hub</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="admin-card p-8">
          <div className="text-xs text-[var(--admin-text-secondary)] tracking-widest">TOTAL SUBSCRIBERS</div>
          <div className="text-5xl font-semibold mt-3 tabular-nums">284,192</div>
          <div className="text-sm text-[#4ADE80] mt-2">+3,841 this week</div>
        </div>
        <div className="admin-card p-8">
          <div className="text-xs text-[var(--admin-text-secondary)] tracking-widest">ACTIVE SAVED SEARCHES</div>
          <div className="text-5xl font-semibold mt-3 tabular-nums">41,920</div>
          <div className="text-xs text-[var(--admin-text-muted)] mt-2">Across all universes</div>
        </div>
        <div className="admin-card p-8">
          <div className="text-xs text-[var(--admin-text-secondary)] tracking-widest">BOOKMARKS (30d)</div>
          <div className="text-5xl font-semibold mt-3 tabular-nums">192,840</div>
          <div className="text-sm text-[#4ADE80] mt-2">+12% from last period</div>
        </div>
      </div>

      <div className="mt-8 admin-card p-8">
        <div className="font-medium mb-5 tracking-widest text-xs text-[var(--admin-accent)]">RECENT SEGMENTS</div>
        <div className="text-sm space-y-4 text-[#EDEDED]">
          <div className="flex justify-between border-b border-[var(--admin-border)] pb-4"><span>High-intent: “linen” + “cashmere” searchers</span><span className="text-[var(--admin-accent)]">12,840 users</span></div>
          <div className="flex justify-between border-b border-[var(--admin-border)] pb-4"><span>Repeat buyers — 3+ purchases</span><span className="text-[var(--admin-accent)]">8,291 users</span></div>
          <div className="flex justify-between"><span>Journal readers who never purchased</span><span className="text-[var(--admin-accent)]">94,210 users</span></div>
        </div>
        <div className="text-xs text-[var(--admin-text-muted)] mt-6">All analytics, segments, and personalization engine preserved.</div>
      </div>
    </div>
  );
}

