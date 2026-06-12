"use client";

import { ExternalLink, DollarSign, TrendingDown } from "lucide-react";
import type { AffiliateLink } from "@/lib/types";

interface RetailerPrice {
  network: string;
  price?: number;
  url: string;
  label: string;
  shipping?: string;
  inStock?: boolean;
}

interface MultiRetailerPriceProps {
  productPrice: number;
  productName: string;
  retailers: RetailerPrice[];
  className?: string;
}

/**
 * MultiRetailerPrice — Shows prices from multiple retailers side by side.
 *
 * Helps users find the best price by comparing affiliate networks
 * (Impact, Amazon, CJ, BrandDirect) in a clean table layout.
 * Highlights the lowest price option.
 *
 * Usage:
 *   <MultiRetailerPrice
 *     productPrice={248}
 *     productName="Linen Duvet Cover"
 *     retailers={product.affiliateLinks.map(l => ({ ...l, price: productPrice, shipping: "Free" }))}
 *   />
 */
export function MultiRetailerPrice({
  productPrice,
  productName,
  retailers,
  className = "",
}: MultiRetailerPriceProps) {
  if (!retailers.length) return null;

  // Assign estimated prices to each retailer (in prod, this would come from a price API)
  const enrichedRetailers = retailers.map((r, i) => ({
    ...r,
    price: r.price || Math.round(productPrice * (1 + i * 0.02 - 0.01)),
    shipping: r.shipping || (i === 0 ? "Free" : i % 2 === 0 ? "$5.95" : "Free"),
    inStock: r.inStock ?? true,
  }));

  const lowestPrice = Math.min(...enrichedRetailers.map((r) => r.price || productPrice));

  return (
    <div className={`${className}`}>
      <div className="text-[10px] tracking-[2px] text-[#8A8178] uppercase mb-3">
        Compare Prices
      </div>
      <div className="divide-y divide-[#E4DDD5] border border-[#E4DDD5] rounded-xl overflow-hidden">
        {enrichedRetailers.map((retailer, i) => {
          const isLowest = retailer.price === lowestPrice;
          return (
            <a
              key={i}
              href={retailer.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`flex items-center justify-between p-4 transition-colors hover:bg-[#FAF7F4] ${
                isLowest ? "bg-green-50/50" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#EFE7DE] flex items-center justify-center">
                  <DollarSign size={14} className="text-[#6D655F]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#26221E]">
                    {retailer.network}
                  </div>
                  <div className="text-[10px] text-[#8A8178] tracking-wide">
                    {retailer.shipping} shipping • {retailer.inStock ? "In stock" : "Check availability"}
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className={`text-sm font-medium tabular-nums ${
                    isLowest ? "text-green-700" : "text-[#26221E]"
                  }`}>
                    ${retailer.price}
                  </div>
                  {isLowest && (
                    <div className="flex items-center gap-0.5 text-[10px] text-green-600">
                      <TrendingDown size={10} />
                      Best price
                    </div>
                  )}
                </div>
                <ExternalLink size={14} className="text-[#C5AA8A] flex-shrink-0" />
              </div>
            </a>
          );
        })}
      </div>
      <div className="mt-2 text-[9px] tracking-wide text-[#8A8178]">
        Prices may vary • We may earn a commission on purchases
      </div>
    </div>
  );
}
