"use client";

import { useEffect } from "react";

/**
 * Client-side component that registers the PWA service worker.
 * Must be a client component because it uses useEffect and navigator.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return null;
}
