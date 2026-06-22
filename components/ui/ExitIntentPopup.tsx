"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mail, Sparkles } from "lucide-react";

interface ExitIntentPopupProps {
  /** Delay before popup is enabled (ms) */
  enabledDelay?: number;
  /** Cookie name to track dismissal */
  cookieName?: string;
  /** Days before showing again after dismissal */
  cookieExpiryDays?: number;
  /** Callback when email is submitted */
  onSubscribe?: (email: string) => Promise<void>;
}

export function ExitIntentPopup({
  enabledDelay = 10000,
  cookieName = "alaya_exit_intent",
  cookieExpiryDays = 30,
  onSubscribe,
}: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const trackedRef = useRef(false);

  // Enable after delay
  useEffect(() => {
    const timer = setTimeout(() => setEnabled(true), enabledDelay);
    return () => clearTimeout(timer);
  }, [enabledDelay]);

  // Check cookie on mount — skip if already dismissed
  useEffect(() => {
    const dismissed = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`));
    if (dismissed) {
      trackedRef.current = true; // prevent showing
      return;
    }
  }, [cookieName]);

  // Track mouse exit
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!enabled || trackedRef.current) return;
    // Only trigger when mouse exits the top of the viewport
    if (e.clientY <= 0) {
      trackedRef.current = true;
      setVisible(true);
    }
  }, [enabled]);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const dismiss = useCallback(() => {
    setVisible(false);
    const expires = new Date(Date.now() + cookieExpiryDays * 86400000).toUTCString();
    document.cookie = `${cookieName}=dismissed; Path=/; Expires=${expires}; SameSite=Lax`;
  }, [cookieName, cookieExpiryDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      } else {
        // Default: call newsletter API
        const res = await fetch("/api/v1/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: "", source: "exit_intent" }),
        });
        if (!res.ok) throw new Error("Subscription failed");
      }
      setSubscribed(true);
      // Dismiss after success
      setTimeout(dismiss, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Popup */}
      <div className="relative w-full max-w-md bg-[#1C1C1C] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 text-center">
          {subscribed ? (
            <>
              <div className="w-12 h-12 rounded-full bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-[#4ADE80]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">You&apos;re In! 🎉</h3>
              <p className="text-sm text-[#999]">
                Welcome to the ALAYA INSIDER community. Check your inbox for your welcome discount code.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#C5A26F]/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-[#C5A26F]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Before You Go...
              </h3>
              <p className="text-sm text-[#999] mb-6">
                Subscribe to our newsletter and get <strong className="text-white">10% off</strong> your first curated discovery. Be the first to know about new arrivals, exclusive deals, and insider stories.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-white/5 border border-[#333] rounded-xl text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#C5A26F] transition-colors"
                  required
                  disabled={submitting}
                />
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="w-full py-2.5 bg-[#C5A26F] text-white text-sm font-medium rounded-xl hover:bg-[#B8915A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-pulse">Subscribing...</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Get 10% Off
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 text-[10px] text-[#666]">
                No spam, ever. Unsubscribe anytime. View our{" "}
                <a href="/privacy" className="text-[#C5A26F] hover:underline">Privacy Policy</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
