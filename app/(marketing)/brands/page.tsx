import Image from "next/image";
import Link from "next/link";
import { brands } from "@/lib/data/seed";

export default function BrandsPage() {
  return (
    <div className="bg-[#F5F0EA]">
      <div className="container py-16">
        <div className="max-w-2xl mb-12">
          <div className="uppercase tracking-[3px] text-xs text-[#6D5C3E]">THE BRAND VAULT</div>
          <h1 className="font-display text-7xl tracking-[-2.6px]">Partners in Craft</h1>
          <p className="mt-4 text-xl text-[#5C5249]">We only work with makers we would buy from ourselves. Each brand on this page has been visited, tested, and loved by the Alaya team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`} className="group block rounded-3xl border border-[#E8E2D9] bg-white p-8 hover:border-[#6D5C3E]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#F1EDE6] flex-shrink-0 overflow-hidden relative">
                  <Image src={brand.logo} alt={brand.name} width={48} height={48} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="font-display text-3xl tracking-tight group-hover:text-[#6D5C3E]">{brand.name}</div>
                  <div className="text-xs text-[#5C5249] tracking-widest">{brand.country} • FOUNDED {brand.founded}</div>
                </div>
              </div>

              <p className="mt-6 text-[#5C5249]">{brand.tagline}</p>
              <div className="mt-6 text-xs text-[#6D5C3E] tracking-widest flex items-center gap-2">
                {brand.productCount} OBJECTS IN THE COLLECTION <span className="text-lg leading-none">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
