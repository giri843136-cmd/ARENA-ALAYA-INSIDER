import type { Meta, StoryObj } from "@storybook/react";
import { SocialProofControls } from "./SocialProofControls";
import React from "react";

/**
 * SocialProofControls — Admin toggle panel for A/B testing social proof signals.
 *
 * Features:
 * - Toggle each social proof signal (Viewers, Purchases, Saves) independently
 * - Visual indicator for active/inactive state
 * - Reset button to restore defaults
 * - "Saved" confirmation feedback
 * - Changes stored in localStorage via lib/social/config
 *
 * Defaults: viewersEnabled=true, purchasesEnabled=true, savesEnabled=false
 */
const meta: Meta<typeof SocialProofControls> = {
  title: "Admin/UI/SocialProofControls",
  component: SocialProofControls,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#0A0A0A] text-[#EDEDED] p-6 rounded-lg border border-[#252525]">
        <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] mb-3">SOCIAL PROOF SIGNALS</div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SocialProofControls>;

/** Default state with Viewers and Purchases enabled, Saves disabled. */
export const Default: Story = {};

/** All signals enabled. */
export const AllEnabled: Story = {
  play: ({ canvasElement }) => {
    const toggles = canvasElement.querySelectorAll("button");
    // The Saves toggle is the 3rd button (0-indexed: Viewers=0, Purchases=1, Saves=2)
    const savesBtn = toggles[2];
    if (savesBtn) savesBtn.click();
  },
};

/** All signals disabled. */
export const AllDisabled: Story = {
  play: ({ canvasElement }) => {
    const toggles = canvasElement.querySelectorAll("button");
    // Disable viewers (index 0)
    if (toggles[0]) toggles[0].click();
  },
};
