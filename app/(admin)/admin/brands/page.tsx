"use client";

import Link from "next/link";
import { brands } from "@/lib/data/seed";

export default function BrandVault() {
  const displayBrands = brands.slice(0, 12);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="text-xs tracking-[2px] text-[var(--admin-accent)] font-medium">BRAND VAULT</div>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">{brands.length} brands &bull; {brands.reduce((a, b) => a + b.productCount, 0)} products</h1>
        <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Manage brand partnerships, profiles, and affiliate relationships.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {displayBrands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="admin-card p-5 block hover:border-[var(--admin-accent)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-lg">{brand.name}</div>
              {brand.featured && <span className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">Featured</span>}
            </div>
            <div className="text-sm text-[var(--admin-text-secondary)]">{brand.country} &bull; Founded {brand.founded}</div>
            <p className="text-xs text-[var(--admin-text-muted)] mt-2 line-clamp-2">{brand.tagline}</p>
            <div className="mt-4 flex justify-between text-sm">
              <div>{brand.productCount} products</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {brand.values.slice(0, 3).map((v, i) => (
                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--admin-bg-subtle)] text-[var(--admin-text-muted)]">{v}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

