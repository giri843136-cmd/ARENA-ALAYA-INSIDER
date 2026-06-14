import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import React from "react";

/**
 * EmptyState — Placeholder for empty lists and search results.
 *
 * Features:
 * - 4 icon variants: search, product, journal, brand
 * - Optional action link
 * - Optional secondary action slot
 * - Centered layout with descriptive text
 */
const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-4 font-sans">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    icon: {
      control: "select",
      options: ["search", "product", "journal", "brand"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/** Empty search results. */
export const NoResults: Story = {
  args: {
    title: "No results found",
    description: "We couldn't find anything matching your search. Try a different keyword or browse our collections.",
    icon: "search",
    actionLabel: "Browse Collections",
    actionHref: "/collections",
  },
};

/** Empty product list. */
export const NoProducts: Story = {
  args: {
    title: "Nothing here yet",
    description: "This collection is still being curated. Check back soon for new arrivals.",
    icon: "product",
    actionLabel: "Explore Universe",
    actionHref: "/universes",
  },
};

/** Empty journal. */
export const NoArticles: Story = {
  args: {
    title: "No articles yet",
    description: "Our writers are working on new stories. Subscribe to get notified when we publish.",
    icon: "journal",
  },
};

/** Minimal empty state with no action. */
export const Minimal: Story = {
  args: {
    title: "Empty",
    description: "There's nothing to show here right now.",
    icon: "brand",
  },
};
