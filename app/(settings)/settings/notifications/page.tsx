"use client";

import React, { useState, useEffect } from "react";
import {
  Bell, BellOff, Mail, Smartphone, Monitor, Check, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, Save
} from "lucide-react";

const DEMO_USER_ID = "user_demo";

type Channel = "inApp" | "email" | "push";
type PrefKey = 
  | "priceDropEmail" | "priceDropPush" | "priceDropInApp"
  | "dealAlertEmail" | "dealAlertPush" | "dealAlertInApp"
  | "newArticleEmail" | "newArticlePush" | "newArticleInApp"
  | "commentReplyEmail" | "commentReplyPush" | "commentReplyInApp"
  | "weeklyDigestEmail"
  | "backInStockEmail" | "backInStockPush" | "backInStockInApp";

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  channels: { key: PrefKey; channel: Channel; label: string }[];
}

const CATEGORIES: NotificationCategory[] = [
  {
    id: "price_drop",
    label: "Price Drops",
    description: "Get notified when products on your wishlist drop in price.",
    channels: [
      { key: "priceDropInApp", channel: "inApp", label: "In-App" },
      { key: "priceDropEmail", channel: "email", label: "Email" },
      { key: "priceDropPush", channel: "push", label: "Push" },
    ],
  },
  {
    id: "deal_alert",
    label: "Deal Alerts",
    description: "Limited-time deals, flash sales, and promotional offers.",
    channels: [
      { key: "dealAlertInApp", channel: "inApp", label: "In-App" },
      { key: "dealAlertEmail", channel: "email", label: "Email" },
      { key: "dealAlertPush", channel: "push", label: "Push" },
    ],
  },
  {
    id: "new_article",
    label: "New Articles",
    description: "When new editorial content is published in your favorite universes.",
    channels: [
      { key: "newArticleInApp", channel: "inApp", label: "In-App" },
      { key: "newArticleEmail", channel: "email", label: "Email" },
      { key: "newArticlePush", channel: "push", label: "Push" },
    ],
  },
  {
    id: "comment_reply",
    label: "Comment Replies",
    description: "When someone replies to your comment or their comment status changes.",
    channels: [
      { key: "commentReplyInApp", channel: "inApp", label: "In-App" },
      { key: "commentReplyEmail", channel: "email", label: "Email" },
      { key: "commentReplyPush", channel: "push", label: "Push" },
    ],
  },
  {
    id: "back_in_stock",
    label: "Back in Stock",
    description: "When previously out-of-stock products become available again.",
    channels: [
      { key: "backInStockInApp", channel: "inApp", label: "In-App" },
      { key: "backInStockEmail", channel: "email", label: "Email" },
      { key: "backInStockPush", channel: "push", label: "Push" },
    ],
  },
  {
    id: "weekly_digest",
    label: "Weekly Digest",
    description: "A curated weekly roundup of top stories, deals, and discoveries.",
    channels: [
      { key: "weeklyDigestEmail", channel: "email", label: "Email" },
    ],
  },
];

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  inApp: <Monitor size={14} />,
  email: <Mail size={14} />,
  push: <Smartphone size={14} />,
};

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    price_drop: true,
    deal_alert: false,
    new_article: false,
    comment_reply: false,
    back_in_stock: false,
    weekly_digest: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/user/preferences/notifications?userId=${DEMO_USER_ID}`);
      const json = await res.json();
      if (json.success) {
        const data = json.data;
        // Map API response to preference keys, falling back to defaults
        setPrefs({
          priceDropInApp: data.priceDropInApp ?? true,
          priceDropEmail: data.priceDropEmail ?? false,
          priceDropPush: data.priceDropPush ?? true,
          dealAlertInApp: data.dealAlertInApp ?? true,
          dealAlertEmail: data.dealAlertEmail ?? false,
          dealAlertPush: data.dealAlertPush ?? true,
          newArticleInApp: data.newArticleInApp ?? true,
          newArticleEmail: data.newArticleEmail ?? false,
          newArticlePush: data.newArticlePush ?? false,
          commentReplyInApp: data.commentReplyInApp ?? true,
          commentReplyEmail: data.commentReplyEmail ?? false,
          commentReplyPush: data.commentReplyPush ?? true,
          weeklyDigestEmail: data.weeklyDigestEmail ?? true,
          backInStockInApp: data.backInStockInApp ?? true,
          backInStockEmail: data.backInStockEmail ?? false,
          backInStockPush: data.backInStockPush ?? true,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const togglePref = (key: PrefKey) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/user/preferences/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: DEMO_USER_ID, ...prefs }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(json.error?.message || "Failed to save");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-[#8A8178]">
        <RefreshCw size={18} className="animate-spin" />
        <span className="text-sm">Loading notification preferences...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2px] text-[#C5AA8A]">
          <Bell size={14} /> NOTIFICATIONS
        </div>
        <h1 className="text-[28px] font-semibold tracking-[-0.8px] mt-1 text-[#2C2522]">
          Notification Preferences
        </h1>
        <p className="text-[#6D655F] text-sm mt-1">
          Choose how and when you hear from us across each channel.
        </p>
      </div>

      {/* Feedback */}

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#4ADE80]/10 text-[#4ADE80] text-sm mb-6 border border-[#4ADE80]/20">
          <Check size={16} />
          Preferences saved successfully.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#F87171]/10 text-[#F87171] text-sm mb-6 border border-[#F87171]/20">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Preferences List */}

      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const isExpanded = expandedCategories[category.id];
          const enabledChannels = category.channels.filter((c) => prefs[c.key]);
          const allEnabled = category.channels.every((c) => prefs[c.key]);
          const someEnabled = category.channels.some((c) => prefs[c.key]);

          return (
            <div
              key={category.id}
              className="bg-white border border-[#E4DDD5] rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAF7F4] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell size={18} className={someEnabled ? "text-[#C5AA8A]" : "text-[#8A8178]"} />
                  <div>
                    <div className="text-sm font-medium text-[#2C2522]">{category.label}</div>
                    <div className="text-xs text-[#6D655F] mt-0.5">{category.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {category.channels.map((ch) => (
                      <span
                        key={ch.channel}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                          prefs[ch.key]
                            ? "bg-[#C5AA8A]/10 text-[#C5AA8A]"
                            : "bg-[#EFE7DE]/50 text-[#8A8178]"
                        }`}
                      >
                        {CHANNEL_ICONS[ch.channel]}
                        <span className="hidden sm:inline">{ch.label}</span>
                      </span>
                    ))}
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-[#8A8178]" /> : <ChevronDown size={16} className="text-[#8A8178]" />}
                </div>
              </button>

              {/* Channel Toggles */}
              {isExpanded && (
                <div className="border-t border-[#E4DDD5] px-5 py-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {category.channels.map((ch) => {
                      const isOn = prefs[ch.key];
                      return (
                        <button
                          key={ch.key}
                          onClick={() => togglePref(ch.key)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all ${
                            isOn
                              ? "bg-[#C5AA8A]/10 text-[#C5AA8A] border border-[#C5AA8A]/20"
                              : "bg-[#FAF7F4] text-[#6D655F] border border-[#E4DDD5] hover:border-[#C5AA8A]/30"
                          }`}
                        >
                          <span className={isOn ? "text-[#C5AA8A]" : "text-[#8A8178]"}>
                            {CHANNEL_ICONS[ch.channel]}
                          </span>
                          <span className="text-xs font-medium">{ch.label}</span>
                          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isOn ? "bg-[#C5AA8A] border-[#C5AA8A]" : "border-[#8A8178]"
                          }`}>
                            {isOn && <Check size={12} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        const allOn = category.channels.every((c) => prefs[c.key]);
                        category.channels.forEach((c) => {
                          if (allOn !== prefs[c.key]) togglePref(c.key);
                        });
                      }}
                      className="text-xs text-[#C5AA8A] hover:underline"
                    >
                      {allEnabled ? "Disable all" : "Enable all"}
                    </button>
                    <span className="text-[10px] text-[#8A8178]">
                      {enabledChannels.length} of {category.channels.length} active
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C5AA8A] text-white text-sm font-medium rounded-xl hover:bg-[#B89B7A] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        <button
          onClick={fetchPreferences}
          disabled={loading}
          className="px-4 py-2.5 text-sm text-[#6D655F] hover:text-[#2C2522] transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Reset
        </button>
      </div>
    </div>
  );
}
