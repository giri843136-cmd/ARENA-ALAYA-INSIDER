"use client";

import { X } from "lucide-react";
import { Button } from "./Button";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FilterDrawer({ isOpen, onClose, children, title = "Refine" }: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full md:max-w-md md:rounded-3xl md:m-4 rounded-t-3xl border border-[#E4DDD5] p-8 max-h-[85vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-2xl tracking-tight">{title}</div>
          <button onClick={onClose} className="text-[#5C5249] hover:text-[#26221E]"><X /></button>
        </div>
        
        {children}

        <div className="mt-8 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Done</Button>
          <Button variant="accent" onClick={onClose} className="flex-1">Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}
