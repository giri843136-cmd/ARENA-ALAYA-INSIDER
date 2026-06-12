"use client";

import React, { createContext, useContext, useState } from "react";
import { AdminCommandPalette } from "./AdminCommandPalette";

type ContextType = {
  openPalette: () => void;
  closePalette: () => void;
};

const AdminCommandPaletteContext = createContext<ContextType | null>(null);

export function AdminCommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPalette = () => setOpen(true);
  const closePalette = () => setOpen(false);

  // Global keyboard listener
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AdminCommandPaletteContext.Provider value={{ openPalette, closePalette }}>
      {children}
      <AdminCommandPalette open={open} onOpenChange={setOpen} />
    </AdminCommandPaletteContext.Provider>
  );
}

export const useAdminCommandPalette = () => {
  const ctx = useContext(AdminCommandPaletteContext);
  if (!ctx) throw new Error("useAdminCommandPalette must be used inside AdminCommandPaletteProvider");
  return ctx;
};
