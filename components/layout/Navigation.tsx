"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, User, ShoppingBag } from "lucide-react";
import { universes } from "@/lib/data/seed";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { WishlistHeart } from "@/components/ui/WishlistHeart";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const navUniverses = universes.slice(0, 8);

  return (
    <header>
      {/* Top Announcement Bar — Brand Essence */}
      <div className="bg-[#26221E] text-[#F5F0EA] text-center text-[11px] tracking-[2.5px] py-1.5 font-medium">
        HAND-PICKED WITH INTENTION • EDITORIALLY VERIFIED • SUSTAINABLY SOURCED
      </div>

      <nav className="sticky top-0 z-50 bg-[#F5F0EA]/95 backdrop-blur-2xl border-b border-[#E4DDD5]">
        <div className="container flex h-20 items-center justify-between">
          {/* Logo — Timeless & Refined */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#26221E] text-[#F5F0EA] transition-transform group-hover:scale-[1.02]">
              <span className="font-display text-2xl tracking-[-2px]">A</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-[23px] tracking-[-1.8px] font-semibold text-[#26221E]">ALAYA</div>
              <div className="text-[9px] font-medium tracking-[3.5px] text-[#5C5249] -mt-1">INSIDER</div>
            </div>
          </Link>

          {/* Desktop Navigation — Elegant & Spacious */}
          <div className="hidden md:flex items-center gap-9 text-[13px] font-medium tracking-[1.5px] text-[#5C5249]">
            <div 
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-[#B89B7A] transition-colors">
                UNIVERSes
                <span className="text-[9px] opacity-40">▾</span>
              </button>

              {megaOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[780px]">
                  <div className="bg-white rounded-3xl border border-[#E4DDD5] shadow-xl p-10 grid grid-cols-4 gap-x-8 gap-y-7">
                    {navUniverses.map((universe) => (
                      <Link 
                        key={universe.slug} 
                        href={`/universes/${universe.slug}`}
                        className="group block"
                      >
                        <div className="font-display text-[15px] tracking-[-0.3px] text-[#26221E] group-hover:text-[#B89B7A] transition-colors mb-0.5">
                          {universe.title}
                        </div>
                        <div className="text-[12px] leading-snug text-[#5C5249] line-clamp-2 pr-2">
                          {universe.subtitle}
                        </div>
                      </Link>
                    ))}
                    <div className="col-span-4 pt-5 border-t border-[#E4DDD5] flex items-center justify-between text-[11px] tracking-widest">
                      <Link href="/universes" className="text-[#B89B7A] hover:underline">EXPLORE ALL EIGHT UNIVERSES →</Link>
                      <span className="text-[#5C5249]">8 WORLDS • 50+ SUBCOLLECTIONS</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/search" className="hover:text-[#B89B7A] transition-colors">DISCOVER</Link>
            <Link href="/collections" className="hover:text-[#B89B7A] transition-colors">COLLECTIONS</Link>
            <Link href="/journal" className="hover:text-[#B89B7A] transition-colors">JOURNAL</Link>
            <Link href="/brands" className="hover:text-[#B89B7A] transition-colors">BRANDS</Link>
          </div>

          {/* Right Actions — Calm & Functional */}
          <div className="flex items-center gap-2.5">
            {/* Currency selector — shows symbol before search */}
            <CurrencySelector />
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-[#E4DDD5] bg-white px-5 h-9 text-sm text-[#5C5249] hover:border-[#B89B7A] hover:text-[#26221E] transition-all active:scale-[0.985]"
              aria-label="Open command palette (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="font-medium tracking-[1.5px]">Search</span>
              <kbd className="ml-1 rounded-md bg-[#EFE7DE] px-1.5 py-px text-[10px] font-mono text-[#5C5249]">⌘K</kbd>
            </button>

            <Link href="/account" aria-label="Account" className="hidden md:flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EFE7DE] text-[#5C5249] transition-colors">
              <User className="h-4 w-4" />
            </Link>

            <WishlistHeart />

            <Link href="/cart" aria-label="Cart" className="hidden md:flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EFE7DE] text-[#5C5249] transition-colors relative">
              <ShoppingBag className="h-4 w-4" />
            </Link>

            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="md:hidden h-9 w-9 flex items-center justify-center text-[#5C5249]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — improved spacing & touch targets */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E4DDD5] bg-[#F5F0EA] px-6 py-10 text-sm">
            <div className="flex flex-col gap-4 font-medium text-[#5C5249]">
              {navUniverses.map(u => (
                <Link key={u.slug} href={`/universes/${u.slug}`} onClick={() => setMobileOpen(false)} className="py-1 active:text-[#B89B7A]">{u.title}</Link>
              ))}
              <div className="h-px bg-[#E4DDD5] my-3" />
              <Link href="/search" onClick={() => setMobileOpen(false)} className="py-1 active:text-[#B89B7A]">Discover</Link>
              <Link href="/journal" onClick={() => setMobileOpen(false)} className="py-1 active:text-[#B89B7A]">Journal</Link>
              <Link href="/brands" onClick={() => setMobileOpen(false)} className="py-1 active:text-[#B89B7A]">Brands</Link>
              <Link href="/collections" onClick={() => setMobileOpen(false)} className="py-1 active:text-[#B89B7A]">Collections</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
