import { Search, Package, BookOpen, Users } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "search" | "product" | "journal" | "brand";
  actionLabel?: string;
  actionHref?: string;
  secondaryAction?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  icon = "search", 
  actionLabel, 
  actionHref, 
  secondaryAction 
}: EmptyStateProps) {
  const Icon = {
    search: Search,
    product: Package,
    journal: BookOpen,
    brand: Users,
  }[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center max-w-sm mx-auto px-4">
      <div className="h-14 w-14 rounded-full bg-[#EFE7DE] flex items-center justify-center mb-6">
        <Icon className="h-6 w-6 text-[#C5AA8A]" />
      </div>
      <h3 className="font-display text-2xl tracking-tight mb-3 text-[#26221E]">{title}</h3>
      <p className="text-[#6D655F] text-[15px] leading-relaxed mb-8">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
        {actionHref && actionLabel && (
          <Link href={actionHref} className="btn btn-primary flex-1 sm:flex-none justify-center">{actionLabel}</Link>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
