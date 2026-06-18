"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Mail, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExitIntentPopupProps {
  /** Delay before monitoring exit intent (ms) */
  activationDelay?: number;
  /** Cookie name to track dismissal */
  cookieName?: string;
  /** How long before showing again (days) */
  cookieExpiryDays?: number;
  /** Only show on specific page paths */
  includePaths?: string[];
  /** Percentage of users to show (for A/B testing) */
  showPercentage?: number;
}

/**
 * ExitIntentPopup — Detects when user is about to leave and shows a compelling offer
 * Uses mouse position tracking, tab visibility, and link hover detection
 */
export function ExitIntentPopup({
  activationDelay = 10000, // Start monitoring after 10 seconds
  cookieName = "alaya_exit_intent_dismissed",
  cookieExpiryDays = 30,
  includePaths,
  showPercentage = 100,
}: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasShownRef = useRef(false);
  const monitoringRef = useRef(false);
  const mouseYRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we should show on this page
  const shouldShowOnPage = useCallback(() => {
    if (!includePaths || includePaths.length === 0) return true;
    return includePaths.some((path) => window.location.pathname.startsWith(path));
  }, [includePaths]);

  // Check cookie and percentage
  const shouldShow = useCallback(() => {
    // Cookie check
    const dismissed = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`));
    if (dismissed) return false;

    // Percentage check (for A/B testing)
    if (showPercentage < 100) {
      const hash = Array.from(window.location.pathname).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      );
      if ((hash % 100) >= showPercentage) return false;
    }

    return true;
  }, [cookieName, showPercentage]);

  // Track mouse movement for exit intent
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseYRef.current = e.clientY;
    // If mouse moves rapidly toward top of page (close to browser chrome)
    if (e.clientY <= 50 && e.movementY < -10 && mouseYRef.current >= 0) {
      trigger();
    }
  }, []);

  // Handle tab visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden" && !hasShownRef.current) {
      // User is switching tabs — may be leaving
      trigger();
    }
  }, []);

  // Handle link hover (going to click a link to leave)
  const handleLinkHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.closest("a")) {
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (link && link.href && !link.href.startsWith(window.location.origin)) {
        // External link — potential exit
        trigger();
      }
    }
  }, []);

  const trigger = useCallback(() => {
    if (hasShownRef.current) return;
    if (!shouldShowOnPage()) return;
    if (!shouldShow()) return;

    hasShownRef.current = true;
    setVisible(true);
    // Focus email input after animation
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [shouldShowOnPage, shouldShow]);

  // Set up exit intent monitoring
  useEffect(() => {
    if (monitoringRef.current) return;
    monitoringRef.current = true;

    const timer = setTimeout(() => {
      if (!shouldShowOnPage()) return;
      if (!shouldShow()) return;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      // Delayed link tracking: start monitoring external link hovers after scroll
      const linkTimer = setTimeout(() => {
        document.addEventListener("mouseover", handleLinkHover);
      }, 5000);

      return () => {
        document.removeEventListener("mouseover", handleLinkHover);
        clearTimeout(linkTimer);
      };
    }, activationDelay);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activationDelay, handleMouseMove, handleVisibilityChange, handleLinkHover, shouldShowOnPage, shouldShow]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    // Set cookie to not show again
    const expires = new Date(Date.now() + cookieExpiryDays * 86400000).toUTCString();
    document.cookie = `${cookieName}=true; Path=/; Expires=${expires}; SameSite=Lax`;
  }, [cookieName, cookieExpiryDays]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "exit-intent-popup" }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        handleDismiss();
      } else {
        setError(json.error?.message || "Subscription failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, handleDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative max-w-lg w-full bg-[#1C1C1C] border border-[#333] rounded-3xl overflow-hidden shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Don't miss out"
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[#888] hover:text-white hover:bg-white/10 transition-all z-10"
                aria-label="Close"
              >
                <X size={14} />
              </button>

              <div className="p-8 md:p-10">
                {/* Decorative accent */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C5A26F] to-[#8B7355] flex items-center justify-center mb-6">
                  <Sparkles size={20} className="text-white" />
                </div>

                {!submitted ? (
                  <>
                    <h2 className="font-display text-2xl md:text-3xl tracking-tight text-white leading-tight mb-3">
                      Wait before you go!
                    </h2>
                    <p className="text-[#999] text-sm leading-relaxed mb-6">
                      Subscribe to our newsletter and get{" "}
                      <span className="text-[#C5A26F] font-medium">10% off</span> your first
                      purchase, plus exclusive access to our curated collections, insider
                      style guides, and member-only deals.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]"
                        />
                        <input
                          ref={inputRef}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-[#333] rounded-xl text-sm text-white placeholder-[#666] focus:border-[#C5A26F] outline-none transition-colors"
                          disabled={loading}
                        />
                      </div>

                      {error && (
                        <p className="text-xs text-[#F87171]">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C5A26F] text-white text-sm font-medium rounded-xl hover:bg-[#B8915A] transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {loading ? (
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Get 10% Off
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[10px] text-[#666] mt-4 text-center">
                      No spam, ever. Unsubscribe anytime. By subscribing, you agree to our{" "}
                      <a href="/privacy" className="text-[#888] hover:text-[#C5A26F] underline">
                        Privacy Policy
                      </a>.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-4">
                      <Mail size={24} className="text-[#4ADE80]" />
                    </div>
                    <h3 className="font-display text-xl text-white mb-2">You're in!</h3>
                    <p className="text-[#999] text-sm">
                      Check your inbox for your 10% off code. Welcome to the ALAYA INSIDER community.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A26F]/30 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
