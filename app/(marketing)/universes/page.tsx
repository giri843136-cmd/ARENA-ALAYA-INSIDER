"use client";

import Image from "next/image";
import Link from "next/link";
import { universes } from "@/lib/data/seed";
import { Button } from "@/components/ui/Button";

export default function UniversesPage() {
  return (
    <div className="bg-[#F5F0EA]">
      {/* Hero */}
      <div className="container py-20 max-w-3xl">
        <div className="uppercase tracking-[3px] text-xs text-[#6D5C3E] mb-3">EIGHT WORLDS OF INTENTION</div>
        <h1 className="font-display text-7xl tracking-[-3px]">The Universes</h1>
        <p className="mt-4 text-xl text-[#5C5249] leading-relaxed">
          Each universe is a complete world of intention. Enter any one and discover objects, rituals, and stories that belong together. Thoughtfully grouped. Quietly powerful.
        </p>
      </div>

      {/* Full Editorial Grid of Universes */}
      <div className="container pb-20 px-6 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {universes.map((universe, index) => (
            <Link key={universe.slug} href={`/universes/${universe.slug}`} className="group block">
              <div className="relative h-[520px] rounded-3xl overflow-hidden border border-[#E4DDD5]">
                <Image 
                  src={universe.heroImage} 
                  alt={universe.title}
                  fill
                  sizes="50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/85" />
                
                <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
                  <div className="uppercase tracking-[3px] text-xs text-white/60 mb-2">{universe.subcollections.length} SUBCOLLECTIONS</div>
                  <div className="font-display text-6xl tracking-[-2.2px] mb-3">{universe.title}</div>
                  <p className="max-w-md text-lg text-white/85 leading-tight">{universe.subtitle}</p>
                  
                  <div className="mt-8 inline-flex items-center gap-2 text-sm text-[#6D5C3E] group-hover:gap-3 transition-all tracking-widest">
                    ENTER THIS UNIVERSE <span>→</span>
                  </div>
                </div>

                <div className="absolute top-8 right-8 text-[10px] tracking-[2px] border border-white/30 px-4 py-px rounded-full text-white/70">
                  {index + 1} OF 8
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA + Trust */}
      <div className="border-t border-[#E4DDD5] bg-white py-16">
        <div className="container text-center max-w-md">
          <div className="text-xs tracking-[3px] text-[#6D5C3E]">NOT SURE WHERE TO BEGIN?</div>
          <div className="font-display text-3xl tracking-tight mt-2 mb-4">Let our AI Concierge guide you</div>
          <p className="text-[#6D655F]">Open the floating assistant in the bottom right for personalized universe recommendations based on your mood, season, or home.</p>
          <Button variant="accent" className="mt-8" onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}>
            Open Command Palette
          </Button>
        </div>
      </div>
    </div>
  );
}
