import type { Meta, StoryObj } from "@storybook/react";
import { ToastContainer } from "./ToastContainer";
import React from "react";

/**
 * ToastContainer — Global toast notification container.
 *
 * Features:
 * - 4 types: success, warning, error, info
 * - Auto-dismiss animation
 * - Optional action button
 * - Stacks multiple toasts vertically
 * - Uses Zustand store for state management
 *
 * Stories use the `useToastStore` directly to populate toasts.
 */
const meta: Meta<typeof ToastContainer> = {
  title: "UI/ToastContainer",
  component: ToastContainer,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#0A0A0A] min-h-[200px] relative font-sans">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastContainer>;

/** Empty state — no toasts to display. */
export const Empty: Story = {};
