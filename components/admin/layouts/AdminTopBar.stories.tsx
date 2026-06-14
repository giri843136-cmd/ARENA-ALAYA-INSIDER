import type { Meta, StoryObj } from "@storybook/react";
import { AdminTopBar } from "./AdminTopBar";
import { AdminCommandPaletteProvider } from "../ui/AdminCommandPaletteProvider";
import { withNextRouter } from "../../../.storybook/decorators";
import React from "react";

/**
 * AdminTopBar — Top navigation bar for the admin panel.
 *
 * Features:
 * - Brand name and environment badge
 * - Global command palette search trigger (⌘K)
 * - Notification bell with indicator
 * - User avatar and role
 *
 * Wrapped in AdminCommandPaletteProvider + router mock so the ⌘K shortcut works.
 */
const meta: Meta<typeof AdminTopBar> = {
  title: "Admin/Layouts/AdminTopBar",
  component: AdminTopBar,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    nextRouter: { path: "/admin" },
  },
  decorators: [
    withNextRouter,
    (Story) => (
      <AdminCommandPaletteProvider>
        <div className="bg-[#0A0A0A] text-[#EDEDED]">
          <Story />
          <div className="p-6 text-xs text-[#666]">
            Press <kbd className="bg-[#1F1F1F] px-1.5 py-px rounded font-mono">⌘K</kbd> to open the command palette.
          </div>
        </div>
      </AdminCommandPaletteProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminTopBar>;

/** Default state showing brand, search bar, notifications, and user info. */
export const Default: Story = {};
