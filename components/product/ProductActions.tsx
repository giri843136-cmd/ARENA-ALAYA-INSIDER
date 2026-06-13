"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { CurrencyIndicator } from "@/components/ui/CurrencyIndicator";
import type { Product } from "@/lib/types";

export function ProductActions({ product }: { product: Product }) {
  const primaryLink = product.affiliateLinks[0];
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    // Simulate adding to cart
    await new Promise((r) => setTimeout(r, 800));
    setAddingToCart(false);
    setAddedToCart(true);
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart.`,
      action: {
        label: "View Cart",
        onClick: () => {},
      },
    });
    // Reset after 3s
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || addedToCart}
          className={`flex-1 btn btn-primary btn-lg transition-all active:scale-[0.98] ${
            addedToCart ? "bg-[#4ADE80] text-white border-[#4ADE80]" : ""
          }`}
        >
          {addingToCart ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Adding...
            </>
          ) : addedToCart ? (
            <>
              <Check size={16} />
              Added to Cart
            </>
          ) : (
            <>
              Add to Cart • <PriceDisplay usdAmount={product.price} />
            </>
          )}
        </button>
        {primaryLink && (
          <a
            href={primaryLink.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 btn btn-secondary btn-lg inline-flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <ExternalLink size={14} />
            Buy from {primaryLink.network || "Partner"}
          </a>
        )}
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 text-[11px] tracking-[1.5px] text-[#8A8178]">
        <CurrencyIndicator />
        <span aria-hidden="true">•</span>
        90-day happiness guarantee • Editorially verified
      </div>
    </div>
  );
}
