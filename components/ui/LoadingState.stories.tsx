import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "./LoadingState";
import React from "react";

/**
 * LoadingState — Centered loading spinner with message.
 *
 * Features:
 * - Animated spinner (CSS border-trick rotation)
 * - Customizable message
 * - Centered layout
 */
const meta: Meta<typeof LoadingState> = {
  title: "UI/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-4 min-w-[300px] font-sans">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    message: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

/** Default loading state. */
export const Default: Story = {
  args: {
    message: "Loading beautiful things...",
  },
};

/** Custom loading message. */
export const CustomMessage: Story = {
  args: {
    message: "Curating your experience...",
  },
};
