"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";

// Mock data — will be replaced with real queries
const MOCK_FAVORITES = [
  {
    id: "1",
    slug: "ceramic-pour-over-set",
    name: "Ceramic Pour-Over Set",
    description: "Handcrafted ceramic for the perfect morning ritual",
    price: 68,
    rating: 4.8,
    reviewCount: 124,
    image: "/images/products/ceramic-pour-over.jpg",
    brand: "Artisan Home",
  },
  {
    id: "2",
    slug: "linen-bedding-set",
    name: "French Flax Linen Bedding Set",
    description: "Stonewashed linen that gets softer with every wash",
    price: 189,
    salePrice: 149,
    rating: 4.9,
    reviewCount: 312,
    image: "/images/products/linen-bedding.jpg",
    brand: "Maison Linen",
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="bg-[#F5F0EA] min-h-[70vh] flex items-center">
        <div className="container">
          <EmptyState
            title="Your collection is empty"
            description="Start exploring and save the pieces you love. They'll appear here, ready for when you are."
            icon="product"
            actionLabel="Discover beautiful things"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      <div className="container py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/"
              className="text-[#6D655F] hover:text-[#C5AA8A] text-sm flex items-center gap-1.5 mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 className="font-display text-3xl tracking-tight text-[#26221E]">
              Your Favorites
            </h1>
            <p className="text-[#6D655F] mt-1.5">
              {favorites.length} {favorites.length === 1 ? "piece" : "pieces"}{" "}
              saved
            </p>
          </div>
          <Button variant="secondary" size="sm">
            <ShoppingBag size={16} />
            View all
          </Button>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="group relative">
              <ProductCard
                product={{
                  ...item,
                  id: item.id,
                  slug: item.slug,
                  name: item.name,
                  price: item.price,
                  rating: item.rating,
                  reviewCount: item.reviewCount,
                  images: [item.image],
                  brandName: item.brand,
                  shortDescription: item.description,
                  brandId: "",
                  description: item.description,
                  longDescription: item.description,
                  currency: "USD" as const,
                  category: "",
                  tags: [],
                  universe: "sanctuary" as const,
                  subcollectionIds: [],
                  inStock: true,
                  affiliateLinks: [],
                  whyWeLove: [],
                  pros: [],
                  cons: [],
                  perfectFor: [],
                  alternatives: [],
                  publishedAt: new Date().toISOString(),
                  featured: false,
                  bestseller: false,
                  newArrival: false,
                }}
              />
              <button
                onClick={() => removeFavorite(item.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                aria-label="Remove from favorites"
              >
                <Trash2 size={14} className="text-[#A36B6B]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
