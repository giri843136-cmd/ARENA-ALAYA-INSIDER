"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { brands as seedBrands } from "@/lib/data/seed";

interface BrandData {
  id: string; name: string; slug: string; tagline: string; country: string;
  founded: number | null; featured: boolean; productCount: number;
  values: string[]; logo: string;
  _count?: { products: number; affiliateLinks: number };
  stats?: { pageViews: number; totalRevenue: number } | null;
}

export default function BrandVault() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSeed, setUsingSeed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/brands");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setBrands(json.data);
        setUsingSeed(false);
      } else {
        setBrands(seedBrands as unknown as BrandData[]);
        setUsingSeed(true);
      }
    } catch {
      setBrands(seedBrands as unknown as BrandData[]);
      setUsingSeed(true);
    }
    finally { setLoading(false); }
  }, [refreshKey]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const totalProducts = brands.reduce((a, b) => a + (b._count?.products || b.productCount || 0), 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-[2px] text-[var(--admin-accent)] font-medium">BRAND VAULT</div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">
              {loading ? "Loading..." : `${brands.length} brands · ${totalProducts} products`}
            </h1>
            <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
              Manage brand partnerships, profiles, and affiliate relationships.
              {usingSeed && <span className="text-[#FBBF24] ml-2 text-xs">(Showing seed data — no brands in database)</span>}
            </p>
          </div>
          <button onClick={() => setRefreshKey(k => k + 1)} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="admin-card p-5 block hover:border-[var(--admin-accent)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-lg">{brand.name}</div>
                {brand.featured && <span className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">Featured</span>}
              </div>
              <div className="text-sm text-[var(--admin-text-secondary)]">{brand.country} {brand.founded ? `· Founded ${brand.founded}` : ""}</div>
              <p className="text-xs text-[var(--admin-text-muted)] mt-2 line-clamp-2">{brand.tagline}</p>
              <div className="mt-4 flex justify-between text-sm">
                <div>{brand._count?.products || brand.productCount || 0} products</div>
                {brand.stats?.totalRevenue && <div className="text-[#4ADE80]">${brand.stats.totalRevenue.toLocaleString()}</div>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(brand.values || []).slice(0, 3).map((v: string, i: number) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--admin-bg-subtle)] text-[var(--admin-text-muted)]">{v}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
