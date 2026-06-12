import { notFound } from "next/navigation";
import Link from "next/link";
import { universes, subcollections, allProducts, articles } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { Button } from "@/components/ui/Button";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function UniversePage({ params }: Props) {
  const { slug } = await params;
  const universe = universes.find(u => u.slug === slug);
  
  if (!universe) return notFound();

  const universeSubs = subcollections.filter(s => s.universeSlug === slug);
  const universeProducts = allProducts.filter(p => p.universe === slug).slice(0, 12);
  const universeArticles = articles.filter(a => a.universe === slug).slice(0, 4);

  return (
    <div className="bg-[#F5F0EA]">
      {/* Cinematic Hero — Apple + Architectural Digest inspired */}
      <div className="relative h-[92vh] min-h-[640px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={universe.heroImage} 
            alt={universe.title} 
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-black/80" />
        </div>

        <div className="relative container pb-16 max-w-4xl text-white">
          <div className="uppercase tracking-[4px] text-xs mb-3 text-white/60">UNIVERSE</div>
          <h1 className="font-display text-[92px] leading-[0.86] tracking-[-4.5px] mb-4">{universe.title}</h1>
          <p className="text-2xl text-white/90 max-w-2xl">{universe.subtitle}</p>
          
          <div className="mt-9 flex flex-wrap gap-4">
            <Button variant="accent" size="lg" asChild>
              <Link href="#subcollections">Explore Subcollections</Link>
            </Button>
            <Button variant="secondary" size="lg" className="border-white/40 text-white hover:bg-white/10" asChild>
              <Link href="#journal">Read the Essay</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden lg:block text-[10px] tracking-[2px] text-white/50 border border-white/30 px-4 py-1 rounded-full">
          {universe.subcollections.length} WORLDS WITHIN
        </div>
      </div>

      <div className="container py-16 px-6 md:px-0">
        {/* Long-form Editorial Intro */}
        <div className="max-w-3xl mb-20">
          <p className="text-[19px] leading-tight text-[#2C2522] font-light">{universe.longDescription}</p>
        </div>

        {/* Subcollections — Editorial Cards */}
        <div id="subcollections" className="mb-20">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-xs tracking-[3px] text-[#C5AA8A]">EIGHT WORLDS WITHIN</div>
              <h2 className="font-display text-[42px] tracking-[-1.5px]">Subcollections</h2>
            </div>
            <div className="text-sm text-[#8A8178] hidden md:block">{universeSubs.length} intimate worlds</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universeSubs.map((sub) => {
              const subProducts = allProducts.filter(p => p.subcollectionIds.includes(sub.id)).slice(0, 3);
              return (
                <Link key={sub.slug} href={`/universes/${slug}/${sub.slug}`} className="group block rounded-3xl border border-[#E4DDD5] bg-white overflow-hidden hover:border-[#C5AA8A] transition-all">
                  <div className="aspect-[16/10] relative">
                    <img src={sub.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                    <div className="absolute bottom-0 p-7 text-white">
                      <div className="font-display text-3xl tracking-tight">{sub.title}</div>
                      <p className="text-sm text-white/80 mt-1.5">{sub.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-7 text-sm text-[#5C5249]">{sub.description}</div>
                  <div className="px-7 pb-7 text-xs text-[#C5AA8A] tracking-widest flex items-center gap-1">VIEW THIS WORLD →</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Curated Products */}
        <div className="mt-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="text-xs tracking-[3px] text-[#C5AA8A]">IN THIS UNIVERSE</div>
              <h3 className="font-display text-4xl tracking-[-1px]">Curated for {universe.title}</h3>
            </div>
            <Link href="/search" className="text-sm text-[#C5AA8A] hover:underline">View all in this universe →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {universeProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Journal from this universe — Kinfolk quality */}
        {universeArticles.length > 0 && (
          <div id="journal" className="mt-24">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="text-xs tracking-[3px] text-[#C5AA8A]">FROM THE JOURNAL</div>
                <h3 className="font-display text-4xl tracking-[-1px]">Stories from {universe.title}</h3>
              </div>
              <Link href="/journal" className="text-sm text-[#C5AA8A]">Full archive →</Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {universeArticles.map(article => (
                <EditorialCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation Teaser */}
        <div className="mt-20 bg-white border border-[#E4DDD5] rounded-3xl p-10 text-center">
          <div className="text-xs tracking-[2px] text-[#C5AA8A]">PERSONALIZED FOR YOU</div>
          <div className="font-display text-3xl tracking-tight mt-2 mb-3">Let the Alaya Concierge build your {universe.title} edit</div>
          <p className="text-[#6D655F] max-w-md mx-auto">Open the floating assistant (bottom right) for mood-based recommendations, room styling, or gift curation within this universe.</p>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return universes.map((u) => ({ slug: u.slug }));
}
