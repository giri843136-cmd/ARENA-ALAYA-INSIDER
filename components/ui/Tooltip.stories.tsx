import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import React from "react";

/**
 * Tooltip — Accessible tooltip with hover/focus activation.
 *
 * Features:
 * - 4 positions: top, bottom, left, right
 * - Configurable delay before showing
 * - Accessible via keyboard focus
 * - Animated entry
 */
const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-16 font-sans flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    delay: { control: { type: "number", min: 0, max: 1000, step: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/** Tooltip positioned above. */
export const Top: Story = {
  args: {
    content: "This is a tooltip",
    position: "top",
    delay: 300,
    children: <span className="text-sm font-medium cursor-pointer border-b border-dashed border-[#7A6848]">Hover me</span>,
  },
};

/** Tooltip positioned below. */
export const Bottom: Story = {
  args: {
    content: "Details below",
    position: "bottom",
    delay: 300,
    children: <span className="text-sm font-medium cursor-pointer border-b border-dashed border-[#7A6848]">Hover me</span>,
  },
};

/** Tooltip positioned to the left. */
export const Left: Story = {
  args: {
    content: "On the left side",
    position: "left",
    delay: 300,
    children: <span className="text-sm font-medium cursor-pointer border-b border-dashed border-[#7A6848]">Hover me</span>,
  },
};

/** Tooltip positioned to the right. */
export const Right: Story = {
  args: {
    content: "On the right side",
    position: "right",
    delay: 300,
    children: <span className="text-sm font-medium cursor-pointer border-b border-dashed border-[#7A6848]">Hover me</span>,
  },
};

/** Tooltip with no delay — appears instantly. */
export const Instant: Story = {
  args: {
    content: "Instant tooltip",
    position: "top",
    delay: 0,
    children: <span className="text-sm font-medium cursor-pointer border-b border-dashed border-[#7A6848]">Instant</span>,
  },
};
