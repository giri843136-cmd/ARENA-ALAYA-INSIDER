"use client";

import { useEffect, useState } from "react";

interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Feature flag wrapper component.
 * Renders children only if the specified flag is enabled.
 * Fetches flag status from GET /api/v1/admin/feature-flags.
 */
export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFlag = async () => {
      try {
        const res = await fetch(`/api/v1/admin/feature-flags?key=${encodeURIComponent(flag)}`);
        const json = await res.json();
        setEnabled(json.success ? json.data?.enabled === true : false);
      } catch {
        setEnabled(false);
      }
    };
    checkFlag();
  }, [flag]);

  if (enabled === null) return null; // Loading
  return enabled ? <>{children}</> : <>{fallback}</>;
}
