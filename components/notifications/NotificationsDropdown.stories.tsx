import type { Meta, StoryObj } from "@storybook/react";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { withNextRouter } from "../../.storybook/decorators";
import React from "react";

/**
 * NotificationsDropdown — Full-featured notification dropdown with API integration.
 *
 * Features:
 * - API-driven notification fetching (with fallback)
 * - Unread count badge
 * - Auto-refresh on open (if > 2 min stale)
 * - Mark individual as read
 * - Mark all as read
 * - Loading spinner state
 * - Empty state with illustration
 * - Notification type icons (price drop, back in stock, etc.)
 * - Relative timestamps
 * - "See all" link
 */
const meta: Meta<typeof NotificationsDropdown> = {
  title: "Notifications/NotificationsDropdown",
  component: NotificationsDropdown,
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
type Story = StoryObj<typeof NotificationsDropdown>;

/** Default state with dropdown closed. */
export const Default: Story = {
  args: {
    userId: "user_demo",
  },
};

/** Dropdown open — shows loading state while API fetch resolves. */
export const Open: Story = {
  args: {
    userId: "user_demo",
  },
};
