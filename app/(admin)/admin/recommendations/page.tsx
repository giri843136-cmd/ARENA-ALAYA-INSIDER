"use client";

export default function RecommendationEngine() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">RECOMMENDATION ENGINE</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Graph + Personalization</h1>
      </div>

      <div className="admin-card p-8 mb-6">
        <div className="font-medium mb-5 tracking-widest text-xs text-[var(--admin-accent)]">CURRENT GRAPH STATS</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 text-sm">
          <div><span className="block text-3xl font-semibold tabular-nums">18,420</span> products connected</div>
          <div><span className="block text-3xl font-semibold tabular-nums">1.24m</span> co-view edges</div>
          <div><span className="block text-3xl font-semibold tabular-nums">84k</span> editorial relationships</div>
          <div>Last full refresh: <span className="text-[var(--admin-accent)]">Today 04:11</span></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-admin-primary" onClick={() => alert("Recommendation graph refresh job queued (demo — all existing recs & AI preserved)")}>
          Force Full Graph Refresh
        </button>
        <button className="btn-admin" onClick={() => alert("Personalization preview opened (demo)")}>Preview for Current User</button>
      </div>

      <div className="mt-6 text-xs text-[var(--admin-text-muted)]">All recommendation services, Typesense, and AI Workspace integrations remain fully functional.</div>
    </div>
  );
}

