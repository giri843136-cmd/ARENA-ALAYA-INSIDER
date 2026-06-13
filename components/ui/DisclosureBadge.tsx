"use client";

import { Info } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface DisclosureBadgeProps {
  variant?: "inline" | "badge" | "footer";
  className?: string;
}

/**
 * FTC-compliant affiliate disclosure badge.
 * Shows "We may earn a commission" message with different visual variants.
 */
export function DisclosureBadge({ variant = "inline", className = "" }: DisclosureBadgeProps) {
  const content = "We may earn a commission if you make a purchase through our affiliate links. This helps support our editorial independence at no extra cost to you.";

  if (variant === "footer") {
    return (
      <p className={`text-[10px] leading-relaxed text-[#5C5249] ${className}`}>
        {content}
      </p>
    );
  }

  if (variant === "badge") {
    return (
      <Tooltip content={content} position="top">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-[#FEF3C7] text-[#92400E] rounded-full cursor-help ${className}`}>
          <Info size={10} />
          Affiliate disclosure
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={content} position="top">
      <span className={`inline-flex items-center gap-1 text-xs text-[#5C5249] cursor-help hover:text-[#6D655F] transition-colors ${className}`}>
        <Info size={12} />
        Affiliate disclosure
      </span>
    </Tooltip>
  );
}
