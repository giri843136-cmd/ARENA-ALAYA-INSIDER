"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

/**
 * Sticky banner shown when the user goes offline.
 * Detects navigator.onLine changes and shows/hides accordingly.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FEF3C7] dark:bg-[#4B3D1F] text-[#92400E] dark:text-[#FDE68A] px-4 py-2.5 flex items-center justify-center gap-2 text-sm shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
      <WifiOff size={16} />
      <span>You&apos;re offline — some features may be unavailable.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#92400E]/10 dark:bg-[#FDE68A]/10 hover:bg-[#92400E]/20 dark:hover:bg-[#FDE68A]/20 transition-colors text-xs font-medium"
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}
