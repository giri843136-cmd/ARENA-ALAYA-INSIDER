"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, ShoppingBag, Heart } from "lucide-react";
import { getSocialProofConfig, updateSocialProofConfig, resetSocialProofConfig } from "@/lib/social/config";
import type { SocialProofConfig } from "@/lib/social/config";

/**
 * SocialProofControls — Admin toggle panel for A/B testing social proof signals.
 *
 * Allows admins to enable/disable each social proof signal independently.
 * Changes are stored in localStorage and reflected site-wide in real-time.
 *
 * Usage:
 *   <SocialProofControls />
 */
export function SocialProofControls() {
  const [config, setConfig] = useState<SocialProofConfig>(getSocialProofConfig());
  const [saved, setSaved] = useState(false);

  // Listen for external config changes
  const handleChange = useCallback(() => {
    setConfig(getSocialProofConfig());
  }, []);

  useEffect(() => {
    window.addEventListener("social-proof-config-updated", handleChange);
    return () => window.removeEventListener("social-proof-config-updated", handleChange);
  }, [handleChange]);

  const toggle = (key: keyof SocialProofConfig) => {
    const updated = updateSocialProofConfig({ [key]: !config[key] });
    setConfig(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    const defaults = resetSocialProofConfig();
    setConfig(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const signals = [
    { key: "viewersEnabled" as keyof SocialProofConfig, label: "Viewers", icon: Eye },
    { key: "purchasesEnabled" as keyof SocialProofConfig, label: "Purchases", icon: ShoppingBag },
    { key: "savesEnabled" as keyof SocialProofConfig, label: "Saves", icon: Heart },
  ];

  return (
    <div className="flex items-center gap-3">
      {signals.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider transition-all ${
            config[key]
              ? "bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30"
              : "bg-[#1A1A1A] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-50"
          }`}
          title={`${config[key] ? "Disable" : "Enable"} ${label.toLowerCase()} signal`}
        >
          <Icon size={10} />
          <span>{label}</span>
        </button>
      ))}
      <button
        onClick={handleReset}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] tracking-wider bg-[#1A1A1A] text-[var(--admin-text-muted)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)]/30 transition-all"
        title="Reset all signals to defaults"
      >
        Reset
      </button>
      {saved && (
        <span className="text-[10px] text-[#4ADE80] tracking-wider animate-pulse">Saved</span>
      )}
    </div>
  );
}
