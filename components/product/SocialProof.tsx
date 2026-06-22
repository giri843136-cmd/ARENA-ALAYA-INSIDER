"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { getSocialProofConfig, DEFAULT_CONFIG, type SocialProofConfig } from "@/lib/social/config";

/**
 * SocialProof — Combined social proof signals for product pages.
 *
 * Displays:
 *  - "X people viewing this" (live viewer count with pulsing dot)
 *  - "X bought this in the last 24 hours" (purchase momentum)
 *  - "X saved this to wishlist" (social validation)
 *
 * All counts fluctuate realistically to feel organic.
 *
 * Usage:
 *   <SocialProof popularity="high" />
 */

export const POPULARITY_RANGES = {
  low: {
    viewers: [3, 12] as [number, number],
    purchases: [2, 8] as [number, number],
    saves: [5, 18] as [number, number],
  },
  medium: {
    viewers: [14, 38] as [number, number],
    purchases: [9, 27] as [number, number],
    saves: [20, 55] as [number, number],
  },
  high: {
    viewers: [42, 97] as [number, number],
    purchases: [28, 72] as [number, number],
    saves: [58, 140] as [number, number],
  },
  trending: {
    viewers: [120, 340] as [number, number],
    purchases: [85, 260] as [number, number],
    saves: [200, 580] as [number, number],
  },
};

type PopularityTier = keyof typeof POPULARITY_RANGES;

interface SocialProofProps {
  /** Relative popularity tier */
  popularity?: PopularityTier;
  className?: string;
}

function randomInRange([min, max]: [number, number]): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fluctuate(prev: number, [min, max]: [number, number]): number {
  const delta = Math.random() > 0.5 ? 1 : -1;
  const next = prev + delta;
  if (next < min) return min + 1;
  if (next > max) return max - 1;
  return next;
}

export function SocialProof({
  popularity = "medium",
  className = "",
}: SocialProofProps) {
  const [viewers, setViewers] = useState(0);
  const [purchases, setPurchases] = useState(0);
  const [saves, setSaves] = useState(0);
  const [config, setConfig] = useState<SocialProofConfig>(DEFAULT_CONFIG);
  const [mounted, setMounted] = useState(false);

  // Hydrate config from localStorage only after mount to avoid SSR/CSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
    setConfig(getSocialProofConfig());
  }, []);

  // Listen for config changes from admin panel
  const handleConfigChange = useCallback(() => {
    setConfig(getSocialProofConfig());
  }, []);

  useEffect(() => {
    window.addEventListener("social-proof-config-updated", handleConfigChange);
    return () => window.removeEventListener("social-proof-config-updated", handleConfigChange);
  }, [handleConfigChange]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const ranges = POPULARITY_RANGES[popularity];

    setViewers(randomInRange(ranges.viewers));
    setPurchases(randomInRange(ranges.purchases));
    setSaves(randomInRange(ranges.saves));

    // Gently fluctuate all counts every 5–10 seconds
    const interval = setInterval(() => {
      setViewers((prev) => fluctuate(prev, ranges.viewers));
      setPurchases((prev) => fluctuate(prev, ranges.purchases));
      setSaves((prev) => fluctuate(prev, ranges.saves));
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [popularity]);

  // Don't render until both mounted on client and initialized with random values
  if (!mounted || viewers === 0) return null;

  // Check if any signal is enabled at all
  if (!config.viewersEnabled && !config.purchasesEnabled && !config.savesEnabled) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Live viewers */}
      {config.viewersEnabled && (
        <div className="flex items-center gap-2 text-xs text-[#5C5249]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="tabular-nums font-semibold">{viewers}</span>
          <span>people viewing this</span>
        </div>
      )}

      {/* Recent purchases */}
      {config.purchasesEnabled && (
        <div className="flex items-center gap-2 text-xs text-[#5C5249]">
          <ShoppingBag size={12} className="text-[#7A6848]" />
          <span className="tabular-nums font-semibold">{purchases}</span>
          <span>bought this in the last 24 hours</span>
        </div>
      )}

      {/* Wishlist saves */}
      {config.savesEnabled && (
        <div className="flex items-center gap-2 text-xs text-[#5C5249]">
          <Heart size={12} className="text-rose-400" />
          <span className="tabular-nums font-semibold">{saves}</span>
          <span>saved this to wishlist</span>
        </div>
      )}
    </div>
  );
}
