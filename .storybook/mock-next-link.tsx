import React from "react";

/**
 * Mock for `next/link` — used in Storybook when components import
 * `Link` from `next/link`. Renders a basic `<a>` tag instead.
 *
 * Configured via Vite's `resolve.alias` in `.storybook/main.ts`.
 */

interface MockLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const MockLink = ({ href, children, className, ...props }: MockLinkProps) => {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        console.log(`[MockLink] navigated to: ${href}`);
      }}
      {...props}
    >
      {children}
    </a>
  );
};

export default MockLink;
