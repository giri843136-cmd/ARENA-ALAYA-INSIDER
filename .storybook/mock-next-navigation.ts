/**
 * Mock for `next/navigation` — used in Storybook to prevent crashes
 * when components use `useRouter()`, `usePathname()`, etc.
 *
 * Configured via Vite's `resolve.alias` in `.storybook/main.ts`.
 * This file replaces `next/navigation` at build time inside Storybook.
 */

// Mutable pathname that stories can set via parameters
let currentPathname = "/admin";

export function __setMockPathname(path: string) {
  currentPathname = path;
}

export function useRouter() {
  return {
    push: (url: string) => {
      console.log(`[MockRouter] push: ${url}`);
    },
    replace: (url: string) => {
      console.log(`[MockRouter] replace: ${url}`);
    },
    back: () => console.log("[MockRouter] back"),
    forward: () => console.log("[MockRouter] forward"),
    refresh: () => console.log("[MockRouter] refresh"),
    prefetch: () => {},
  };
}

export function usePathname() {
  return currentPathname;
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {};
}

export function notFound() {
  console.warn("[MockRouter] notFound() called");
}
