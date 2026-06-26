"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { universes, allProducts, articles, brands } from "@/lib/data/seed";
import { ProductCard } from "@/components/product/ProductCard";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DealCountdown } from "@/components/ui/DealCountdown";
import { toast } from "sonner";

export default function AlayaHomepage() {
  const featuredUniverses = universes.slice(0, 6);
  const insiderPicks = allProducts.filter(p => p.featured || p.bestseller).slice(0, 8);
  const latestJournal = articles.filter(a => a.featured).slice(0, 3);
  const covetedProducts = allProducts.filter(p => p.bestseller).slice(0, 4);
  const brandCollaborations = brands.filter(b => b.featured).slice(0, 5);

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* CINEMATIC HERO — Apple + Aesop inspired */}
      <section className="relative h-[100dvh] min-h-[820px] flex items-center justify-center overflow-hidden bg-[#26221E] text-[#F5F0EA]" aria-label="Hero banner">
        <div className="absolute inset-0 bg-[radial-gradient(#3D3530_0.6px,transparent_1px)] bg-[length:3.5px_3.5px] opacity-30" />
        
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${universes[0].heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/75" />

        <div className="relative z-10 container text-center max-w-4xl px-6">

          
          <h1 className="display mb-6 tracking-[-3.8px] leading-[0.9]" style={{color:'#F5F0EA'}}>
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
            <Image src={allProducts[0].images[0]} alt="" width={160} height={160} className="absolute rounded-3xl object-cover shadow-xl float-slow" style={{ top: '12px', left: '12px', width: '160px', height: '160px' }} />
            <Image src={allProducts[2].images[0]} alt="" width={160} height={160} className="absolute rounded-3xl object-cover shadow-xl float-slow" style={{ top: '32px', left: '42px', width: '160px', height: '160px', animationDelay: '2.2s' }} />
          </div>
        </div>
      </section>

      {/* TRUST BAR — Quiet Confidence */}
      <div className="border-y border-[#E4DDD5] bg-[#EFE7DE] py-5" role="region" aria-label="Editorial trust badges">
        <div className="container flex flex-wrap justify-center gap-x-10 gap-y-2 text-center text-[11px] tracking-[2.5px] text-[#3D352F]">
          <div>HAND-PICKED WITH INTENTION</div>
          <div>EDITORIALLY VERIFIED</div>
          <div>SUSTAINABLY SOURCED</div>
        </div>
      </div>

      {/* THE EDIT — Curated Selection */}
      <section id="the-edit" className="section bg-[#F5F0EA]" aria-label="This week's curated selection">
        <div className="container">
          <div className="flex items-end justify-between mb-9">
            <div>
              <div className="text-xs tracking-[3.5px] text-[#6D5C3E] font-medium mb-1">THIS WEEK’S CURATION</div>
              <h2 className="font-display text-[42px] tracking-[-1.8px]">The Edit</h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-2 text-sm text-[#6D5C3E] hover:underline">
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
              <div className="text-xs tracking-[3.5px] text-[#6D5C3E] font-medium mb-1">EIGHT WORLDS OF INTENTION</div>
              <h2 className="font-display text-[42px] tracking-[-1.6px]">Explore the Universes</h2>
            </div>
            <Link href="/universes" className="hidden md:flex items-center gap-1.5 text-sm text-[#6D5C3E] hover:underline">
              See all universes <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {featuredUniverses.map((universe) => (
              <Link key={universe.slug} href={`/universes/${universe.slug}`} className="group block">
                <div className="relative aspect-[16/11] rounded-3xl overflow-hidden">
                  { }
                  <Image 
                    src={universe.heroImage} 
                    alt={universe.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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
                <div className="uppercase tracking-[3.5px] text-xs text-[#6D5C3E] mb-2">FROM THE EDITORS</div>
                <h2 className="font-display text-[52px] tracking-[-2.2px] leading-[0.96] mb-6">Insider Picks</h2>
                <p className="text-[#4D443B] max-w-sm text-[15px]">
                  The objects we’re reaching for right now. Chosen not for trends, but for the way they quietly improve our days.
                </p>
                <Link href="/search" className="mt-8 inline-flex items-center gap-2 text-sm text-[#6D5C3E] hover:underline">
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

      {/* NEW ARRIVALS + TRENDING + EDITOR'S PICKS — Horizontal scrolling sections */}
      <section className="section bg-white border-y border-[#E4DDD5]">
        <div className="container">
          {/* New Arrivals — Horizontal Row */}
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-xs tracking-[3px] text-[var(--accent-gold,#6D5C3E)] mb-1">JUST ARRIVED</div>
                <h3 className="font-display text-3xl tracking-tight">New Arrivals</h3>
              </div>
              <Link href="/search?sort=newest" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--accent-gold,#6D5C3E)] hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{scrollbarWidth:'thin'}}>
              {allProducts.filter(p => p.newArrival).slice(0, 8).map((p, i) => (
                <motion.div key={p.id} className="flex-shrink-0 w-[280px] sm:w-[300px]" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProductCard product={p} variant="compact" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trending Now — Horizontal Row */}
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-xs tracking-[3px] text-[var(--accent-gold,#6D5C3E)] mb-1">WHAT PEOPLE ARE LOVING</div>
                <h3 className="font-display text-3xl tracking-tight">Trending Now</h3>
              </div>
              <Link href="/search?sort=trending" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--accent-gold,#6D5C3E)] hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{scrollbarWidth:'thin'}}>
              {allProducts.filter(p => p.bestseller).slice(0, 8).map((p, i) => (
                <motion.div key={p.id} className="flex-shrink-0 w-[280px] sm:w-[300px]" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProductCard product={p} variant="compact" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Editor's Picks — Horizontal Row */}
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-xs tracking-[3px] text-[var(--accent-gold,#6D5C3E)] mb-1">HAND SELECTED BY OUR EDITORS</div>
                <h3 className="font-display text-3xl tracking-tight">Editor’s Picks</h3>
              </div>
              <Link href="/search?sort=top-rated" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--accent-gold,#6D5C3E)] hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{scrollbarWidth:'thin'}}>
              {insiderPicks.slice(0, 8).map((p, i) => (
                <motion.div key={p.id} className="flex-shrink-0 w-[280px] sm:w-[300px]" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOT DEALS — Limited-Time Offers */}
      <section className="section bg-[#26221E] text-[#F5F0EA]">
        <div className="container">
          <div className="flex items-end justify-between mb-9">
            <div>                    <div className="text-xs tracking-[3.5px] text-[#D4B88A] font-medium mb-1">LIMITED TIME</div>
                    <h2 className="font-display text-[42px] tracking-[-1.8px]" style={{color:'#F5F0EA'}}>Hot Deals</h2>
            </div>
            <Link href="/deals" className="hidden sm:flex items-center gap-2 text-sm text-[#D4B88A] hover:underline">
              View all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {allProducts.filter(p => p.bestseller || (p.originalPrice && p.originalPrice > p.price)).slice(0, 4).map((product, index) => {
              const discount = Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group relative rounded-3xl overflow-hidden border border-[#3D3530] bg-[#1A1714] hover:bg-[#22201C] transition-all">
                  <Link href={`/products/${product.slug}`} className="block p-6">
                    {/* Deal header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-flex items-center gap-1 rounded-full bg-rose-600/20 border border-rose-500/30 px-3 py-0.5 text-[10px] font-medium tracking-[1.5px] text-rose-400">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                        -{discount}% OFF
                      </div>
                      <div className="text-[10px] text-[#D4B88A] font-mono tracking-wider">
                        <DealCountdown index={index} />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#26221E] mb-4 relative">
                      <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>

                    {/* Info */}
                    <div className="text-[11px] tracking-[2px] text-[#A1A1A1] mb-1">{product.brandName}</div>
                    <h3 className="font-display text-lg tracking-[-0.3px] mb-2 line-clamp-1 group-hover:text-[#D4B88A] transition-colors" style={{color:'#F5F0EA'}}>{product.name}</h3>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-medium tabular-nums text-[#D4B88A]"><PriceDisplay usdAmount={product.price} /></span>
                      {product.originalPrice && (
                        <span className="text-sm text-[#A1A1A1] line-through tabular-nums"><PriceDisplay usdAmount={product.originalPrice} /></span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/deals" className="inline-flex items-center gap-2 text-sm text-[#D4B88A] hover:underline">
              Browse all limited-time offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BRAND SPOTLIGHT — Cinematic Cards */}
      <section className="section bg-[#F5F0EA] border-y border-[#E4DDD5]">
        <div className="container">
          <div className="flex items-center justify-between mb-9">
            <div>
              <div className="text-xs tracking-[3.5px] uppercase text-[#6D5C3E]">PARTNERS IN CRAFT</div>
              <h2 className="font-display text-[42px] tracking-[-1.4px]">Brand Collaborations</h2>
            </div>
            <Link href="/brands" className="hidden md:flex text-sm text-[#6D5C3E] hover:underline">Meet all brands →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {brandCollaborations.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="group rounded-3xl border border-[#E4DDD5] p-8 hover:border-[#B89B7A] transition-all bg-white">
                <div className="font-display text-2xl tracking-tight mb-1 group-hover:text-[#6D5C3E]">{brand.name}</div>
                <div className="text-[13px] text-[#4D443B] mb-6">{brand.tagline}</div>
                <div className="text-[10px] tracking-[2px] text-[#4D443B]">{brand.country} • SINCE {brand.founded}</div>
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
              <div className="uppercase tracking-[3.5px] text-xs text-[#6D5C3E]">FROM THE JOURNAL</div>
              <h2 className="font-display text-[42px] tracking-[-1.5px]">INSIDER Journal</h2>
            </div>
            <Link href="/journal" className="text-sm flex items-center gap-1.5 text-[#6D5C3E] hover:underline">
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

      {/* CROSS-SELL — Complete the Look / Frequently Bought Together */}
      <section className="section bg-[#EFE7DE] border-y border-[#E4DDD5]">
        <div className="container">
          <div className="flex items-end justify-between mb-9">
            <div>
              <div className="text-xs tracking-[3.5px] text-[#4D443B] font-medium mb-1">CURATED TOGETHER</div>
              <h2 className="font-display text-[42px] tracking-[-1.8px]">Complete the Look</h2>
            </div>
            <Link href="/collections" className="hidden sm:flex items-center gap-2 text-sm text-[#6D5C3E] hover:underline">
              View all collections <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection 1: Sanctuary Bundle */}
            <Link href="/collections" className="group relative rounded-3xl overflow-hidden bg-white border border-[#E4DDD5] p-6 hover:border-[#6D5C3E] transition-all">
              <div className="flex items-start gap-5">
                <div className="flex -space-x-3 flex-shrink-0">
                  {allProducts.filter(p => p.universe === 'sanctuary').slice(0, 3).map((p, i) => (
                    <div key={p.id} className={`h-20 w-20 rounded-xl overflow-hidden border-2 border-white shadow-sm relative ${i > 0 ? '-ml-3' : ''}`}>
                      <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-[2px] text-[#6D5C3E] mb-1">BUNDLE & SAVE</div>
                  <h3 className="font-display text-xl tracking-[-0.4px] text-[#26221E] group-hover:text-[#6D5C3E] transition-colors mb-1">The Sanctuary Edit</h3>
                  <p className="text-[13px] text-[#6D655F] line-clamp-2">Linen bedding, ceramic vase, and wool throw — everything you need for a serene bedroom.</p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="font-medium tabular-nums text-[#26221E]"><PriceDisplay usdAmount={248 + 68 + 165} /></span>
                    <span className="text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-medium">Save 12%</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Collection 2: Morning Ritual Bundle */}
            <Link href="/collections" className="group relative rounded-3xl overflow-hidden bg-white border border-[#E4DDD5] p-6 hover:border-[#6D5C3E] transition-all">
              <div className="flex items-start gap-5">
                <div className="flex -space-x-3 flex-shrink-0">
                  {allProducts.filter(p => p.universe === 'glow-atelier').slice(0, 3).map((p, i) => (
                    <div key={p.id} className={`h-20 w-20 rounded-xl overflow-hidden border-2 border-white shadow-sm relative ${i > 0 ? '-ml-3' : ''}`}>
                      <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-[2px] text-[#6D5C3E] mb-1">BUNDLE & SAVE</div>
                  <h3 className="font-display text-xl tracking-[-0.4px] text-[#26221E] group-hover:text-[#6D5C3E] transition-colors mb-1">Morning Ritual Bundle</h3>
                  <p className="text-[13px] text-[#6D655F] line-clamp-2">Silk sleep mask, gentle cleanser, and a ceramic mug — your AM routine, elevated.</p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="font-medium tabular-nums text-[#26221E]"><PriceDisplay usdAmount={42 + 38 + 28} /></span>
                    <span className="text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-medium">Save 10%</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER — Premium & Minimal (final) */}
      <section className="section bg-[#26221E] text-[#F5F0EA]">
        <div className="container max-w-xl text-center">
          <div className="text-xs tracking-[3.5px] text-[#D4B88A]">A QUIET LETTER, ONCE A WEEK</div>
          <h2 className="font-display text-[42px] mt-4 mb-4 tracking-[-1.4px]" style={{ color: '#F5F0EA' }}>The Alaya Letter</h2>
          <p className="text-[#B8AFA3] text-[15px]">
            A carefully written note each Sunday featuring one beautiful object, one editorial essay, and three things we’re quietly obsessed with.
          </p>

          <form className="mt-8 flex flex-col sm:flex-row gap-3" onSubmit={async (e) => { 
            e.preventDefault();
            const form = e.currentTarget;
            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
            try {
              const res = await fetch('/api/v1/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              if (res.ok) toast.success('You\'re now part of the Alaya circle. Welcome!');
              else toast.error('Subscription failed. Please try again.');
            } catch {
              toast.error('Network error. Please try again.');
            }
            form.reset();
          }}>
            <input 
              id="newsletter-email" 
              name="email" 
              type="email" 
              placeholder="your@email.com" 
              className="input flex-1 bg-[#3D3530] border-[#524A42] text-white placeholder:text-[#A1A1A1]" 
              required 
            />
            <Button variant="accent" size="lg" type="submit" className="sm:w-auto">Subscribe</Button>
          </form>
          <p className="mt-4 text-[11px] text-[#A1A1A1]">We respect your inbox. Unsubscribe with one click.</p>
        </div>
      </section>

    </div>
  );
}
