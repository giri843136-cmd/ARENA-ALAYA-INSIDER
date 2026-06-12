"use client";

import { ExternalLink, Info } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface AffiliateButtonProps {
  href: string;
  productName: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Affiliate tracking button with FTC-compliant disclosure.
 * Tracks clicks and shows disclosure tooltip on hover.
 */
export function AffiliateButton({
  href,
  productName,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: AffiliateButtonProps) {
  const sizeClasses: Record<string, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const variantClasses: Record<string, string> = {
    primary: "bg-[#C5AA8A] text-white hover:bg-[#B89A7A]",
    secondary: "bg-[#26221E] text-white hover:bg-[#3D3530] dark:bg-[#EDE6DC] dark:text-[#26221E] dark:hover:bg-[#D9D0C3]",
    ghost: "bg-transparent border border-[#C5AA8A] text-[#C5AA8A] hover:bg-[#C5AA8A]/10",
  };

  const handleClick = () => {
    onClick?.();
    // Track affiliate click
    try {
      fetch("/api/analytics/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: href, productName, timestamp: new Date().toISOString() }),
        keepalive: true,
      });
    } catch {
      // Silently fail — analytics should never block navigation
    }
  };

  return (
    <Tooltip content="We may earn a commission on purchases made through this link. Learn more." position="top">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-full font-medium transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <span>Shop {productName}</span>
        <ExternalLink size={size === "sm" ? 12 : 14} />
      </a>
    </Tooltip>
  );
}
