import type { Meta, StoryObj } from "@storybook/react";
import { ProductGallery } from "./ProductGallery";
import React from "react";

const sampleImages = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800&q=80",
  "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=800&q=80",
  "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800&q=80",
];

const singleImage = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
];

/**
 * ProductGallery — Premium full-screen lightbox gallery with zoom and navigation.
 *
 * Features:
 * - Thumbnail grid with click-to-open lightbox
 * - Keyboard navigation (arrows, escape)
 * - Mouse hover zoom (2x with custom origin)
 * - Previous/Next arrow buttons
 * - Thumbnail strip for quick navigation
 * - Image counter and product name display
 * - Body scroll lock when open
 */
const meta: Meta<typeof ProductGallery> = {
  title: "Product/ProductGallery",
  component: ProductGallery,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] p-4 font-sans">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProductGallery>;

/** Gallery with multiple images and lifestyle placeholder. */
export const MultipleImages: Story = {
  args: {
    images: sampleImages,
    productName: "Artisan Weave Tote",
  },
};

/** Gallery with a single image — no thumbnails or navigation. */
export const SingleImage: Story = {
  args: {
    images: singleImage,
    productName: "Artisan Weave Tote",
  },
};

/** Gallery with no images — shows placeholder. */
export const NoImages: Story = {
  args: {
    images: [],
    productName: "Artisan Weave Tote",
  },
};
