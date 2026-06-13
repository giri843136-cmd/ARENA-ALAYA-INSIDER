"use client";

import React from "react";

const logs = Array.from({ length: 18 }, (_, i) => ({
  time: `${10 - Math.floor(i / 3)}:${(i * 7) % 60}`.padStart(5, "0"),
  user: ["Elena Voss", "Margot Hale", "System", "Sofia Laurent"][i % 4],
  action: [
    "Published article", "Updated product pricing", "Ran affiliate validation", 
    "Generated 47 meta descriptions", "Approved review", "Refreshed recommendation graph"
  ][i % 6],
  entity: ["The Quiet Luxury of Linen", "Cashmere Crewneck", "All affiliate links", "212 products", "Review #1847", "18,420 products"][i % 6],
}));

export default function ActivityTimeline() {
  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">AUDIT &amp; ACTIVITY</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Activity Timeline</h1>
        </div>
        <button className="btn-admin text-xs">Export CSV</button>
      </div>

      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        <table className="admin-table w-full text-sm min-w-[880px]">
          <thead>
            <tr className="bg-[var(--admin-bg-elevated)]">
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                <td className="font-mono text-[var(--admin-text-secondary)] text-xs">{log.time}</td>
                <td className="font-medium">{log.user}</td>
                <td>{log.action}</td>
                <td className="text-[var(--admin-text-secondary)]">{log.entity}</td>
                <td className="text-right text-xs text-[var(--admin-text-muted)]">View diff →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[var(--admin-text-muted)]">All actions are immutable. Full audit trail retained for 7 years. Backend logs &amp; queues untouched.</div>
    </div>
  );
}

