import type { Meta, StoryObj } from "@storybook/react";
import { AdminSidebar } from "./AdminSidebar";
import { withNextRouter } from "../../../.storybook/decorators";
import React from "react";

/**
 * AdminSidebar — Full-height navigation sidebar for the admin panel.
 *
 * Features:
 * - Collapsible with chevron toggle
 * - 6 navigation groups (Command, Content, Discovery, Intelligence, Audience & Revenue, System)
 * - Active route highlighting via pathname
 * - Version/badge footer
 *
 * Uses `usePathname()` from Next.js — mock provided via `withNextRouter` decorator.
 */
const meta: Meta<typeof AdminSidebar> = {
  title: "Admin/Layouts/AdminSidebar",
  component: AdminSidebar,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    nextRouter: { path: "/admin" },
  },
  decorators: [
    withNextRouter,
    (Story) => (
      <div className="flex h-screen bg-[#0A0A0A] text-[#EDEDED]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminSidebar>;

/** Sidebar in its default expanded state on the command center page. */
export const Expanded: Story = {};

/** Sidebar in collapsed state (shows only icons with tooltips). */
export const Collapsed: Story = {
  parameters: {
    nextRouter: { path: "/admin/products" },
  },
  play: ({ canvasElement }) => {
    // Click the collapse toggle button (the one with the chevron icon in the header)
    const collapseBtn = canvasElement.querySelector(
      '.admin-sidebar button'
    ) as HTMLButtonElement | null;
    if (collapseBtn) collapseBtn.click();
  },
};
