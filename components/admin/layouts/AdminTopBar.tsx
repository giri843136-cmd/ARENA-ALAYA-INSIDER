"use client";

import { Search, Bell } from "lucide-react";
import { useAdminCommandPalette } from "@/components/admin/ui/AdminCommandPaletteProvider";

export function AdminTopBar() {
  const { openPalette } = useAdminCommandPalette();

  return (
    <div className="h-14 border-b border-[#252525] bg-[#111111] flex items-center justify-between px-6 flex-shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-[#C5A26F]">ALAYA INSIDER</div>
        <div className="text-xs text-[#666] px-2 py-0.5 rounded bg-[#1F1F1F]">PRODUCTION</div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Command Trigger */}
        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-lg border border-[#252525] bg-[#0A0A0A] px-3 py-1.5 text-sm text-[#A1A1A1] hover:text-[#EDEDED] hover:border-[#C5A26F] transition-all"
        >
          <Search size={14} />
          <span className="hidden md:inline">Search everything</span>
          <kbd className="hidden md:block ml-2 text-[10px] bg-[#1F1F1F] px-1.5 py-px rounded font-mono">⌘K</kbd>
        </button>

        <button className="p-2 hover:bg-[#1F1F1F] rounded-lg relative">
          <Bell size={16} />
          <div className="absolute top-1 right-1 h-2 w-2 bg-[#C5A26F] rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-[#252525]">
          <div className="text-right text-xs leading-none">
            <div className="font-medium">Elena Voss</div>
            <div className="text-[#666]">Editor in Chief</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#C5A26F] flex items-center justify-center text-[#0A0A0A] text-sm font-medium">EV</div>
        </div>
      </div>
    </div>
  );
}
