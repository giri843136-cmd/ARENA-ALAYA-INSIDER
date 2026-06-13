"use client";

import { PriceDisplay } from "@/components/ui/PriceDisplay";

export function CollectionProductPrice({ price }: { price: number }) {
  return <PriceDisplay usdAmount={price} />;
}
