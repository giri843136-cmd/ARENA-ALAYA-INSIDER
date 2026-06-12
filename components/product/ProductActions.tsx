"use client";

import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { CurrencyIndicator } from "@/components/ui/CurrencyIndicator";
import type { Product } from "@/lib/types";

export function ProductActions({ product }: { product: Product }) {
  const primaryLink = product.affiliateLinks[0];

  const handleAddToCart = () => {
    // In a real app this would add to cart / open modal
    alert(`Added ${product.name} to your cart (demo).`);
  };

  const handleBuy = () => {
    if (primaryLink) {
      window.open(primaryLink.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E4DDD5]">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="flex-1" onClick={handleAddToCart}>
          Add to Cart • <PriceDisplay usdAmount={product.price} />
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleBuy}>
          Buy from {primaryLink?.network || "Partner"}
        </Button>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 text-[11px] tracking-[1.5px] text-[#8A8178]">
        <CurrencyIndicator />
        <span aria-hidden="true">•</span>
        90-day happiness guarantee • Editorially verified
      </div>
    </div>
  );
}
