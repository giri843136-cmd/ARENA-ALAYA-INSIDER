import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { brands, allProducts } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = brands.find(b => b.slug === slug);
  
  if (!brand) return notFound();

  const brandProducts = allProducts.filter(p => p.brandId === brand.id).slice(0, 12);

  return (
    <div className="bg-[#F5F0EA]">
      <div className="container py-16">
        <div className="grid lg:grid-cols-5 gap-x-20 gap-y-10">
          {/* Left — Brand Story (Editorial) */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Link href="/brands" className="text-sm text-[#C5AA8A] mb-8 inline-block hover:underline">← All Partners in Craft</Link>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-[#E4DDD5] bg-white flex-shrink-0 relative">
                  <Image src={brand.logo} alt={brand.name} width={64} height={64} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h1 className="font-display text-6xl tracking-[-2.2px]">{brand.name}</h1>
                  <div className="text-[#8A8178] mt-1 tracking-widest text-xs">{brand.country} • FOUNDED {brand.founded}</div>
                </div>
              </div>

              <p className="text-xl text-[#5C5249]">{brand.tagline}</p>

              <div className="mt-10 prose text-[#2C2522] text-[15px] leading-relaxed">
                {brand.story}
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-xs text-[#8A8178]">
                {brand.values.map((v, i) => <span key={i} className="border border-[#E4DDD5] px-3 py-1 rounded-full">{v}</span>)}
              </div>

              <a href={brand.website} target="_blank" className="btn btn-secondary mt-10 inline-flex">Visit {brand.name} official site →</a>
            </div>
          </div>

          {/* Right — Products in Collection */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="uppercase tracking-[2px] text-xs text-[#C5AA8A]">IN THE ALAYA COLLECTION</div>
                <div className="font-display text-4xl tracking-[-1px] mt-1">{brandProducts.length} Objects</div>
              </div>
              <Link href="/search" className="text-sm text-[#C5AA8A]">See all from this maker →</Link>
            </div>

            {brandProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                {brandProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-[#8A8178]">We are currently curating the collection from this wonderful maker. Check back soon.</div>
            )}

            {/* Editorial Note */}
            <div className="mt-12 pt-8 border-t border-[#E4DDD5] text-sm text-[#6D655F]">
              Every object from {brand.name} has been personally tested and loved by the Alaya team. We only partner with makers whose work we would buy for ourselves.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
