import { notFound } from "next/navigation";
import Link from "next/link";
import { collections, allProducts, universes } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CollectionDetail({ params }: Props) {
  const { slug } = await params;
  const collection = collections.find(c => c.slug === slug);
  
  if (!collection) return notFound();

  const products = allProducts.filter(p => collection.productIds.includes(p.id));
  // Note: Collection type does not currently include a universe field in seed. We derive a sensible related universe for editorial context (or fall back gracefully).
  const relatedUniverse = universes.find(u => products.some(p => p.universe === u.slug)) || universes[0];

  return (
    <div className="bg-[#F5F0EA]">
      {/* Hero Editorial Header */}
      <div className="border-b border-[#E4DDD5] bg-white">
        <div className="container py-14">
          <div className="flex items-center gap-2 text-xs tracking-[3px] text-[#C5AA8A] mb-3">
            {collection.type.toUpperCase()} COLLECTION
            {relatedUniverse && <> • <Link href={`/universes/${relatedUniverse.slug}`} className="hover:text-[#C5AA8A]">{relatedUniverse.title}</Link></>} 
          {/* Note: collection.universe is not in current seed type; using relatedUniverse from lookup for editorial polish */}
          </div>
          <h1 className="font-display text-[52px] tracking-[-2.4px]">{collection.title}</h1>
          <p className="mt-3 text-2xl text-[#5C5249] max-w-2xl">{collection.subtitle}</p>
        </div>
      </div>

      <div className="container py-14">
        <div className="max-w-3xl mb-10">
          <p className="text-[17px] text-[#5C5249] leading-relaxed">{collection.description}</p>
          
          <div className="mt-8 flex items-center gap-4 text-sm">
            <Button variant="accent" size="sm" asChild>
              <Link href="/search">Shop the full edit</Link>
            </Button>
            <Link href="/newsletter" className="text-[#C5AA8A] hover:underline text-sm">Get this as a gift guide →</Link>
          </div>
        </div>

        {/* Premium Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <EmptyState 
            title="This collection is being assembled" 
            description="Our editors are carefully selecting the perfect objects for this guide. Check back soon or explore other collections."
            icon="product"
            actionLabel="Browse all collections"
            actionHref="/collections"
          />
        )}

        {/* Trust / Context */}
        <div className="mt-16 pt-10 border-t border-[#E4DDD5] text-xs text-[#8A8178] tracking-widest flex flex-wrap gap-x-8 gap-y-2">
          <div>HAND-CURATED BY ALAYA EDITORS</div>
          <div>EVERY OBJECT TESTED IN REAL HOMES</div>
          <div>HAND-CURATED BY ALAYA EDITORS</div>
        </div>
      </div>
    </div>
  );
}

