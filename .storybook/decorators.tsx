import React from "react";
import { __setMockPathname } from "./mock-next-navigation";

/**
 * Storybook decorator that sets the mock pathname from parameters.
 *
 * The actual `next/navigation` module is aliased at the Vite level
 * (see `.storybook/main.ts → viteFinal → resolve.alias`).
 *
 * Usage:
 *   import { withNextRouter } from "../../.storybook/decorators";
 *   export default {
 *     decorators: [withNextRouter],
 *     parameters: { nextRouter: { path: "/admin" } },
 *   };
 */
export const withNextRouter = (Story: React.ComponentType, context: any) => {
  const mockUrl = context?.parameters?.nextRouter?.path ?? "/admin";
  __setMockPathname(mockUrl);
  return <Story />;
};
