"use client";

import { Share2, Link, Twitter, Facebook } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  platforms?: ("twitter" | "facebook" | "copy")[];
  className?: string;
}

/**
 * Social share buttons with platform-specific links and copy-to-clipboard.
 */
export function SocialShare({
  url,
  title,
  description,
  platforms = ["twitter", "facebook", "copy"],
  className = "",
}: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks: Record<string, { label: string; href: string; icon: React.ReactNode }> = {
    twitter: {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <Twitter size={16} />,
    },
    facebook: {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook size={16} />,
    },
    copy: {
      label: "Copy link",
      href: "#",
      icon: <Link size={16} />,
    },
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      // Toast would be triggered by the parent — return for caller handling
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs text-[#8A8178] mr-1">
        <Share2 size={14} className="inline mr-1" />
        Share
      </span>
      {platforms.map((platform) => {
        const link = shareLinks[platform];
        return (
          <Tooltip key={platform} content={link.label}>
            {platform === "copy" ? (
              <button
                onClick={handleCopyLink}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] transition-colors text-[#6D655F]"
                aria-label="Copy link"
              >
                {link.icon}
              </button>
            ) : (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] transition-colors text-[#6D655F]"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}
