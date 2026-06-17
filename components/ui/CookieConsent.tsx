"use client";

import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

const CONSENT_COOKIE = "alaya_cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

type ConsentLevel = "all" | "necessary" | null;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const setConsent = (level: ConsentLevel) => {
    const expires = new Date(Date.now() + CONSENT_EXPIRY_DAYS * 86400000).toUTCString();
    document.cookie = `${CONSENT_COOKIE}=${level}; Path=/; Expires=${expires}; SameSite=Lax`;
    setVisible(false);
  };

  const acceptAll = () => setConsent("all");
  const acceptNecessary = () => setConsent("necessary");

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-[#1C1C1C] border border-[#333] rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="hidden md:flex w-10 h-10 rounded-lg bg-[#C5A26F]/10 items-center justify-center shrink-0">
            <Cookie size={20} className="text-[#C5A26F]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium text-white">Your Privacy Matters</h3>
              <button
                onClick={() => setVisible(false)}
                className="text-[#888] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#999] mt-2 leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic,
              and deliver personalized content. You can choose which cookies to allow.
            </p>

            {showDetails && (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <div className="text-white font-medium">Necessary Cookies</div>
                    <div className="text-[#888] mt-0.5">Required for basic site functionality. Cannot be disabled.</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20">
                    Always active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <div className="text-white font-medium">Analytics Cookies</div>
                    <div className="text-[#888] mt-0.5">Help us understand how visitors interact with our site.</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <div className="text-white font-medium">Marketing Cookies</div>
                    <div className="text-[#888] mt-0.5">Used to deliver relevant advertisements and track affiliate conversions.</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={acceptAll}
                className="px-5 py-2 bg-[#C5A26F] text-white text-xs font-medium rounded-lg hover:bg-[#B8915A] transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={acceptNecessary}
                className="px-5 py-2 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/15 transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-5 py-2 text-[#999] text-xs hover:text-white transition-colors"
              >
                {showDetails ? "Hide details" : "Customize"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
