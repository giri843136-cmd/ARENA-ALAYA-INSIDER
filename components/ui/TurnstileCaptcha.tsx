"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface TurnstileCaptchaProps {
  /** Called with the turnstile token on successful challenge */
  onVerify: (token: string) => void;
  /** Called when the challenge expires */
  onExpire?: () => void;
  /** Theme override */
  theme?: "light" | "dark" | "auto";
  /** Widget size */
  size?: "normal" | "compact";
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: string;
        size?: string;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileCaptcha({
  onVerify,
  onExpire,
  theme = "dark",
  size = "compact",
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  const loadScript = useCallback(() => {
    if (document.querySelector('script[src*="turnstile"]')) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
    script.async = true;
    script.defer = true;
    (window as any).onTurnstileLoad = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadScript();
  }, [loadScript]);

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetIdRef.current) return;

    const widgetId = window.turnstile!.render(containerRef.current, {
      sitekey,
      callback: onVerify,
      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpire?.();
      },
      "error-callback": () => {
        widgetIdRef.current = null;
      },
      theme,
      size,
    });

    widgetIdRef.current = widgetId;

    return () => {
      if (widgetIdRef.current) {
        try { window.turnstile?.remove(widgetIdRef.current); } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [loaded, onVerify, onExpire, theme, size]);

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="turnstile-widget" />
      {!loaded && (
        <div className="text-xs text-[#8A8178] animate-pulse py-3">
          Loading security check...
        </div>
      )}
    </div>
  );
}
