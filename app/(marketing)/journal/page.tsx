import { articles } from "@/lib/data/seed";
import { EditorialCard } from "@/components/editorial/EditorialCard";

export default function JournalIndex() {
  const featured = articles.filter(a => a.featured);
  const recent = articles.filter(a => !a.featured).slice(0, 18);

  return (
    <div className="bg-[#F5F0EA]">
      <div className="container py-16">
        <div className="max-w-2xl">
          <div className="uppercase tracking-[4px] text-xs text-[#C5AA8A]">THE ALAYA INSIDER JOURNAL</div>
          <h1 className="font-display text-[52px] tracking-[-2.6px] leading-[0.92] mt-2">Stories that stay with you.</h1>
          <p className="mt-4 text-xl text-[#5C5249]">
            Long-form essays, quiet observations, and deep dives into the objects and rituals that shape a considered life.
          </p>
        </div>

        {/* Featured */}
        <div className="mt-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featured.slice(0, 2).map(article => (
              <EditorialCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* All Articles */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-4xl tracking-tight">Recent Essays</h2>
            <div className="text-sm text-[#8A8178]">{articles.length} pieces in the archive</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {recent.map(article => (
              <EditorialCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
