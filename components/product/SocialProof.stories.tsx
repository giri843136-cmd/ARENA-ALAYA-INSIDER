import type { Meta, StoryObj } from "@storybook/react";
import { SocialProof } from "./SocialProof";
import React from "react";

/**
 * SocialProof — Combined social proof signals for product pages.
 *
 * Features:
 * - 4 popularity tiers: low, medium, high, trending
 * - Live viewer count with pulsing dot
 * - Recent purchase count (24h)
 * - Wishlist save count
 * - Configurable via admin panel (localStorage)
 * - Fluctuating counts that feel organic
 */
const meta: Meta<typeof SocialProof> = {
  title: "Product/SocialProof",
  component: SocialProof,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-8 font-sans max-w-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    popularity: {
      control: "select",
      options: ["low", "medium", "high", "trending"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SocialProof>;

/** Low popularity — quiet product with few interactions. */
export const Low: Story = {
  args: {
    popularity: "low",
  },
};

/** Medium popularity — the default tier. */
export const Medium: Story = {
  args: {
    popularity: "medium",
  },
};

/** High popularity — popular product with good engagement. */
export const High: Story = {
  args: {
    popularity: "high",
  },
};

/** Trending — viral product with high engagement across all signals. */
export const Trending: Story = {
  args: {
    popularity: "trending",
  },
};
