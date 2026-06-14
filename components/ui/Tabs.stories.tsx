import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";
import React from "react";

/**
 * Tabs — Accessible tabbed interface with keyboard navigation.
 *
 * Features:
 * - WAI-ARIA tabs pattern (role="tab", role="tabpanel")
 * - Keyboard navigation: Arrow keys, Home, End
 * - Controlled or uncontrolled mode
 * - Tab panel content switching
 */
const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-lg w-full font-sans">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onChange: { action: "tab changed" },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const sampleTabs = [
  {
    id: "details",
    label: "Details",
    content: (
      <div className="space-y-3 text-sm text-[#5C5249]">
        <p>Product details and specifications go here. This panel shows the item&apos;s dimensions, materials, and care instructions.</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Handcrafted from premium materials</li>
          <li>Dimensions: 12″ × 8″ × 4″</li>
          <li>Weight: 1.2 lbs</li>
        </ul>
      </div>
    ),
  },
  {
    id: "reviews",
    label: "Reviews",
    content: (
      <div className="space-y-3 text-sm text-[#5C5249]">
        <p>Customer reviews and ratings. See what others are saying about this product.</p>
        <div className="flex items-center gap-1 text-amber-500">★★★★★ (24 reviews)</div>
      </div>
    ),
  },
  {
    id: "shipping",
    label: "Shipping",
    content: (
      <div className="space-y-3 text-sm text-[#5C5249]">
        <p>Shipping information, delivery estimates, and return policy details.</p>
        <div className="bg-[#EFE7DE] p-3 rounded-lg">
          <strong className="text-[#26221E]">Free shipping</strong> on orders over $100
        </div>
      </div>
    ),
  },
];

/** Default tabs with three panels. */
export const Default: Story = {
  args: {
    tabs: sampleTabs,
    defaultTab: "details",
    onChange: () => {},
  },
};

/** Second tab active by default. */
export const ReviewsActive: Story = {
  args: {
    tabs: sampleTabs,
    defaultTab: "reviews",
    onChange: () => {},
  },
};

/** Minimal tabs with just two items. */
export const Minimal: Story = {
  args: {
    tabs: [
      { id: "on", label: "On", content: <p className="text-sm text-[#5C5249]">Toggle is on.</p> },
      { id: "off", label: "Off", content: <p className="text-sm text-[#5C5249]">Toggle is off.</p> },
    ],
    defaultTab: "on",
    onChange: () => {},
  },
};

/** Show interaction — click the second tab to switch panels. */
export const SwitchTab: Story = {
  args: {
    tabs: [
      { id: "details", label: "Details", content: <p className="text-sm text-[#5C5249]">Details panel content.</p> },
      { id: "reviews", label: "Reviews", content: <p className="text-sm text-[#5C5249]">Reviews panel content. ★★★★★</p> },
      { id: "shipping", label: "Shipping", content: <p className="text-sm text-[#5C5249]">Shipping panel content. Free over $100.</p> },
    ],
    defaultTab: "details",
    onChange: () => {},
  },
  play: async ({ canvasElement }) => {
    // Click the Reviews tab
    const reviewsTab = canvasElement.querySelector('[role="tab"][id="tab-reviews"]') as HTMLButtonElement | null;
    if (reviewsTab) {
      reviewsTab.click();
    }
  },
};
