import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles } from "@/lib/data/seed";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find(a => a.slug === slug);
  
  if (!article) return notFound();

  const related = articles.filter(a => a.universe === article.universe && a.id !== article.id).slice(0, 3);

  return (
    <article className="bg-[#F5F0EA]">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[520px] flex items-end">
        <Image src={article.coverImage} alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/75" />
        
        <div className="container relative pb-16 text-white max-w-3xl">
          {article.universe && (
            <Link href={`/universes/${article.universe}`} className="text-xs tracking-[2px] text-white/70 hover:text-white mb-4 block">
              {article.universe.replace("-", " ").toUpperCase()}
            </Link>
          )}
          <h1 className="font-display text-6xl tracking-[-2.2px] leading-[0.96]">{article.title}</h1>
          {article.subtitle && <p className="mt-4 text-2xl text-white/80">{article.subtitle}</p>}
          
          <div className="mt-8 flex items-center gap-4 text-sm text-white/80">
            <span>by {article.authorName}</span>
            <span>•</span>
            <span>{article.readTime} minute read</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

        <div className="container max-w-[720px] py-16 px-6 md:px-0">
        {article.heroQuote && (
          <blockquote className="font-display text-4xl tracking-tight border-l-4 border-[#C5A26F] pl-8 text-[#2C2522] italic mb-16">
            {article.heroQuote}
          </blockquote>
        )}

        <div className="prose prose-xl max-w-none text-[#2C2522] prose-p:leading-relaxed prose-p:text-[17px]">
          {article.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Author block */}
        <div className="mt-16 pt-10 border-t border-[#E8E2D9] flex gap-6">
          <div className="w-16 h-16 rounded-full bg-[#E8E2D9] flex-shrink-0" />
          <div>
            <div className="font-medium">{article.authorName}</div>
            <div className="text-sm text-[#8A8178] mt-1">Editor at ALAYA INSIDER</div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h3 className="font-display text-3xl tracking-tight mb-8">Continue Reading</h3>
            <div className="space-y-4">
              {related.map(a => (
                <Link key={a.id} href={`/journal/${a.slug}`} className="flex gap-6 group border-b border-[#E4DDD5] pb-6 last:border-none">
                  <div className="font-display text-2xl tracking-tight group-hover:text-[#C5AA8A] transition-colors flex-1">{a.title}</div>
                  <div className="text-sm text-[#8A8178] mt-1 w-24 flex-shrink-0 text-right">{a.readTime} min</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return articles.slice(0, 50).map((a) => ({ slug: a.slug }));
}
