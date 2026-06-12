import { Users, Award, ShieldCheck, Newspaper, Star } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { icon: Users, value: "50K+", label: "Monthly Readers" },
  { icon: Award, value: "200+", label: "Products Tested" },
  { icon: Star, value: "4.8", label: "Avg. Rating" },
  { icon: Newspaper, value: "100+", label: "Editorial Essays" },
  { icon: ShieldCheck, value: "100%", label: "Independent" },
];

interface TrustBarProps {
  stats?: StatItem[];
  variant?: "bar" | "inline" | "footer";
  className?: string;
}

/**
 * TrustBar — Social proof bar showing key metrics.
 *
 * Displays trust-building statistics like reader count, products tested,
 * average rating, and editorial independence.
 * Can be used as a full-width bar, inline stats, or footer line.
 *
 * Usage:
 *   <TrustBar variant="bar" />
 *   <TrustBar variant="inline" stats={customStats} />
 */
export function TrustBar({
  stats = DEFAULT_STATS,
  variant = "bar",
  className = "",
}: TrustBarProps) {
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-[#8A8178]">
            <stat.icon size={12} className="text-[#C5AA8A]" aria-hidden="true" />
            <span className="font-medium text-[#6D655F]">{stat.value}</span>
            <span className="hidden sm:inline">{stat.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`text-center text-[10px] tracking-wider text-[#8A8178] ${className}`}>
        <span className="text-[#C5AA8A]">ALAYA INSIDER</span> — Editorially independent since 2024.
        {stats.map((s, i) => (
          <span key={i}>
            {" "}• {s.value} {s.label}
          </span>
        ))}
      </div>
    );
  }

  // Full-width bar variant
  return (
    <div
      className={`border-y border-[#E4DDD5] bg-white/80 backdrop-blur-sm ${className}`}
      role="region"
      aria-label="Trust indicators"
    >
      <div className="container">
        <div className="flex items-center justify-between py-4 md:py-3 overflow-x-auto gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <stat.icon
                size={16}
                className="text-[#C5AA8A]"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#26221E] tabular-nums leading-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] text-[#8A8178] tracking-wide whitespace-nowrap">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
