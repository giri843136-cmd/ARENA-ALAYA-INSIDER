import type { Meta, StoryObj } from "@storybook/react";
import { StickyPriceBar } from "./StickyPriceBar";
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
  images: [],
  inStock: true,
  availability: "IN_STOCK",
  category: "bags",
  description: "",
  specifications: [],
  metadata: {},
  affiliateLinks: [],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const mockProductNoDiscount = {
  ...mockProduct,
  id: "prod_002",
  name: "Minimalist Sculpture",
  price: 128,
  originalPrice: undefined,
  brandName: "Atelier Modern",
};

const meta: Meta<typeof StickyPriceBar> = {
  title: "Product/StickyPriceBar",
  component: StickyPriceBar,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-[800px] font-sans">
        <div id="purchase-card" className="mx-auto max-w-md rounded-xl border p-6 text-center">
          <p className="text-sm mb-2">Purchase card above the fold.</p>
          <p className="text-xs">Scroll down to see the sticky bar.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StickyPriceBar>;

export const WithDiscount: Story = {
  args: {
    product: mockProduct as any,
    affiliateUrl: "https://example.com/buy",
  },
};

export const NoDiscount: Story = {
  args: {
    product: mockProductNoDiscount as any,
    affiliateUrl: "https://example.com/buy",
  },
};

export const NoAffiliateLink: Story = {
  args: {
    product: mockProduct as any,
    affiliateUrl: undefined,
  },
};
