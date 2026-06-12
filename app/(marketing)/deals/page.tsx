import Link from "next/link";
import { Tag, Clock, TrendingDown, ShoppingBag, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DEALS = [
  {
    id: "d1",
    title: "20% Off Ferm Living — Spring Edit",
    brand: "Ferm Living",
    code: "ALAYA20",
    discount: "20% off",
    expiry: "Jul 15, 2026",
    description: "Exclusive for ALAYA readers: 20% off the entire Spring 2026 collection. Including our beloved Linen Duvet Cover.",
    url: "https://example.com/ferm-spring",
    featured: true,
  },
  {
    id: "d2",
    title: "Free Shipping — The Citizen Ry",
    brand: "The Citizen Ry",
    code: "ALAYAFREE",
    discount: "Free shipping",
    expiry: "Ongoing",
    description: "Complimentary shipping on all orders over $150. The perfect time to invest in that cashmere crewneck.",
    url: "https://example.com/citizenry-free",
    featured: false,
  },
  {
    id: "d3",
    title: "15% Off First Order — August Skincare",
    brand: "August",
    code: "WELCOME15",
    discount: "15% off",
    expiry: "Aug 1, 2026",
    description: "New to August? Get 15% off your first order. Their Mulberry Silk Sleep Mask is the perfect place to start.",
    url: "https://example.com/august-welcome",
    featured: false,
  },
  {
    id: "d4",
    title: "Buy One, Get One 30% Off — Meraki Cast Iron",
    brand: "Meraki",
    code: "CASTIRON30",
    discount: "BOGO 30%",
    expiry: "Jun 30, 2026",
    description: "Stock up on the best cast iron you'll ever own. Buy one skillet, get the second at 30% off.",
    url: "https://example.com/meraki-bogo",
    featured: false,
  },
  {
    id: "d5",
    title: "$25 Off Orders $200+ — Skagerak",
    brand: "Skagerak",
    code: "SANCTUARY25",
    discount: "$25 off",
    expiry: "Jul 31, 2026",
    description: "Bring warmth into your sanctuary. $25 off orders over $200. The Wool Throw Blanket pairs beautifully.",
    url: "https://example.com/skagerak-25",
    featured: false,
  },
  {
    id: "d6",
    title: "10% Off First Purchase — HAY",
    brand: "HAY",
    code: "HAY10",
    discount: "10% off",
    expiry: "Ongoing",
    description: "Welcome to HAY. Take 10% off your first purchase from their timeless collection.",
    url: "https://example.com/hay-welcome",
    featured: false,
  },
];

export default function DealsPage() {
  const activeDeals = DEALS.filter((d) => d.expiry !== "Expired");
  const featuredDeals = activeDeals.filter((d) => d.featured);
  const standardDeals = activeDeals.filter((d) => !d.featured);

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Hero */}
      <div className="border-b border-[#E4DDD5] bg-white">
        <div className="container py-16">
          <div className="flex items-center gap-2 text-xs tracking-[3px] text-[#C5AA8A] mb-3">
            <Tag size={14} />
            EXCLUSIVE OFFERS
          </div>
          <h1 className="font-display text-[52px] tracking-[-2.4px] leading-[0.92] max-w-2xl">
            Deals Worth <span className="text-[#C5AA8A]">Discovering</span>
          </h1>
          <p className="mt-4 text-lg text-[#5C5249] max-w-xl">
            Curated offers from our partner brands. Exclusive to ALAYA INSIDER readers.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Featured Deal */}
        {featuredDeals.length > 0 && (
          <div className="mb-12">
            <div className="text-xs tracking-[2px] text-[#8A8178] mb-4 uppercase">Featured Offer</div>
            {featuredDeals.map((deal) => (
              <div key={deal.id} className="relative overflow-hidden rounded-3xl border-2 border-[#C5AA8A] bg-white p-8 md:p-12">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5AA8A]/5 rounded-bl-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[#C5AA8A]" />
                    <span className="text-[10px] tracking-[2px] text-[#C5AA8A] uppercase font-medium">Editor&apos;s Choice</span>
                  </div>
                  <h2 className="font-display text-3xl tracking-tight mb-2">{deal.title}</h2>
                  <p className="text-[#5C5249] max-w-xl mb-6">{deal.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#C5AA8A]/10 rounded-full">
                      <Tag size={14} className="text-[#C5AA8A]" />
                      <span className="font-mono text-sm font-bold tracking-wider text-[#C5AA8A]">{deal.code}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8A8178]">
                      <TrendingDown size={14} className="text-green-600" />
                      <span className="font-medium text-green-700">{deal.discount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8A8178]">
                      <Clock size={14} />
                      <span>Expires {deal.expiry}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <Button asChild>
                      <Link href={deal.url} target="_blank" rel="noopener sponsored">
                        <ShoppingBag size={14} />
                        Shop the deal
                      </Link>
                    </Button>
                    <span className="text-[10px] text-[#8A8178] tracking-wide">
                      We may earn a commission
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Deals */}
        <div className="mb-6">
          <div className="text-xs tracking-[2px] text-[#8A8178] mb-4 uppercase">All Active Offers</div>
          <div className="grid md:grid-cols-2 gap-5">
            {standardDeals.map((deal) => (
              <div key={deal.id} className="card p-6 hover:border-[#C5AA8A]/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-[#C5AA8A] tracking-wider font-medium">{deal.brand}</div>
                    <h3 className="font-display text-lg tracking-tight mt-0.5">{deal.title}</h3>
                  </div>
                  <div className="flex-shrink-0 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-medium text-green-700 tracking-wider">
                    {deal.discount}
                  </div>
                </div>
                <p className="text-sm text-[#5C5249] mb-4">{deal.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#EFE7DE] rounded text-[11px] font-mono font-medium tracking-wider">
                      {deal.code}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#8A8178]">
                      <Clock size={10} />
                      {deal.expiry}
                    </div>
                  </div>
                  <Link
                    href={deal.url}
                    target="_blank"
                    rel="noopener sponsored"
                    className="text-xs text-[#C5AA8A] hover:underline font-medium"
                  >
                    Shop →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust + FAQ */}
        <div className="mt-16 pt-10 border-t border-[#E4DDD5]">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xs tracking-[2px] text-[#8A8178] mb-3">
                <ShieldCheck size={14} className="text-[#C5AA8A]" />
                HOW THIS WORKS
              </div>
              <p className="text-sm text-[#5C5249] leading-relaxed">
                These deals are exclusive partnerships between ALAYA INSIDER and our trusted brands.
                When you use our codes, you support our editorial independence at no extra cost to you.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs tracking-[2px] text-[#8A8178] mb-3">
                <Clock size={14} className="text-[#C5AA8A]" />
                EXPIRATION POLICY
              </div>
              <p className="text-sm text-[#5C5249] leading-relaxed">
                Deal codes are subject to brand terms and may end without notice.
                We update this page weekly. Always check the brand site for the most current offer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
