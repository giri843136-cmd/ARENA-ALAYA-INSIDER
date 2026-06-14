import type { Meta, StoryObj } from "@storybook/react";
import { ProductCard } from "./ProductCard";
import { withNextRouter } from "../../.storybook/decorators";
import React from "react";

const mockProduct = {
  id: "prod_001",
  slug: "artisan-weave-tote",
  name: "Artisan Weave Tote",
  price: 245,
  originalPrice: 320,
  brandName: "ALAYA Studio",
  rating: 4.8,
  reviewCount: 124,
  images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"],
  featuredImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  newArrival: true,
  bestseller: false,
  inStock: true,
  availability: "IN_STOCK",
  affiliateLinks: [{ network: "Shopify", url: "#" }],
  category: "bags",
  description: "",
  specifications: [],
  metadata: {},
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const mockProductLong = {
  ...mockProduct,
  id: "prod_002",
  slug: "ceramic-pour-over-set",
  name: "Handcrafted Ceramic Pour-Over Coffee Set with Bamboo Stand",
  price: 68,
  originalPrice: undefined,
  brandName: "Artisan Home",
  rating: 4.5,
  reviewCount: 89,
  newArrival: false,
  bestseller: true,
  inStock: true,
  availability: "LOW_STOCK",
  category: "kitchen",
};

const mockProductOutOfStock = {
  ...mockProduct,
  id: "prod_003",
  slug: "marble-serving-board",
  name: "Italian Marble Serving Board",
  price: 185,
  originalPrice: undefined,
  brandName: "Marmo Collection",
  rating: 4.9,
  reviewCount: 42,
  newArrival: false,
  bestseller: false,
  inStock: false,
  availability: "OUT_OF_STOCK",
  images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"],
};

/**
 * ProductCard — Premium product card with badges, quick actions, and pricing.
 *
 * Features:
 * - 3 variants: default, compact, editorial
 * - Dynamic badges (NEW, BESTSELLER, discount %, LOW STOCK, OUT OF STOCK)
 * - Quick actions: Wishlist, Quick View, Compare
 * - Price display with discount comparison
 * - Brand name, rating, and review count
 * - Color variant indicator
 * - Affiliate network badge
 */
const meta: Meta<typeof ProductCard> = {
  title: "Product/ProductCard",
  component: ProductCard,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
    nextRouter: { path: "/" },
  },
  decorators: [
    withNextRouter,
    (Story) => (
      <div className="w-[360px] p-4 font-sans">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "editorial"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

/** Default variant with NEW badge and discount. */
export const Default: Story = {
  args: {
    product: mockProduct as any,
    variant: "default",
  },
};

/** Bestseller product with low stock warning. */
export const BestsellerLowStock: Story = {
  args: {
    product: mockProductLong as any,
    variant: "default",
  },
};

/** Out of stock product. */
export const OutOfStock: Story = {
  args: {
    product: mockProductOutOfStock as any,
    variant: "default",
  },
};

/** Compact variant — ideal for carousels and sidebars. */
export const Compact: Story = {
  args: {
    product: mockProduct as any,
    variant: "compact",
  },
};
