import { Award, Star, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";

type BadgeType =
  | "editors-pick"
  | "top-rated"
  | "bestseller"
  | "best-value"
  | "new-arrival"
  | "sustainable"
  | "invest-now"
  | "budget-pick";

interface EditorBadgeProps {
  type: BadgeType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const badgeConfig: Record<
  BadgeType,
  { label: string; description: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  "editors-pick": {
    label: "EDITOR'S PICK",
    description: "The object our editors would buy for themselves without hesitation",
    icon: Award,
    color: "text-[#C5AA8A]",
    bgColor: "bg-[#C5AA8A]/10",
  },
  "top-rated": {
    label: "TOP RATED",
    description: "Highest-rated product in its category with exceptional reader reviews",
    icon: Star,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  bestseller: {
    label: "BESTSELLER",
    description: "Our most-purchased product — trusted by thousands of readers",
    icon: TrendingUp,
    color: "text-[#26221E]",
    bgColor: "bg-[#26221E]/5",
  },
  "best-value": {
    label: "BEST VALUE",
    description: "Incredible quality at a remarkable price point",
    icon: Sparkles,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  "new-arrival": {
    label: "NEW",
    description: "Just added to our collection — one of the first to discover it",
    icon: Sparkles,
    color: "text-sky-700",
    bgColor: "bg-sky-50",
  },
  sustainable: {
    label: "SUSTAINABLE",
    description: "Meets our rigorous standards for ethical production and materials",
    icon: ShieldCheck,
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  "invest-now": {
    label: "INVEST NOW",
    description: "A classic piece that will only become more valuable with time and use",
    icon: Award,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
  },
  "budget-pick": {
    label: "BUDGET PICK",
    description: "Exceptional quality at an accessible price — our best affordable option",
    icon: Sparkles,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
  },
};

/**
 * EditorBadge — Trust and authority badges for product pages.
 *
 * Displays visual badges like "EDITOR'S PICK", "TOP RATED", "BEST VALUE"
 * with hover tooltips explaining what each badge means.
 *
 * Usage:
 *   <EditorBadge type="editors-pick" />
 *   <EditorBadge type="bestseller" size="lg" />
 */
export function EditorBadge({ type, className = "", size = "sm" }: EditorBadgeProps) {
  const config = badgeConfig[type];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "text-[9px] px-2 py-0.5 gap-1",
    md: "text-[10px] px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-[1.5px] group relative ${config.bgColor} ${config.color} ${sizeClasses[size]} ${className}`}
      title={config.description}
    >
      <IconComponent size={iconSizes[size]} aria-hidden="true" />
      <span>{config.label}</span>
      {/* Tooltip on hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#26221E] text-white text-[11px] leading-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {config.description}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#26221E]" />
      </span>
    </span>
  );
}
