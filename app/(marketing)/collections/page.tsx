import Link from "next/link";
import { collections, allProducts } from "@/lib/data/seed";

export default function CollectionsPage() {
  return (
    <div className="bg-[#F5F0EA]">
      <div className="container py-16">
        <div className="max-w-2xl mb-14">
          <div className="uppercase tracking-[3px] text-xs text-[#C5A26F]">CURATED BY ALAYA</div>
          <h1 className="font-display text-7xl tracking-[-2.6px]">Collections &amp; Gift Guides</h1>
          <p className="mt-4 text-xl text-[#5C5249]">Thoughtfully assembled groups of objects for seasons, occasions, and the people you love.</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {collections.map((collection) => {
            const collectionProducts = allProducts.filter(p => collection.productIds.includes(p.id));
            return (
              <div key={collection.id} className="rounded-3xl overflow-hidden border border-[#E8E2D9] bg-white">
                <div className="aspect-[16/9] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={collection.coverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
                  <div className="absolute bottom-0 p-9 text-white">
                    <div className="uppercase tracking-[2px] text-xs text-white/70 mb-1">{collection.type.toUpperCase()}</div>
                    <div className="font-display text-4xl tracking-[-1px]">{collection.title}</div>
                    <p className="text-white/80 mt-1">{collection.subtitle}</p>
                  </div>
                </div>
                <div className="p-9">
                  <p className="text-[#5C5249]">{collection.description}</p>
                  
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {collectionProducts.slice(0, 6).map(p => (
                      <Link key={p.id} href={`/products/${p.slug}`} className="group">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F1EDE6] mb-2 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-[#8A8178]">${p.price}</div>
                      </Link>
                    ))}
                  </div>

                  <Link href={`/collections/${collection.slug}`} className="mt-8 block text-sm text-[#C5A26F] hover:underline">View full collection →</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
