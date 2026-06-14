import type { Meta, StoryObj } from "@storybook/react";
import { AdminDrawer } from "./AdminDrawer";
import React from "react";

/**
 * AdminDrawer — A slide-in panel from the right side.
 *
 * Features:
 * - Backdrop overlay when open
 * - Slide-in from right with configurable width (max-w-md)
 * - Sticky title bar with close button
 * - Flexible children area
 */
const meta: Meta<typeof AdminDrawer> = {
  title: "Admin/UI/AdminDrawer",
  component: AdminDrawer,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof AdminDrawer>;

/** Drawer in the open state with mock content. */
export const Open: Story = {
  args: {
    open: true,
    title: "Drawer Title",
    children: (
      <div className="space-y-4">
        <div className="admin-card p-4">
          <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] mb-2">SECTION</div>
          <p className="text-sm text-[#EDEDED] leading-relaxed">
            This is example content inside the drawer. You can put any React
            children here — forms, details panels, settings, etc.
          </p>
        </div>
        <div className="admin-card p-4">
          <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] mb-2">DETAILS</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#666]">Status</span>
              <span className="text-[#4ADE80]">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Created</span>
              <span className="text-[#EDEDED]">May 15, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Items</span>
              <span className="text-[#EDEDED]">23</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

/** Drawer in the closed state — renders null. */
export const Closed: Story = {
  args: {
    open: false,
    title: "Drawer Title",
    children: <div>Content hidden when closed</div>,
  },
};
