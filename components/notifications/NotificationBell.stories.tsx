import type { Meta, StoryObj } from "@storybook/react";
import { NotificationBell } from "./NotificationBell";
import { withNextRouter } from "../../.storybook/decorators";
import React from "react";

/**
 * NotificationBell — Bell icon with unread count and dropdown notification list.
 *
 * Features:
 * - Unread count badge (99+ overflow)
 * - Click-to-toggle dropdown panel
 * - Click-outside-to-close behavior
 * - Empty state when no notifications
 * - "See all" link to full notifications page
 * - Read/unread visual states
 * - Notification type icons
 */
const meta: Meta<typeof NotificationBell> = {
  title: "Notifications/NotificationBell",
  component: NotificationBell,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
    nextRouter: { path: "/" },
  },
  decorators: [
    withNextRouter,
    (Story) => (
      <div className="p-8 font-sans flex justify-end min-h-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

/** Default state with unread notifications. */
export const Default: Story = {};

/** Dropdown open showing the notification list. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    // Click the bell button to open the dropdown
    const bell = canvasElement.querySelector('button[aria-label*="Notifications"]') as HTMLButtonElement | null;
    if (bell) {
      bell.click();
      // Wait for dropdown to render
      await new Promise((r) => setTimeout(r, 100));
    }
  },
};
