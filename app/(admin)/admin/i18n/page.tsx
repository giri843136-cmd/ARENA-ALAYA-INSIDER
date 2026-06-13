"use client";

import React, { useState } from "react";
import {
  Globe, CheckCircle, AlertTriangle, RefreshCw,
  Languages, DollarSign, Eye, Edit3
} from "lucide-react";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", active: true, products: 18420 },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", active: true, products: 18420 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", active: true, products: 18420 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", active: true, products: 18420 },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar", locale: "en-AU", active: true, products: 18420 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", active: true, products: 18420 },
];

export default function Internationalization() {
  const [currencies] = useState(CURRENCIES);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Globe size={14} /> INTERNATIONALIZATION
        </div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">i18n &amp; Localization</h1>
        <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Manage currencies, translations, and regional content settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Currencies */}
        <div className="lg:col-span-7 widget">
          <div className="widget-title flex items-center gap-2"><DollarSign size={14} /> ACTIVE CURRENCIES</div>
          <div className="space-y-2 mt-4">
            {currencies.map((c) => (
              <div key={c.code} className="flex items-center justify-between p-4 rounded-lg border border-[var(--admin-border)]">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-light w-10 text-center">{c.symbol}</span>
                  <div>
                    <div className="font-medium">{c.code} — {c.name}</div>
                    <div className="text-xs text-[var(--admin-text-secondary)]">{c.locale} • {c.products.toLocaleString()} products</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge-admin badge-admin-success text-[10px]">Active</div>
                  <button className="btn-admin btn-admin-ghost text-xs p-1.5"><Eye size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="widget p-6">
            <div className="widget-title flex items-center gap-2"><Languages size={14} /> LANGUAGE SUPPORT</div>
            <div className="space-y-3 mt-3">
              {[
                { lang: "English", code: "en", coverage: "100%", status: "complete" },
                { lang: "Spanish", code: "es", coverage: "85%", status: "in_progress" },
                { lang: "French", code: "fr", coverage: "85%", status: "in_progress" },
                { lang: "German", code: "de", coverage: "85%", status: "in_progress" },
                { lang: "Japanese", code: "ja", coverage: "80%", status: "in_progress" },
              ].map((l) => (
                <div key={l.code} className="flex items-center justify-between text-sm border-b border-[var(--admin-border)] pb-3 last:border-none">
                  <div>
                    <span className="font-medium">{l.lang}</span>
                    <span className="text-xs text-[var(--admin-text-muted)] ml-2">({l.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--admin-text-secondary)]">{l.coverage}</span>
                    {l.status === "complete" ? (
                      <CheckCircle size={14} className="text-[#4ADE80]" />
                    ) : (
                      <AlertTriangle size={14} className="text-[#FBBF24]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget p-6">
            <div className="widget-title">DETECTION RULES</div>
            <div className="space-y-3 text-sm mt-3">
              <div className="flex justify-between py-2 border-b border-[var(--admin-border)]">
                <span>Geo-IP Detection</span>
                <span className="text-[#4ADE80]">Enabled</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--admin-border)]">
                <span>Browser Language</span>
                <span className="text-[#4ADE80]">Enabled</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--admin-border)]">
                <span>Currency Selector</span>
                <span className="text-[#4ADE80]">Active (14 currencies)</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Fallback Currency</span>
                <span className="font-mono text-xs">USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-center gap-2">
        <AlertTriangle size={12} /> Currency conversion uses real-time exchange rates via the Open Exchange Rates API with fallback hardcoded rates.
      </div>
    </div>
  );
}
