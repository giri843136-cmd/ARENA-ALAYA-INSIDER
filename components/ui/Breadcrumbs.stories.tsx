import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./Breadcrumbs";
import React from "react";

/**
 * Breadcrumbs — SEO-friendly breadcrumb navigation.
 *
 * Features:
 * - Visual trail with chevron separators
 * - JSON-LD BreadcrumbList schema embedded
 * - Last item highlighted with aria-current="page"
 * - Link hover states
 */
const meta: Meta<typeof Breadcrumbs> = {
  title: "UI/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-2xl font-sans">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

/** Standard breadcrumbs for a product page. */
export const ProductPage: Story = {
  args: {
    items: [
      { name: "Home", href: "/" },
      { name: "Sanctuary", href: "/universes/sanctuary" },
      { name: "Artisan Weave Tote", href: "/products/artisan-weave-tote" },
    ],
  },
};

/** Breadcrumbs for a journal article. */
export const JournalArticle: Story = {
  args: {
    items: [
      { name: "Home", href: "/" },
      { name: "INSIDER Journal", href: "/journal" },
      { name: "The Art of Slow Living", href: "/journal/slow-living" },
    ],
  },
};

/** Minimal breadcrumbs — just homepage. */
export const HomeOnly: Story = {
  args: {
    items: [{ name: "Home", href: "/" }],
  },
};

/** Empty breadcrumbs — renders nothing. */
export const Empty: Story = {
  args: {
    items: [],
  },
};
