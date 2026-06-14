import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, ProductCardSkeleton, EditorialCardSkeleton, TableRowSkeleton } from "./Skeleton";
import React from "react";

/**
 * Skeleton — Content placeholder loading states.
 *
 * Features:
 * - Base Skeleton component (animated pulse)
 * - ProductCardSkeleton — full product card placeholder
 * - EditorialCardSkeleton — editorial card placeholder
 * - TableRowSkeleton — table row with configurable columns
 */
const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div className="p-8 font-sans">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/** Base skeleton line. */
export const Base: Story = {
  args: {
    className: "h-4 w-48",
  },
};

/** Product card skeleton — full card placeholder. */
export const ProductCard: StoryObj = {
  render: () => (
    <div className="w-[320px]">
      <ProductCardSkeleton />
    </div>
  ),
};

/** Editorial card skeleton — full card placeholder. */
export const EditorialCard: StoryObj = {
  render: () => (
    <div className="w-[380px]">
      <EditorialCardSkeleton />
    </div>
  ),
};

/** Table row skeleton — 4 column rows. */
export const TableRow4Cols: StoryObj = {
  render: () => (
    <table className="w-full max-w-lg border-collapse">
      <tbody>
        <TableRowSkeleton cols={4} />
        <TableRowSkeleton cols={4} />
        <TableRowSkeleton cols={4} />
      </tbody>
    </table>
  ),
};

/** Table row skeleton — 3 column rows. */
export const TableRow3Cols: StoryObj = {
  render: () => (
    <table className="w-full max-w-md border-collapse">
      <tbody>
        <TableRowSkeleton cols={3} />
        <TableRowSkeleton cols={3} />
        <TableRowSkeleton cols={3} />
      </tbody>
    </table>
  ),
};
