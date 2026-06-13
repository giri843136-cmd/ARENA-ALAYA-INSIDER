import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbSchema } from "./ProductSchema";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs — SEO-friendly breadcrumb navigation.
 *
 * Renders visual breadcrumb trail + JSON-LD BreadcrumbList schema.
 * Place above page titles on product, universe, brand, and journal pages.
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { name: "Home", href: "/" },
 *     { name: "Sanctuary", href: "/universes/sanctuary" },
 *     { name: product.name, href: `/products/${product.slug}` },
 *   ]} />
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs tracking-wider text-[#5C5249] ${className}`}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={item.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-[#7A6848]/50" aria-hidden="true" />}
              {isLast ? (
                <span className="text-[#7A6848] font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#7A6848] transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
