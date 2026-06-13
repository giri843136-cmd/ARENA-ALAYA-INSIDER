"use client";

import { useEffect } from "react";
import { trackProductView } from "@/components/product/RecentlyViewed";

/**
 * Client-side wrapper that tracks product views on mount.
 * This is separate from the server component to use hooks (useEffect).
 */
export function ProductPageClient({ slug }: { slug: string }) {
  useEffect(() => {
    trackProductView(slug);
  }, [slug]);

  return null;
}
