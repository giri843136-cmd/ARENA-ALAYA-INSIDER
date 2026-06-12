"use client";

import { useEffect, useRef, useState } from "react";

interface AdPlacementProps {
  slot: string;
  format?: "banner" | "rectangle" | "leaderboard" | "skyscraper";
  className?: string;
  fallback?: React.ReactNode;
}

const SIZE_MAP: Record<string, { width: number; height: number }> = {
  banner: { width: 468, height: 60 },
  rectangle: { width: 300, height: 250 },
  leaderboard: { width: 728, height: 90 },
  skyscraper: { width: 160, height: 600 },
};

/**
 * Ad placement with lazy loading via IntersectionObserver.
 * Shows fallback content when ad is not loaded.
 */
export function AdPlacement({ slot, format = "banner", className = "", fallback }: AdPlacementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const size = SIZE_MAP[format];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative flex items-center justify-center bg-[#FAF7F4] dark:bg-[#26221E] rounded-xl overflow-hidden ${className}`} style={{ minHeight: size.height, minWidth: size.width }}>
      {visible ? (
        <div className="text-center p-4">
          {/* Ad network script would go here */}
          <div className="text-[10px] tracking-[2px] text-[#8A8178] uppercase">Advertisement</div>
          <div className="text-xs text-[#8A8178] mt-1">Your ad here — {slot}</div>
        </div>
      ) : (
        fallback || <div className="text-[10px] text-[#8A8178]">Ad placeholder</div>
      )}
    </div>
  );
}
