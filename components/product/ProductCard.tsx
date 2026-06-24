"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, GitCompare } from "lucide-react";
import type { Product } from "@/lib/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist/store";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "editorial";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [, setSaved] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSaved(isInWishlist(product.slug));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [product.slug]);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  const handleQuickAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === "wishlist") {
      const newState = toggleWishlist({
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        brandName: product.brandName,
      });
      setSaved(newState);
    } else if (action === "compare") {
      window.location.href = `/compare?add=${product.slug}`;
    } else {
      console.log(`${action} for ${product.name}`);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="group/card relative overflow-hidden rounded-3xl border border-[#E4DDD5] bg-white transition-all duration-300 hover:border-[#6D5C3E]">
        {/* Premium Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#EFE7DE]">
          <Image
            src={product.images?.[0] || (product as any).featuredImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          
          {/* Elegant Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.newArrival && (
              <div className="inline-flex items-center rounded-full border border-white/60 bg-white/90 px-3 py-0.5 text-[10px] font-medium tracking-[2px] text-[#26221E] backdrop-blur">
                NEW
              </div>
            )}
            {product.bestseller && (
              <div className="inline-flex items-center rounded-full bg-[#26221E] px-3 py-0.5 text-[10px] font-medium tracking-[2px] text-white">
                BESTSELLER
              </div>
            )}
            {hasDiscount && (
              <div className="inline-flex items-center rounded-full bg-[#6D5C3E] px-3 py-0.5 text-[10px] font-medium tracking-[2px] text-white">
                -{discount}%
              </div>
            )}
            {product.availability === 'LOW_STOCK' && (
              <div className="inline-flex items-center rounded-full bg-rose-600 px-3 py-0.5 text-[10px] font-medium tracking-[2px] text-white animate-pulse">
                LOW STOCK
              </div>
            )}
          </div>

          {/* Premium Quick Actions — C-Style inspired */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button 
              onClick={(e) => handleQuickAction(e, 'wishlist')}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center border border-[#E4DDD5] hover:border-[#6D5C3E] transition-colors active:scale-[0.96]"
              aria-label="Save to wishlist"
            >
              <Heart className="h-4 w-4 text-[#26221E]" />
            </button>
            <button 
              onClick={(e) => handleQuickAction(e, 'quick-view')}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center border border-[#E4DDD5] hover:border-[#6D5C3E] transition-colors active:scale-[0.96]"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 text-[#26221E]" />
            </button>
            <button 
              onClick={(e) => handleQuickAction(e, 'compare')}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center border border-[#E4DDD5] hover:border-[#6D5C3E] transition-colors active:scale-[0.96]"
              aria-label="Compare"
            >
              <GitCompare className="h-4 w-4 text-[#26221E]" />
            </button>
          </div>

          {/* Urgency & Availability indicators */}
          {!product.inStock && (
            <div className="absolute bottom-4 left-4 text-[10px] tracking-[1.5px] uppercase bg-white/90 px-2.5 py-0.5 rounded text-[#6D655F]">
              OUT OF STOCK
            </div>
          )}
          {product.availability === 'LOW_STOCK' && (
            <div className="absolute bottom-4 left-4 text-[10px] tracking-[1.5px] uppercase bg-rose-600/90 backdrop-blur px-2.5 py-0.5 rounded text-white font-medium">
              Only 2 left
            </div>
          )}
        </div>

        {/* Refined Content Area */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] tracking-[2px] uppercase text-[#6D655F] font-medium">
              {product.brandName}
            </span>
            {product.rating && (
              <span className="flex items-center gap-1 text-xs text-[#6D655F]">
                <span className="text-[#6D5C3E]">★</span> {product.rating}
                <span className="text-[#5C5249]">({product.reviewCount})</span>
              </span>
            )}
          </div>

          <h3 className="font-display text-[17px] leading-[1.15] tracking-[-0.25px] text-[#26221E] mb-3 line-clamp-2 group-hover:text-[#6D5C3E] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mb-1">
            <PriceDisplay usdAmount={product.price} className="text-[19px] font-medium tabular-nums tracking-tight text-[#26221E]" />
            {hasDiscount && (
              <span className="text-sm text-[#6D655F] line-through tabular-nums">
                <PriceDisplay usdAmount={product.originalPrice!} />
              </span>
            )}
          </div>

          {/* Color Variants (premium touch) */}
          {(product as any).color && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-2.5 w-2.5 rounded-full border border-[#E4DDD5]" style={{ background: (product as any).color }} />
              <span className="text-[11px] text-[#6D655F]">{(product as any).color}</span>
            </div>
          )}

          {variant !== "compact" && (product as any).shortDescription && (
            <p className="mt-3 text-[13px] leading-snug text-[#6D655F] line-clamp-2">
              {(product as any).shortDescription}
            </p>
          )}

          {/* Affiliate / Trust line */}
          {product.affiliateLinks?.length > 0 && (
            <div className="mt-4 text-[10px] tracking-[1.5px] text-[#5C5249] uppercase">
              Available via {product.affiliateLinks[0].network}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
