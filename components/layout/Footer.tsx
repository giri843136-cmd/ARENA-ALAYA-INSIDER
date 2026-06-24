"use client";

import Link from "next/link";
import { CurrencyIndicator } from "@/components/ui/CurrencyIndicator";

export function Footer() {
  return (
    <footer className="bg-[#111111] text-[#EDE6DC] pt-20 pb-12 border-t border-[#252525]">
      <div className="container">
        {/* Top editorial row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-14 gap-x-8 text-sm">
          {/* Brand + Mission */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4B88A] text-[#111111]">
                <span className="font-display text-2xl tracking-[-2px]">A</span>
              </div>
              <div>
                <div className="font-display text-[26px] tracking-[-1.5px]">ALAYA</div>
                <div className="text-[9px] tracking-[3.5px] text-[#D4B88A] -mt-1">INSIDER</div>
              </div>
            </div>
            <p className="text-[#C8C0B8] text-[15px] leading-relaxed max-w-[340px]">
              An editorial sanctuary for the discerning. Curated with intention since 2023.<br />New York • London • Sydney.
            </p>
            <div className="mt-8 flex gap-4 text-xs tracking-[1.5px]">
              <a href="https://instagram.com" className="hover:text-[#D4B88A] transition-colors">INSTAGRAM</a>
              <a href="https://pinterest.com" className="hover:text-[#D4B88A] transition-colors">PINTEREST</a>
              <a href="https://substack.com" className="hover:text-[#D4B88A] transition-colors">SUBSTACK</a>
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <div className="font-medium tracking-[2px] text-xs mb-6 text-[#D4B88A]">EXPLORE</div>
            <div className="space-y-3 text-[#C8C0B8]">
              <Link href="/universes" className="block hover:text-white transition-colors">Universes</Link>
              <Link href="/collections" className="block hover:text-white transition-colors">Collections</Link>
              <Link href="/search" className="block hover:text-white transition-colors">Discover</Link>
              <Link href="/brands" className="block hover:text-white transition-colors">The Brand Vault</Link>
              <Link href="/journal" className="block hover:text-white transition-colors">The Journal</Link>
            </div>
          </div>

          {/* Platform */}
          <div className="md:col-span-2">
            <div className="font-medium tracking-[2px] text-xs mb-6 text-[#D4B88A]">THE PLATFORM</div>
            <div className="space-y-3 text-[#C8C0B8]">
              <Link href="/about" className="block hover:text-white transition-colors">Our Story</Link>
              <Link href="/contact" className="block hover:text-white transition-colors">Contact</Link>
              <Link href="/newsletter" className="block hover:text-white transition-colors">The Alaya Letter</Link>
              <Link href="/saved" className="block hover:text-white transition-colors">Saved &amp; Wishlist</Link>
              <Link href="/account" className="block hover:text-white transition-colors">Account</Link>
            </div>
          </div>

          {/* Support + Legal */}
          <div className="md:col-span-3">
            <div className="font-medium tracking-[2px] text-xs mb-6 text-[#D4B88A]">SUPPORT &amp; LEGAL</div>
            <div className="space-y-3 text-[#C8C0B8] text-sm">
              <Link href="/affiliate-disclosure" className="block hover:text-white transition-colors">Affiliate Disclosure</Link>
              <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/contact" className="block hover:text-white transition-colors">Help Center</Link>
              <div className="pt-3 text-xs text-[#A1A1A1]">HAND-PICKED WITH INTENTION • EDITORIALLY VERIFIED</div>
            </div>
          </div>
        </div>

        {/* Newsletter CTA — Calm & Editorial */}
        <div className="mt-16 pt-10 border-t border-[#252525]">
          <div className="max-w-xl">
            <div className="text-xs tracking-[2.5px] text-[#D4B88A] mb-2">A QUIET LETTER, ONCE A WEEK</div>
            <div className="font-display text-3xl tracking-[-1px] text-white mb-3">The Alaya Letter</div>
            <p className="text-[#C8C0B8] text-[15px] max-w-md">
              One beautiful object. One essay. Three things we’re quietly obsessed with. Delivered Sunday.
            </p>

            <form 
              className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                alert("Thank you. You are now part of the circle. Welcome."); 
              }}
            >
              <input 
                id="footer-newsletter-email" 
                name="email" 
                type="email" 
                placeholder="your@email.com" 
                className="input flex-1 bg-[#1A1A1A] border-[#333] text-white placeholder:text-[#A1A1A1] py-3.5" 
                required 
              />
              <button 
                type="submit"
                className="btn btn-accent px-10 whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </form>
            <p className="mt-2 text-[10px] tracking-widest text-[#A1A1A1]">We respect your inbox. Unsubscribe instantly.</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#252525] flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-[#A1A1A1]">
          <div>© {new Date().getFullYear()} Alaya Insider. All rights reserved. Handcrafted with care in the quiet hours.</div>
          
          <div className="flex items-center gap-5">
            <CurrencyIndicator />
            <span aria-hidden="true">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliates</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
