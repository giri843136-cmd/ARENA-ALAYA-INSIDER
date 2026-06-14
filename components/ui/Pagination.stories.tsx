import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";
import React from "react";

/**
 * Pagination — Accessible page navigation with sibling ellipsis.
 *
 * Features:
 * - Page number buttons with active state
 * - Previous/Next navigation
 * - Ellipsis for large page ranges
 * - Keyboard accessible (aria-labels)
 * - Sibling count configuration
 */
const meta: Meta<typeof Pagination> = {
  title: "UI/Pagination",
  component: Pagination,
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
  argTypes: {
    currentPage: { control: { type: "number", min: 1 } },
    totalPages: { control: { type: "number", min: 1 } },
    onPageChange: { action: "page changed" },
    siblings: { control: { type: "number", min: 0, max: 3 } },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/** Default pagination with 10 pages. */
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
    siblings: 1,
  },
};

/** Middle of a large page set showing ellipsis on both sides. */
export const MiddlePage: Story = {
  args: {
    currentPage: 8,
    totalPages: 20,
    onPageChange: () => {},
    siblings: 1,
  },
};

/** Small total pages — no ellipsis needed. */
export const SmallSet: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
    onPageChange: () => {},
    siblings: 1,
  },
};

/** Single page — renders nothing. */
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => {},
    siblings: 1,
  },
};

/** Interaction — click the next page button. */
export const NextPage: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    onPageChange: () => {},
    siblings: 1,
  },
  play: async ({ canvasElement }) => {
    const nextBtn = canvasElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement | null;
    if (nextBtn) {
      nextBtn.click();
    }
  },
};

/** Interaction — click a specific page number. */
export const ClickPage: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    onPageChange: () => {},
    siblings: 1,
  },
  play: async ({ canvasElement }) => {
    const pageBtn = canvasElement.querySelector('button[aria-label="Page 7"]') as HTMLButtonElement | null;
    if (pageBtn) {
      pageBtn.click();
    }
  },
};
