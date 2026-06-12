"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
  className?: string;
}

/**
 * Displays star rating. Supports display mode and interactive (click to rate) mode.
 * Shows fractional stars for non-integer ratings.
 */
export function RatingStars({
  rating,
  reviewCount,
  interactive = false,
  onChange,
  size = 16,
  className = "",
}: RatingStarsProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fillPercentage = Math.min(1, Math.max(0, rating - i));
    return fillPercentage;
  });

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`flex ${interactive ? "gap-0.5" : "gap-0.5"}`}>
        {stars.map((fill, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} relative`}
            aria-label={`${interactive ? `Rate ${i + 1} star${i + 1 > 1 ? "s" : ""}` : ""}`}
          >
            {/* Empty star */}
            <Star
              size={size}
              className="text-[#E4DDD5] dark:text-[#3D3530]"
              fill="currentColor"
            />
            {/* Filled star (clipped) */}
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-[#C5AA8A]"
                  fill="currentColor"
                />
              </span>
            )}
          </button>
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-[#8A8178] ml-1">
          {rating.toFixed(1)} ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
