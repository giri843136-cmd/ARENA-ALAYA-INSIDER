import type { Metadata } from "next";
import { WishlistPageClient } from "./WishlistPageClient";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Your saved products and curated discoveries on ALAYA INSIDER.",
};

export default function WishlistPage() {
  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Header */}
      <div className="container pt-24 pb-12 px-6 md:px-0">
        <div className="max-w-3xl">
          <div className="text-xs tracking-[2.5px] text-[#C5AA8A] mb-2">SAVED FOR LATER</div>
          <h1 className="font-display text-[42px] tracking-[-1.5px] text-[#26221E]">Your Wishlist</h1>
          <p className="text-[#5C5249] mt-3 max-w-md text-[15px] leading-relaxed">
            Products you&apos;ve saved for future inspiration. Curated with intention — remove anything that no longer speaks to you.
          </p>
        </div>
      </div>

      {/* Client-side wishlist content */}
      <WishlistPageClient />
    </div>
  );
}
