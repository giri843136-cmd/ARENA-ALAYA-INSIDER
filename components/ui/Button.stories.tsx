import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import React from "react";

/**
 * Button — Versatile button component with variant and size options.
 *
 * Features:
 * - 4 variants: primary, secondary, ghost, accent
 * - 3 sizes: sm, md, lg
 * - Icon support via children
 * - Active scale animation
 */
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-8 font-sans">
        <div className="flex flex-wrap items-center gap-4">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "accent"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Primary button — the main call-to-action. */
export const Primary: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Shop Now",
  },
};

/** Secondary button — for less prominent actions. */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "md",
    children: "Learn More",
  },
};

/** Ghost button — minimal style for tertiary actions. */
export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "md",
    children: "Cancel",
  },
};

/** Accent button — highlighted action, golden/CTA style. */
export const Accent: Story = {
  args: {
    variant: "accent",
    size: "md",
    children: "Subscribe",
  },
};

/** Button with an icon. */
export const WithIcon: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: (
      <>
        <ShoppingBag size={16} />
        Add to Bag
      </>
    ),
  },
};

/** Small button. */
export const Small: Story = {
  args: {
    variant: "primary",
    size: "sm",
    children: "View",
  },
};

/** Large button. */
export const Large: Story = {
  args: {
    variant: "primary",
    size: "lg",
    children: (
      <>
        Continue
        <ArrowRight size={18} />
      </>
    ),
  },
};

/** Disabled button. */
export const Disabled: Story = {
  args: {
    variant: "primary",
    size: "md",
    disabled: true,
    children: "Disabled",
  },
};

/** Primary button interaction (clicked). */
export const PrimaryClicked: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Shop Now",
  },
};
