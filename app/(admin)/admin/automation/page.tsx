"use client";

import React from "react";

const rules = [
  { name: "Daily Affiliate Link Health Check", type: "Link validation", schedule: "Every day at 03:00", status: "active" },
  { name: "Weekly Price Monitoring", type: "Price alerts", schedule: "Mondays 09:00", status: "active" },
  { name: "Auto-generate SEO for new products", type: "AI workflow", schedule: "On publish", status: "active" },
  { name: "Monthly Recommendation Graph Refresh", type: "Graph", schedule: "1st of month", status: "paused" },
];

export default function AutomationCenter() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">AUTOMATION CENTER</div>
          <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Workflows &amp; Scheduled Jobs</h1>
        </div>
        <button className="btn-admin-primary text-xs">Create New Automation</button>
      </div>

      <div className="admin-card overflow-hidden border border-[var(--admin-border)] overflow-x-auto">
        <table className="admin-table w-full text-sm min-w-[820px]">
          <thead>
            <tr className="bg-[var(--admin-bg-elevated)]">
              <th>Rule</th>
              <th>Type</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Last Run</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={i} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                <td className="font-medium">{r.name}</td>
                <td className="text-[var(--admin-text-secondary)]">{r.type}</td>
                <td className="text-[var(--admin-text-secondary)]">{r.schedule}</td>
                <td><span className={`badge-admin ${r.status === "active" ? "badge-admin-success" : "badge-admin-warning"}`}>{r.status}</span></td>
                <td className="text-xs text-[var(--admin-text-muted)]">Today 03:12</td>
                <td className="text-right"><button className="text-xs text-[var(--admin-accent)]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[var(--admin-text-muted)]">All automations run via background job queue (BullMQ). Full logs in Activity Timeline. Queues, workers, and retry logic frozen.</div>
    </div>
  );
}

