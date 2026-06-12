"use client";

import React from "react";

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AdminDrawer({ open, onClose, title, children }: AdminDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-md bg-[#111111] border-l border-[#252525] overflow-auto">
        <div className="flex items-center justify-between border-b border-[#252525] px-6 py-4 sticky top-0 bg-[#111111]">
          <div className="font-medium">{title}</div>
          <button onClick={onClose} className="text-[#666] hover:text-white">Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
