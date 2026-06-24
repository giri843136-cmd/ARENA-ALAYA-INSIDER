"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { ExternalLink, Star, ShoppingBag, Loader2 } from "lucide-react";

interface ProductEmbedData {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  brand: { name: string; slug: string };
  image: string | null;
  imageAlt: string;
  bestAffiliate: { network: string; url: string; label: string; commissionRate: number | null } | null;
  affiliatesAvailable: number;
  inStock: boolean;
  description: string;
}

interface ProductEmbedProps {
  productId?: string;
  slug?: string;
  variant?: "card" | "inline" | "button";
  className?: string;
}

/**
 * In-article Product Embed Component
 * Fetches product data via API and renders an embed card.
 * Supports card, inline, and button variants.
 *
 * Usage in article content:
 * <ProductEmbed slug="linen-duvet-cover-oat" />
 * <ProductEmbed productId="p1" variant="inline" />
 */
export function ProductEmbed({
  productId,
  slug,
  variant = "card",
  className = "",
}: ProductEmbedProps) {
  const [product, setProduct] = useState<ProductEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(false);
      try {
        const params = productId
          ? `productIds=${productId}`
          : `slug=${slug}`;
        const res = await fetch(`/api/v1/admin/products/embeds?${params}`);
        const json = await res.json();
        if (json.success) {
          if (Array.isArray(json.data)) {
            setProduct(json.data[0] || null);
          } else {
            setProduct(json.data);
          }
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (productId || slug) fetchProduct();
  }, [productId, slug]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 bg-[#EFE7DE]/30 rounded-xl border border-[#E4DDD5] ${className}`}>
        <Loader2 size={16} className="animate-spin text-[#6D5C3E]" />
      </div>
    );
  }

  if (error || !product) {
    return null; // Graceful fallback — hide on error
  }

  // Button variant — minimal inline button
  if (variant === "button") {
    return (
      <a
        href={product.bestAffiliate?.url || `/products/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#26221E] text-white text-xs font-medium hover:bg-[#3D3630] transition-colors ${className}`}
      >
        <ShoppingBag size={12} />
        Shop {product.name}
        <ExternalLink size={10} className="opacity-60" />
      </a>
    );
  }

  // Inline variant — compact, text-level embed
  if (variant === "inline") {
    return (
      <a
        href={product.bestAffiliate?.url || `/products/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFE7DE]/50 border border-[#E4DDD5] hover:bg-[#E4DDD5] transition-colors no-underline ${className}`}
      >          {product.image && (
          <Image src={product.image} alt={product.imageAlt} width={32} height={32} className="rounded object-cover" unoptimized />
        )}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#26221E]">{product.name}</span>
          <span className="text-[10px] text-[#6D5C3E]">                {product.salePrice ? (
                  <><span className="line-through text-[#6D655F]">${product.price.toFixed(2)}</span> ${product.salePrice.toFixed(2)}</>
                ) : (
                  <>${product.price.toFixed(2)}</>
                )}
            {product.rating > 0 && ` · ★ ${product.rating}`}
          </span>
        </div>
        <ExternalLink size={12} className="text-[#6D5C3E] shrink-0" />
      </a>
    );
  }

  // Card variant — full product card embed (default)
  return (
    <div className={`not-prose my-6 ${className}`}>
      <a
        href={product.bestAffiliate?.url || `/products/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl border border-[#E4DDD5] bg-white overflow-hidden hover:border-[#6D5C3E] transition-all duration-300 no-underline"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-48 h-40 sm:h-auto bg-[#EFE7DE] overflow-hidden shrink-0">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                sizes="192px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#6D5C3E]">
                <ShoppingBag size={32} className="opacity-40" />
              </div>
            )}
            {product.bestAffiliate && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[9px] tracking-wider text-[#26221E] font-medium">
                {product.bestAffiliate.network}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="text-[11px] tracking-[2px] uppercase text-[#6D655F] font-medium mb-1">
              {product.brand.name}
            </div>
            <h4 className="font-display text-[17px] leading-tight tracking-[-0.25px] text-[#26221E] mb-2 group-hover:text-[#6D5C3E] transition-colors">
              {product.name}
            </h4>
            <p className="text-[13px] leading-snug text-[#6D655F] line-clamp-2 mb-3">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[19px] font-medium tabular-nums text-[#26221E]">
                  ${(product.salePrice || product.price).toFixed(2)}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-[#6D655F] line-through">${product.price}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {product.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-[#6D655F]">
                    <Star size={12} className="text-[#6D5C3E] fill-current" />
                    {product.rating}
                    <span className="text-[#5C5249]">({product.reviewCount})</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs font-medium text-[#6D5C3E] group-hover:gap-1.5 transition-all">
                  Shop Now <ExternalLink size={12} />
                </span>
              </div>
            </div>

            {/* Stock & Availability footer */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E4DDD5]">
              {product.inStock ? (
                <span className="text-[10px] text-[#4ADE80]">● In Stock</span>
              ) : (
                <span className="text-[10px] text-[#F87171]">● Out of Stock</span>
              )}
              {product.affiliatesAvailable > 1 && (
                <span className="text-[10px] text-[#6D655F]">
                  +{product.affiliatesAvailable - 1} more retailers
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
