"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { universes, allProducts, articles, brands } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play } from "lucide-react";

export default function AlayaHomepage() {
  const featuredUniverses = universes.slice(0, 6);
  const insiderPicks = allProducts.filter(p => p.featured || p.bestseller).slice(0, 8);
  const latestJournal = articles.filter(a => a.featured).slice(0, 3);
  const covetedProducts = allProducts.filter(p => p.bestseller).slice(0, 4);
  const brandCollaborations = brands.filter(b => b.featured).slice(0, 5);

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* CINEMATIC HERO — Apple + Aesop inspired */}
      <section className="relative h-[100dvh] min-h-[820px] flex items-center justify-center overflow-hidden bg-[#26221E] text-[#F5F0EA]">
        <div className="absolute inset-0 bg-[radial-gradient(#3D3530_0.6px,transparent_1px)] bg-[length:3.5px_3.5px] opacity-30" />
        
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${universes[0].heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/75" />

        <div className="relative z-10 container text-center max-w-4xl px-6">
          <div className="inline-block mb-5 rounded-full border border-white/25 px-5 py-1 text-xs tracking-[3.5px] text-white/60">
            EST. 2023 • NEW YORK • LONDON • SYDNEY
          </div>
          
          <h1 className="display text-[#F5F0EA] mb-6 tracking-[-3.8px] leading-[0.9]">
            A sanctuary<br />for the<br />discerning.
          </h1>
          
          <p className="max-w-lg mx-auto text-[17px] text-white/75 mb-10 tracking-[-0.1px]">
            Thoughtfully curated objects for home, beauty, style and living.<br />Each selected with intention. Each story told with care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="accent"
              onClick={() => document.getElementById('the-edit')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Begin Exploring
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/journal">
              <Button size="lg" variant="secondary" className="border-white/40 text-white hover:bg-white/10 hover:text-white">
                Read the Journal
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating lifestyle layers */}
        <div className="absolute bottom-12 right-8 hidden xl:block">
          <div className="relative h-48 w-48 rotate-[7deg]">
            <img src={allProducts[0].images[0]} alt="" className="absolute h-40 w-40 rounded-3xl object-cover shadow-xl float-slow" style={{ top: '12px', left: '12px' }} />
            <img src={allProducts[2].images[0]} alt="" className="absolute h-40 w-40 rounded-3xl object-cover shadow-xl float-slow" style={{ top: '32px', left: '42px', animationDelay: '2.2s' }} />
          </div>
        </div>
      </section>

      {/* TRUST BAR — Quiet Confidence */}
      <div className="border-y border-[#E4DDD5] bg-[#EFE7DE] py-5">
        <div className="container flex flex-wrap justify-center gap-x-10 gap-y-2 text-center text-[11px] tracking-[2.5px] text-[#6D655F]">
          <div>HAND-PICKED WITH INTENTION</div>
          <div>EDITORIALLY VERIFIED</div>
          <div>SUSTAINABLY SOURCED</div>
        </div>
      </div>

      {/* THE EDIT — Curated Selection */}
      <section id="the-edit" className="section bg-[#F5F0EA]">
        <div className="container">
          <div className="flex items-end justify-between mb-9">
            <div>
              <div className="text-xs tracking-[3.5px] text-[#C5AA8A] font-medium mb-1">THIS WEEK’S CURATION</div>
              <h2 className="font-display text-[42px] tracking-[-1.8px]">The Edit</h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-2 text-sm text-[#C5AA8A] hover:underline">
              View all discoveries <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {insiderPicks.slice(0, 8).map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY UNIVERSE — Horizontal Circular + Editorial */}
      <section className="section bg-[#EFE7DE] border-y border-[#E4DDD5]">
        <div className="container">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[3.5px] text-[#C5AA8A] font-medium mb-1">EIGHT WORLDS OF INTENTION</div>
              <h2 className="font-display text-[42px] tracking-[-1.6px]">Explore the Universes</h2>
            </div>
            <Link href="/universes" className="hidden md:flex items-center gap-1.5 text-sm text-[#C5AA8A] hover:underline">
              See all universes <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {featuredUniverses.map((universe) => (
              <Link key={universe.slug} href={`/universes/${universe.slug}`} className="group block">
                <div className="relative aspect-[16/11] rounded-3xl overflow-hidden">
                  <img 
                    src={universe.heroImage} 
                    alt={universe.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/40 to-black/75" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                    <div className="font-display text-3xl tracking-[-0.6px] mb-1">{universe.title}</div>
                    <p className="text-white/80 text-[14px] leading-tight pr-6">{universe.subtitle}</p>
                  </div>
                  
                  <div className="absolute top-6 right-6 text-[10px] tracking-[2px] border border-white/40 px-3 py-px rounded-full text-white/70">
                    {universe.subcollections.length} WORLDS
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSIDER PICKS + CURRENTLY COVETED */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-x-12 gap-y-16">
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <div className="uppercase tracking-[3.5px] text-xs text-[#C5AA8A] mb-2">FROM THE EDITORS</div>
                <h2 className="font-display text-[52px] tracking-[-2.2px] leading-[0.96] mb-6">Insider Picks</h2>
                <p className="text-[#6D655F] max-w-sm text-[15px]">
                  The objects we’re reaching for right now. Chosen not for trends, but for the way they quietly improve our days.
                </p>
                <Link href="/search" className="mt-8 inline-flex items-center gap-2 text-sm text-[#C5AA8A] hover:underline">
                  Browse all Insider Picks <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                {covetedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS + TRENDING + EDITOR'S PICKS — As requested */}
      <section className="section bg-white border-y border-[#E4DDD5]">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* New Arrivals */}
            <div>
              <div className="text-xs tracking-[3px] text-[#C5AA8A] mb-2">JUST ARRIVED</div>
              <h3 className="font-display text-3xl tracking-tight mb-6">New Arrivals</h3>
              <div className="grid grid-cols-1 gap-5">
                {allProducts.filter(p => p.newArrival).slice(0, 3).map(p => <ProductCard key={p.id} product={p} variant="compact" />)}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <div className="text-xs tracking-[3px] text-[#C5AA8A] mb-2">WHAT PEOPLE ARE LOVING</div>
              <h3 className="font-display text-3xl tracking-tight mb-6">Trending Now</h3>
              <div className="grid grid-cols-1 gap-5">
                {allProducts.filter(p => p.bestseller).slice(0, 3).map(p => <ProductCard key={p.id} product={p} variant="compact" />)}
              </div>
            </div>

            {/* Editor's Picks */}
            <div>
              <div className="text-xs tracking-[3px] text-[#C5AA8A] mb-2">HAND SELECTED</div>
              <h3 className="font-display text-3xl tracking-tight mb-6">Editor’s Picks</h3>
              <div className="grid grid-cols-1 gap-5">
                {insiderPicks.slice(0, 3).map(p => <ProductCard key={p.id} product={p} variant="compact" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND SPOTLIGHT — Cinematic Cards */}
      <section className="section bg-[#F5F0EA] border-y border-[#E4DDD5]">
        <div className="container">
          <div className="flex items-center justify-between mb-9">
            <div>
              <div className="text-xs tracking-[3.5px] uppercase text-[#C5AA8A]">PARTNERS IN CRAFT</div>
              <h2 className="font-display text-[42px] tracking-[-1.4px]">Brand Collaborations</h2>
            </div>
            <Link href="/brands" className="hidden md:flex text-sm text-[#C5AA8A] hover:underline">Meet all brands →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {brandCollaborations.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="group rounded-3xl border border-[#E4DDD5] p-8 hover:border-[#C5AA8A] transition-all bg-white">
                <div className="font-display text-2xl tracking-tight mb-1 group-hover:text-[#C5AA8A]">{brand.name}</div>
                <div className="text-[13px] text-[#6D655F] mb-6">{brand.tagline}</div>
                <div className="text-[10px] tracking-[2px] text-[#6D655F]">{brand.country} • SINCE {brand.founded}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL SECTION — Kinfolk quality */}
      <section className="section bg-white border-y border-[#E4DDD5]">
        <div className="container">
          <div className="flex items-end justify-between mb-9">
            <div>
              <div className="uppercase tracking-[3.5px] text-xs text-[#C5AA8A]">FROM THE JOURNAL</div>
              <h2 className="font-display text-[42px] tracking-[-1.5px]">INSIDER Journal</h2>
            </div>
            <Link href="/journal" className="text-sm flex items-center gap-1.5 text-[#C5AA8A] hover:underline">
              Read the full archive <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            {latestJournal.map((article) => (
              <EditorialCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER — Premium & Minimal (final) */}
      <section className="section bg-[#26221E] text-[#F5F0EA]">
        <div className="container max-w-xl text-center">
          <div className="text-xs tracking-[3.5px] text-[#C5AA8A]">A QUIET LETTER, ONCE A WEEK</div>
          <h2 className="font-display text-[42px] mt-4 mb-4 tracking-[-1.4px]">The Alaya Letter</h2>
          <p className="text-[#B8AFA3] text-[15px]">
            A carefully written note each Sunday featuring one beautiful object, one editorial essay, and three things we’re quietly obsessed with.
          </p>

          <form className="mt-8 flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert("Thank you. You are now part of the Alaya circle."); }}>
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="input flex-1 bg-[#3D3530] border-[#524A42] text-white placeholder:text-[#8A8178]" 
              required 
            />
            <Button variant="accent" size="lg" type="submit" className="sm:w-auto">Subscribe</Button>
          </form>
          <p className="mt-4 text-[11px] text-[#8A8178]">We respect your inbox. Unsubscribe with one click.</p>
        </div>
      </section>

      {/* FINAL TRUST BAR */}
      <div className="border-t border-[#E8E2D9] py-8 bg-white">
        <div className="container flex flex-wrap justify-center gap-x-12 gap-y-2 text-center text-xs text-[#8A8178] tracking-widest">
          <div>HAND-PICKED WITH INTENTION</div>
          <div>EDITORIALLY VERIFIED</div>
          <div>SUSTAINABLY SOURCED</div>
        </div>
      </div>
    </div>
  );
}
