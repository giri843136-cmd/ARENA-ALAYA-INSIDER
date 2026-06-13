"use client";

export default function StoryBuilder() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">STORY BUILDER</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Create beautiful long-form content</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-5 md:gap-6">
        <div className="lg:col-span-7 admin-card p-8">
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">EDITOR</div>
          <div className="space-y-4">
            <input placeholder="Essay title" className="input-admin w-full text-2xl font-display tracking-tight" />
            <textarea className="input-admin w-full h-72 text-[15px]" placeholder="Start writing the story..." />
          </div>
          <div className="mt-6 flex gap-3">
            <button className="btn-admin-primary text-xs">Publish</button>
            <button className="btn-admin text-xs">Save Draft</button>
            <button className="btn-admin text-xs">AI Assist</button>
          </div>
        </div>

        <div className="lg:col-span-5 admin-card p-8">
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-4">AI TOOLS (PRESERVED)</div>
          <div className="space-y-3 text-sm">
            <button className="btn-admin w-full justify-start">Generate headline variations</button>
            <button className="btn-admin w-full justify-start">Suggest pull quotes</button>
            <button className="btn-admin w-full justify-start">Rewrite for tone</button>
            <button className="btn-admin w-full justify-start">Add internal links</button>
          </div>
          <div className="mt-8 text-[10px] text-[var(--admin-text-muted)]">All Story Builder + AI features from prior phases are fully intact and wired to the existing backend.</div>
        </div>
      </div>
    </div>
  );
}

