"use client";

import Link from "next/link";
import { toast } from "sonner";

export default function JournalAdmin() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">INSIDER JOURNAL</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">102 published • 14 in review • 3 scheduled</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Stats */}
        <div className="admin-card p-7">
          <div className="text-xs text-[var(--admin-accent)] tracking-widest mb-1">THIS MONTH</div>
          <div className="text-4xl font-semibold">14</div>
          <div className="text-sm text-[var(--admin-text-secondary)]">New essays published</div>
          <div className="mt-6 text-xs">+41% from last month</div>
        </div>

        <div className="lg:col-span-2 admin-card p-7">
          <div className="flex justify-between mb-5">
            <div>
              <div className="text-xs text-[var(--admin-accent)] tracking-widest">STORY BUILDER</div>
              <div className="font-medium text-lg">Create beautiful long-form content</div>
            </div>
            <button className="btn-admin-primary text-xs" onClick={() => toast.success("Story Builder ready for new essay.")}>New Essay</button>
          </div>
          <div className="text-sm text-[var(--admin-text-secondary)]">All existing Story Builder, AI content tools, and publishing workflow remain fully intact.</div>
        </div>
      </div>

      <div className="admin-card p-6 mt-6">
        <div className="text-xs tracking-widest text-[var(--admin-accent)] mb-4">RECENT ESSAYS</div>
        <div className="space-y-3 text-sm">
          {["The Quiet Luxury of Linen", "Why We’re Obsessed With Cast Iron", "The Ritual of Morning Light"].map((title, i) => (
            <div key={i} className="flex justify-between border-b border-[var(--admin-border)] pb-3 last:border-none items-center">
              <span>{title}</span>
              <span className="text-xs text-[var(--admin-text-muted)]">Published • 12k readers</span>
            </div>
          ))}
        </div>
        <Link href="/journal" className="text-xs text-[var(--admin-accent)] mt-4 block">View public journal →</Link>
      </div>
    </div>
  );
}


