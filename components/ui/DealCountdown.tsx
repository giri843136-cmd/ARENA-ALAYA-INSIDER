"use client";

import { useState, useEffect } from "react";

interface DealCountdownProps {
  index: number;
}

/**
 * Client-side countdown timer that only renders after hydration.
 * Prevents React hydration error #418 caused by Date.now() during server render.
 */
export function DealCountdown({ index }: DealCountdownProps) {
  const [time, setTime] = useState("--:--h");

  useEffect(() => {
    const expires = new Date(Date.now() + (index + 1) * 86400000 + 3600000);
    const diff = expires.getTime() - Date.now();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    setTime(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}h`);
  }, [index]);

  return <>{time}</>;
}
