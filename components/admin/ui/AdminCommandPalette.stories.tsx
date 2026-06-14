import type { Meta, StoryObj } from "@storybook/react";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { withNextRouter } from "../../../.storybook/decorators";
import React from "react";

/**
 * AdminCommandPalette — ⌘K command palette for the admin panel.
 *
 * Features:
 * - Fuzzy search across all commands (categories: Content, Intelligence, System, Quick Actions)
 * - Navigation via next/navigation router
 * - Quick actions (CSV import, SEO, link validation)
 * - Category badges and keyboard shortcut hints
 * - Auto-focuses search input when opened
 *
 * Built with the `cmdk` library (⌘K menu pattern).
 *
 * Router mocked via `withNextRouter` decorator since the component uses `useRouter()`.
 */
const meta: Meta<typeof AdminCommandPalette> = {
  title: "Admin/UI/AdminCommandPalette",
  component: AdminCommandPalette,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    nextRouter: { path: "/admin" },
  },
  decorators: [
    withNextRouter,
    (Story) => (
      <div className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: { control: "boolean" },
    onOpenChange: { action: "toggled" },
  },
};

export default meta;
type Story = StoryObj<typeof AdminCommandPalette>;

/** Palette open with all commands visible. */
export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
};

/** Palette open with a search query filtering results. */
export const FilteredBySearch: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  play: ({ canvasElement }) => {
    // cmdk renders an <input role="combobox"> for the search field
    const input = canvasElement.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement | null;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, "SEO");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  },
};

/** Palette in the closed state — renders null. */
export const Closed: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
  },
};
