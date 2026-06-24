import { notFound } from "next/navigation";
import Link from "next/link";
import { allProducts, brands, reviews, faqs, articles } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductSchema, FAQSchema } from "@/components/ui/ProductSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EditorBadge } from "@/components/ui/EditorBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { PriceHistory } from "@/components/ui/PriceHistory";
import { MultiRetailerPrice } from "@/components/ui/MultiRetailerPrice";
import { MobileCompareBar } from "@/components/ui/MobileCompareBar";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { StickyPriceBar } from "@/components/product/StickyPriceBar";
import { SocialProof } from "@/components/product/SocialProof";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SaveToWishlistButton } from "@/components/product/SaveToWishlistButton";
import { ProductKeyboardShortcuts } from "@/components/product/ProductKeyboardShortcuts";
import { ProductPageClient } from "./ProductPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) return notFound();

  const brand = brands.find(b => b.id === product.brandId);
  const productReviews = reviews.filter(r => r.productId === product.id);
  const relatedProducts = allProducts.filter(p => 
    p.universe === product.universe && p.id !== product.id
  ).slice(0, 8);
  const journalTieIns = articles.filter(a => 
    a.universe === product.universe || a.title.toLowerCase().includes(product.name.toLowerCase().split(' ')[0])
  ).slice(0, 3);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const reviewedDate = new Date(product.publishedAt);
  const lastReviewed = reviewedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main className="bg-[#F5F0EA]">
      {/* JSON-LD Structured Data */}
      <ProductSchema product={product} brand={brand} reviews={productReviews} />
      <FAQSchema faqs={faqs.slice(0, 5)} />

      {/* Breadcrumbs */}
      <div className="container pt-6 px-6 md:px-0">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: (product.universe || "").replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()), href: `/universes/${product.universe}` },
            { name: product.name, href: `/products/${product.slug}` },
          ]}
        />
      </div>

      {/* HERO + LUXURY GALLERY — Cinematic, Apple + C-Style inspired */}
      <div className="container pt-6 pb-12 px-6 md:px-0">
        <div className="grid lg:grid-cols-2 gap-x-20 gap-y-12">
          {/* Left: Premium Gallery — Lightbox with zoom + navigation */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Right: Sticky Purchase Card — Luxurious & Functional */}
          <div id="purchase-card" className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white border border-[#E4DDD5] rounded-3xl p-9">
              {/* Brand + Universe */}
              <div className="flex items-center gap-3 text-sm text-[#8A8178] mb-3 tracking-[1px]">
                <Link href={`/brands/${brand?.slug}`} className="hover:text-[#C5AA8A] transition-colors font-medium">
                  {product.brandName}
                </Link>
                <span>•</span>
                <Link href={`/universes/${product.universe}`} className="uppercase tracking-[2px] text-xs hover:text-[#C5AA8A]">
                  {product.universe.replace('-', ' ')}
                </Link>
              </div>

              {/* Editor Badges */}
              {product.bestseller && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <EditorBadge type="editors-pick" size="sm" />
                  {product.bestseller && <EditorBadge type="bestseller" size="sm" />}
                  {hasDiscount && <EditorBadge type="best-value" size="sm" />}
                </div>
              )}

              <h1 className="font-display text-[46px] leading-[0.92] tracking-[-2.4px] mb-4 text-[#26221E]">
                {product.name}
              </h1>

              {/* Price + Discount */}
              <div className="flex items-baseline gap-4 mb-6">
                <PriceDisplay usdAmount={product.price} className="text-[42px] font-medium tabular-nums tracking-[-1.5px] text-[#26221E]" />
                {hasDiscount && (
                  <span className="text-2xl text-[#8A8178] line-through tabular-nums">
                    ${product.originalPrice}
                  </span>
                )}
                {hasDiscount && (
                  <div className="ml-auto badge badge-gold text-xs">SAVE {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%</div>
                )}
              </div>

              {/* Rating + Trust */}
              <div className="flex items-center gap-4 mb-8 text-sm">
                <div className="flex items-center text-[#C5AA8A]">
                  {"★".repeat(Math.floor(product.rating || 4.8))}
                </div>
                <div className="text-[#6D655F]">
                  {product.rating || 4.8} — {product.reviewCount || 142} reviews
                </div>
                <EditorBadge type="editors-pick" size="sm" />
              </div>

              {/* Social Proof — Live viewer count */}
              <SocialProof popularity={product.bestseller ? "trending" : product.rating && product.rating > 4.7 ? "high" : "medium"} />

              {/* Last reviewed date */}
              <div className="text-[10px] tracking-[1.5px] text-[#8A8178] mt-3 mb-6">
                Last reviewed {lastReviewed} • Prices and availability may vary
              </div>

              <p className="text-[15px] leading-relaxed text-[#5C5249] mb-8">
                {product.description}
              </p>

              {/* Sticky CTA — Interactive */}
              <div className="mb-8">
                <ProductActions product={product} />
              </div>

              {/* Premium Trust Facts — Hairline grid */}
              <div className="grid grid-cols-2 gap-px bg-[#E4DDD5] rounded-2xl overflow-hidden text-sm mb-8">
                <div className="bg-white px-6 py-4 border-b border-[#E4DDD5]">
                  <div className="text-[10px] tracking-[1.5px] text-[#8A8178]">AVAILABILITY</div>
                  <div className="font-medium text-[#26221E] mt-0.5">{product.inStock ? "In stock • Ships today" : "Limited • Ships in 7–10 days"}</div>
                </div>
                <div className="bg-white px-6 py-4 border-b border-[#E4DDD5]">
                  <div className="text-[10px] tracking-[1.5px] text-[#8A8178]">ORIGIN</div>
                  <div className="font-medium text-[#26221E] mt-0.5">Made in {brand?.country || "Portugal"}</div>
                </div>
                <div className="bg-white px-6 py-4">
                  <div className="text-[10px] tracking-[1.5px] text-[#8A8178]">SHIPPING</div>
                  <div className="font-medium text-[#26221E] mt-0.5">Signature delivery • 2–5 days</div>
                </div>
                <div className="bg-white px-6 py-4">
                  <div className="text-[10px] tracking-[1.5px] text-[#8A8178]">GUARANTEE</div>
                  <div className="font-medium text-[#26221E] mt-0.5">90-day happiness • Easy returns</div>
                </div>
              </div>

              {/* Multi-Retailer Price Comparison */}
              {product.affiliateLinks && product.affiliateLinks.length > 1 && (
                <div className="mt-6">
                  <MultiRetailerPrice
                    productPrice={product.price}
                    retailers={product.affiliateLinks.map(l => ({
                      network: l.network,
                      url: l.url,
                      label: l.label,
                    }))}
                  />
                </div>
              )}

              {/* Affiliate Trust Line */}
              {product.affiliateLinks?.length > 0 && (
                <div className="text-[10px] tracking-[1.5px] text-[#8A8178] border-t border-[#E4DDD5] pt-5">
                  Available via {product.affiliateLinks[0].network} • We may earn a commission.{" "}
                  <Link href="/affiliate-disclosure" className="underline hover:text-[#C5AA8A]">Learn more</Link>
                </div>
              )}
            </div>

            {/* Quick compare / wishlist actions */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href={`/compare?add=${product.slug}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E4DDD5] bg-white px-4 py-3 text-xs font-medium text-[#5C5249] hover:border-[#7A6848] hover:text-[#7A6848] transition-all"
              >
                + Add to Compare
              </Link>
              <SaveToWishlistButton
                slug={product.slug}
                name={product.name}
                price={product.price}
                image={product.images[0]}
                brandName={product.brandName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LONG DESCRIPTION + WHY WE RECOMMEND — Kinfolk editorial */}
      <div className="border-y border-[#E4DDD5] bg-white py-16">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A] mb-2">THE STORY</div>
            <h2 className="font-display text-[42px] tracking-[-1.6px]">Why ALAYA Recommends</h2>
          </div>

          <div className="prose prose-lg max-w-3xl text-[#5C5249] leading-relaxed">
            {product.longDescription}
          </div>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-10 mt-16 pt-12 border-t border-[#E4DDD5]">
            <div>
              <div className="uppercase text-[10px] tracking-[2px] text-[#C5AA8A] mb-4">WHY WE LOVE IT</div>
              <ul className="space-y-3 text-[15px] text-[#5C5249]">
                {product.whyWeLove.map((item, i) => (
                  <li key={i} className="flex gap-3">→ {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="uppercase text-[10px] tracking-[2px] text-[#C5AA8A] mb-4">THE PROS</div>
              <ul className="space-y-3 text-[15px] text-[#5C5249]">
                {product.pros.map((item, i) => (
                  <li key={i} className="flex gap-3">✓ {item}</li>
                ))}
              </ul>
            </div>
            {product.cons.length > 0 && (
              <div>
                <div className="uppercase text-[10px] tracking-[2px] text-[#C5AA8A] mb-4">CONSIDERATIONS</div>
                <ul className="space-y-3 text-[15px] text-[#5C5249]">
                  {product.cons.map((item, i) => (
                    <li key={i} className="flex gap-3">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PERFECT FOR + PRICE HISTORY + COMPARE */}
      <div className="container py-16">
        <div className="grid lg:grid-cols-12 gap-x-16 gap-y-14">
          {/* Perfect For */}
          <div className="lg:col-span-5">
            <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A] mb-3">INTENTION</div>
            <h3 className="font-display text-4xl tracking-[-1px] mb-6">Perfect For</h3>
            <div className="flex flex-wrap gap-2.5">
              {product.perfectFor.map((pf, i) => (
                <div key={i} className="rounded-full border border-[#E4DDD5] bg-white px-6 py-2 text-sm tracking-tight">
                  {pf}
                </div>
              ))}
            </div>
          </div>

          {/* Price History — Premium with alerts */}
          <div className="lg:col-span-7">
            <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A] mb-3">PRICE INTELLIGENCE</div>
            <h3 className="font-display text-4xl tracking-[-1px] mb-6">Price History</h3>
            <PriceHistory
              currentPrice={product.price}
              originalPrice={product.originalPrice}
              productName={product.name}
            />
          </div>
        </div>

        {/* Compare with similar — elegant table */}
        <div className="mt-16 pt-12 border-t border-[#E4DDD5]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A]">SIDE BY SIDE</div>
              <h3 className="font-display text-4xl tracking-[-1px]">Compare Alternatives</h3>
            </div>
            <Link href="/search" className="text-sm text-[#C5AA8A] hover:underline">See full comparison tool →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[#E4DDD5] rounded-2xl overflow-hidden">
              <thead className="bg-[#EFE7DE]">
                <tr>
                  <th className="text-left p-5 font-medium tracking-widest text-xs text-[#8A8178]">FEATURE</th>
                  <th className="text-left p-5 font-medium tracking-widest text-xs text-[#C5AA8A]">{product.name}</th>
                  {relatedProducts.slice(0, 3).map((p, i) => (
                    <th key={i} className="text-left p-5 font-medium tracking-widest text-xs text-[#8A8178]">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E4DDD5]">
                {["Price", "Material", "Origin", "Rating", "In Stock"].map((feature, idx) => (
                  <tr key={idx}>
                    <td className="p-5 font-medium text-[#26221E]">{feature}</td>
                    <td className="p-5 font-medium text-[#C5AA8A]">
                      {idx === 0 && `$${product.price}`}
                      {idx === 1 && ((product as any).color || "Premium linen")}
                      {idx === 2 && (brand?.country || "Europe")}
                      {idx === 3 && (product.rating || 4.8)}
                      {idx === 4 && (product.inStock ? "Yes" : "Limited")}
                    </td>
                    {relatedProducts.slice(0, 3).map((p, i) => (
                      <td key={i} className="p-5 text-[#6D655F]">
                        {idx === 0 && `$${p.price}`}
                        {idx === 1 && (p.color || "Natural")}
                        {idx === 2 && "Various"}
                        {idx === 3 && (p.rating || 4.7)}
                        {idx === 4 && (p.inStock ? "Yes" : "Pre-order")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REVIEWS — Polished Kinfolk quality */}
      {productReviews.length > 0 && (
        <div className="bg-white border-y border-[#E4DDD5] py-16">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A]">READERS</div>
                <h2 className="font-display text-[42px] tracking-[-1.5px]">What Our Readers Say</h2>
              </div>
              <Link href="#reviews" className="hidden sm:block text-sm text-[#C5AA8A]">Read all {productReviews.length} reviews →</Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {productReviews.slice(0, 4).map(review => (
                <div key={review.id} className="card p-9">
                  <div className="flex text-[#C5AA8A] mb-4 text-lg">{"★".repeat(review.rating)}</div>
                  <div className="font-display text-2xl tracking-tight mb-5">“{review.title}”</div>
                  <p className="text-[#5C5249] leading-relaxed text-[15px]">{review.body}</p>
                  <div className="mt-8 flex items-center justify-between text-sm border-t border-[#E4DDD5] pt-5">
                    <div>
                      <span className="font-medium text-[#26221E]">{review.authorName}</span>
                      {review.verified && <span className="ml-2 text-[10px] tracking-[1.5px] text-[#C5AA8A]">VERIFIED</span>}
                    </div>
                    <span className="text-[#8A8178] text-xs tracking-widest">2 MONTHS AGO</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI + JOURNAL TIE-INS + FAQ */}
      <div className="container py-16">
        <div className="grid lg:grid-cols-12 gap-x-16">
          {/* Journal Tie-ins */}
          <div className="lg:col-span-7 mb-14 lg:mb-0">
            <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A] mb-2">FROM THE JOURNAL</div>
            <h3 className="font-display text-4xl tracking-[-1px] mb-8">Stories that inspired this piece</h3>
            
            {journalTieIns.length > 0 ? (
              <div className="space-y-6">
                {journalTieIns.map(article => (
                  <Link key={article.id} href={`/journal/${article.slug}`} className="block group border-b border-[#E4DDD5] pb-6 last:border-none last:pb-0">
                    <div className="font-display text-2xl tracking-tight group-hover:text-[#C5AA8A] transition-colors">{article.title}</div>
                    <p className="text-[#6D655F] mt-2 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-3 text-xs text-[#C5AA8A] tracking-widest">READ ESSAY →</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#8A8178]">Related essays will appear here once published.</p>
            )}
          </div>

          {/* FAQ */}
          <div className="lg:col-span-5">
            <div className="uppercase tracking-[3px] text-xs text-[#C5AA8A] mb-3">QUESTIONS</div>
            <h3 className="font-display text-4xl tracking-[-1px] mb-8">Frequently Asked</h3>
            
            <div className="space-y-1">
              {(faqs.length > 0 ? faqs : [
                {question: "Is this product made sustainably?", answer: "Yes. We only partner with makers who meet our rigorous standards for ethics and materials."},
                {question: "What is the return policy?", answer: "90 days. Full refund or exchange with no questions."},
                {question: "Can I speak with a stylist?", answer: "Yes — open the AI Concierge in the bottom right or book a virtual appointment."}
              ]).slice(0, 5).map((faq, i) => (
                <details key={i} className="group border-b border-[#E4DDD5] py-5 last:border-none">
                  <summary className="font-medium cursor-pointer list-none flex justify-between text-[#26221E] hover:text-[#C5AA8A]">
                    {faq.question}
                    <span className="text-[#C5AA8A] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-[#5C5249] text-[15px] leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS — Full editorial grid */}
      <div className="border-t border-[#E4DDD5] bg-white py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-9">
            <div>
              <div className="text-xs tracking-[3px] text-[#C5AA8A]">MORE FROM THIS UNIVERSE</div>
              <h3 className="font-display text-[38px] tracking-[-1.2px]">You Might Also Love</h3>
            </div>
            <Link href={`/universes/${product.universe}`} className="text-sm text-[#C5AA8A] hover:underline">Browse the full universe →</Link>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Recently Viewed — Horizontal carousel from localStorage */}
      <RecentlyViewed currentProductSlug={product.slug} />

      {/* Mobile sticky compare bar */}
      <MobileCompareBar
        productName={product.name}
        productPrice={product.price}
        productSlug={product.slug}
        primaryUrl={product.affiliateLinks?.[0]?.url}
      />

      {/* Sticky Price Bar — Appears on scroll past purchase section */}
      <StickyPriceBar product={product} affiliateUrl={product.affiliateLinks?.[0]?.url} />

      {/* FINAL TRUST + AI PROMPT */}
      <div className="container pb-16 pt-12 text-center text-sm text-[#8A8178]">
        Still deciding? Open the <span className="font-medium text-[#C5AA8A]">Alaya Concierge</span> (bottom right) for personalized styling advice, room visualizations, or gift recommendations.
      </div>

      {/* Keyboard shortcuts indicator */}
      <ProductKeyboardShortcuts
        slug={product.slug}
        name={product.name}
        price={product.price}
        image={product.images[0]}
        brandName={product.brandName}
        affiliateUrl={product.affiliateLinks?.[0]?.url}
        compareUrl={`/compare?add=${product.slug}`}
      />

      {/* Track product view for Recently Viewed */}
      <ProductPageClient slug={product.slug} />
    </main>
  );
}

export async function generateStaticParams() {
  return allProducts.slice(0, 80).map((p) => ({ slug: p.slug }));
}
