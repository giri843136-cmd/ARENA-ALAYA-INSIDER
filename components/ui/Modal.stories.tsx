import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import React from "react";

/**
 * Modal — Accessible dialog with focus trap, overlay, and escape-to-close.
 *
 * Features:
 * - Backdrop overlay with blur effect
 * - Focus trap (Tab/Shift+Tab cycles within modal)
 * - Escape key closes
 * - Click-outside-to-close (on backdrop)
 * - Scrollable content (max 85vh)
 * - SSR-safe (client-side only rendering)
 */
const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "light" },
  },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/** Open modal with sample form content. */
export const Open: Story = {
  args: {
    open: true,
    title: "Confirm Action",
    children: (
      <div className="space-y-4 text-sm text-[#5C5249]">
        <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        <div className="bg-[#EFE7DE] p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Item</span>
            <span className="font-medium text-[#26221E]">Artisan Weave Tote</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity</span>
            <span className="font-medium text-[#26221E]">1</span>
          </div>
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-medium text-[#26221E]">$245.00</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-primary">Confirm</button>
        </div>
      </div>
    ),
    onClose: () => {},
  },
};

/** Open modal with a long content to show scrolling. */
export const ScrollableContent: Story = {
  args: {
    open: true,
    title: "Terms & Conditions",
    children: (
      <div className="space-y-4 text-sm text-[#5C5249]">
        {Array.from({ length: 8 }).map((_, i) => (
          <p key={i}>
            Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
            ex ea commodo consequat.
          </p>
        ))}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#E4DDD5]">
          <button className="btn btn-ghost">Close</button>
          <button className="btn btn-primary">Accept</button>
        </div>
      </div>
    ),
    onClose: () => {},
  },
};

/** Modal without a title bar. */
export const NoTitle: Story = {
  args: {
    open: true,
    children: (
      <div className="text-center space-y-4 text-sm text-[#5C5249]">
        <p className="text-lg font-semibold text-[#26221E]">Quick action complete</p>
        <p>Your changes have been saved successfully.</p>
        <button className="btn btn-primary">Got it</button>
      </div>
    ),
    onClose: () => {},
  },
};

/** Closed modal — renders nothing. */
export const Closed: Story = {
  args: {
    open: false,
    title: "Hidden Modal",
    children: <div>Content hidden when closed</div>,
    onClose: () => {},
  },
};

/** Modal with interactive toggle — click backdrop to close. */
export const Interactive: Story = {
  args: {
    open: true,
    title: "Interactive Modal",
    children: (
      <div className="space-y-4 text-sm text-[#5C5249]">
        <p>This modal can be closed by clicking the backdrop, pressing Escape, or clicking the X button.</p>
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn btn-ghost" onClick={() => {}}>Cancel</button>
          <button className="btn btn-primary">Confirm</button>
        </div>
      </div>
    ),
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    // Verify modal content is rendered
    const dialog = canvasElement.querySelector('[role="dialog"]');
    if (dialog) {
      // Focus the first focusable element
      const firstBtn = dialog.querySelector('button');
      if (firstBtn) firstBtn.focus();
    }
  },
};
