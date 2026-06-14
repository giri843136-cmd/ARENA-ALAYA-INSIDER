import type { Meta, StoryObj } from "@storybook/react";
import { AdminCommandPaletteProvider, useAdminCommandPalette } from "./AdminCommandPaletteProvider";
import { withNextRouter } from "../../../.storybook/decorators";
import React from "react";

/**
 * AdminCommandPaletteProvider — Context provider for the ⌘K command palette.
 *
 * Features:
 * - Provides `openPalette` and `closePalette` to all children
 * - Global keyboard listener (⌘K / Ctrl+K)
 * - Renders `AdminCommandPalette` as a child
 *
 * This story renders a demo component that uses `useAdminCommandPalette`
 * to show how the provider works in context.
 */

function DemoTrigger() {
  const { openPalette } = useAdminCommandPalette();
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <p className="text-sm text-[#666]">Click the button or press ⌘K to open the palette</p>
      <button
        onClick={openPalette}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#252525] bg-[#0A0A0A] text-[#EDEDED] text-sm hover:border-[#C5A26F] transition-all"
      >
        <kbd className="text-[10px] bg-[#1F1F1F] px-1.5 py-px rounded font-mono">⌘K</kbd>
        Open Command Palette
      </button>
      <div className="text-xs text-[#666] mt-4">
        Press <kbd className="bg-[#1F1F1F] px-1 py-px rounded font-mono text-[10px]">Escape</kbd> to close
      </div>
    </div>
  );
}

const meta: Meta<typeof AdminCommandPaletteProvider> = {
  title: "Admin/UI/AdminCommandPaletteProvider",
  component: AdminCommandPaletteProvider,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    nextRouter: { path: "/admin" },
  },
  decorators: [withNextRouter],
};

export default meta;
type Story = StoryObj<typeof AdminCommandPaletteProvider>;

/** Provider wrapping a demo trigger component. */
export const Default: Story = {
  render: () => (
    <div className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen">
      <AdminCommandPaletteProvider>
        <DemoTrigger />
      </AdminCommandPaletteProvider>
    </div>
  ),
};
