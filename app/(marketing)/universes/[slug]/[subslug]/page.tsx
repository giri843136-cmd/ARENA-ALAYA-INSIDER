import { notFound } from "next/navigation";
import Link from "next/link";
import { universes, subcollections, allProducts, articles } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { EditorialCard } from "@/components/editorial/EditorialCard";

interface Props {
  params: Promise<{ slug: string; subslug: string }>;
}

export default async function SubcollectionPage({ params }: Props) {
  const { slug, subslug } = await params;

  const universe = universes.find(u => u.slug === slug);
  const subcollection = subcollections.find(s => s.slug === subslug && s.universeSlug === slug);

  if (!universe || !subcollection) return notFound();

  const subProducts = allProducts.filter(p => p.subcollectionIds.includes(subcollection.id));
  const subArticles = articles.filter(a => a.universe === slug).slice(0, 3);

  return (
    <div className="bg-[#F5F0EA]">
      <div className="container pt-10 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#8A8178] mb-8">
          <Link href="/universes" className="hover:text-[#C5A26F]">Universes</Link>
          <span>/</span>
          <Link href={`/universes/${slug}`} className="hover:text-[#C5A26F]">{universe.title}</Link>
          <span>/</span>
          <span className="text-[#2C2522]">{subcollection.title}</span>
        </div>

        <div className="max-w-3xl">
          <div className="uppercase tracking-[3px] text-xs text-[#C5A26F] mb-2">SUBCOLLECTION</div>
          <h1 className="font-display text-7xl tracking-[-2.8px]">{subcollection.title}</h1>
          <p className="mt-3 text-2xl text-[#5C5249]">{subcollection.subtitle}</p>
        </div>

        <div className="mt-8 max-w-2xl text-lg text-[#2C2522]">
          {subcollection.description}
        </div>

        {/* Products in this subcollection */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="font-medium tracking-widest text-xs text-[#C5A26F]">THE COLLECTION</div>
            <div className="text-xs text-[#8A8178]">{subProducts.length} objects</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {subProducts.length > 0 ? (
              subProducts.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-4 text-[#8A8178] py-12">This subcollection is being thoughtfully assembled. Check back soon.</div>
            )}
          </div>
        </div>

        {/* Related reading */}
        {subArticles.length > 0 && (
          <div className="mt-20">
            <h3 className="font-display text-3xl tracking-tight mb-8">Related Reading from {universe.title}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {subArticles.map(article => (
                <EditorialCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
