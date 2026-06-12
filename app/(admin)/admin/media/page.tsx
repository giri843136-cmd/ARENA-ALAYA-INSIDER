"use client";

export default function MediaAtelier() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[#C5AA8A]">MEDIA ATELIER</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Assets &amp; Imagery</h1>
      </div>

      <div className="admin-card p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-[#1F1F1F] rounded-xl border border-[#252525] flex items-center justify-center text-xs text-[#666]">
              IMAGE {i + 1}
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <button className="btn-admin-primary text-xs">Upload new assets</button>
          <button className="btn-admin text-xs">Bulk tag with AI</button>
        </div>
        <div className="text-xs text-[#666] mt-6">Cloudinary integration + AI tagging preserved from original architecture.</div>
      </div>
    </div>
  );
}
