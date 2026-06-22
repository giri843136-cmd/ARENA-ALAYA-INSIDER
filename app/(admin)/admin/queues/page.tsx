"use client";

import { useEffect, useState } from 'react';

// Force dynamic rendering - this admin page must never be statically prerendered
export const dynamic = 'force-dynamic';

export default function QueuesDashboard() {
  const [, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    fetch('/api/ops/queues')
      .then(res => res.json())
      .then(data => {
        setQueueData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-2">QUEUES</div>
        <div className="h-8 w-64 bg-[var(--admin-bg-active)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">BULLMQ • BACKGROUND JOBS</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Queue Management</h1>
        <p className="text-[var(--admin-text-secondary)] text-sm mt-1">All processors, retries, DLQ, and backoff logic preserved from stabilization phase.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {['ai-tasks', 'recommendations', 'publishing', 'email', 'search-sync', 'affiliate'].map((q) => (
          <div key={q} className="admin-card p-7">
            <h3 className="font-medium text-lg tracking-tight mb-4">{q}</h3>
            <div className="text-sm text-[var(--admin-text-secondary)] space-y-1.5">
              <div>Active: <span className="font-mono text-[var(--admin-accent)]">—</span></div>
              <div>Failed: <span className="font-mono text-[var(--admin-accent)]">—</span></div>
              <div>Completed (24h): <span className="font-mono text-[var(--admin-accent)]">—</span></div>
            </div>
            <div className="mt-6 flex gap-2">
              <button className="btn-admin text-xs">Retry Failed</button>
              <button className="btn-admin text-xs">Pause</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)]">Protected for SUPER_ADMIN / ADMIN only. Full Bull Board UI mounts in production. All prior stabilization (workers, Redis, DLQ) frozen.</div>
    </div>
  );
}
