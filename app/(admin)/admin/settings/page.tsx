"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, RefreshCw, Check, X, AlertTriangle } from "lucide-react";

// Demo user context — in production this would come from auth
const DEMO_USER_ID = "user_demo_admin";

export default function SystemSettings() {
  const [commentNotifMuted, setCommentNotifMuted] = useState(false);
  const [mutes, setMutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/user/notification-mutes?userId=${DEMO_USER_ID}`);
      const json = await res.json();
      if (json.success) {
        setCommentNotifMuted(json.data.commentNotificationsMuted);
        setMutes(json.data.mutes);
      }
    } catch (err) {
      console.error("Failed to load notification preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const toggleCommentMute = async () => {
    const newMuted = !commentNotifMuted;
    setSaving("comment");
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/user/notification-mutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          targetType: "notification_type",
          targetId: "COMMENT_STATUS_CHANGED",
          muted: newMuted,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCommentNotifMuted(newMuted);
        setFeedback({
          type: "success",
          message: newMuted ? "Comment notifications muted" : "Comment notifications unmuted",
        });
        // Update mute list count from response
        if (json.data?.muted !== undefined) {
          setCommentNotifMuted(json.data.muted);
        }
      } else {
        setFeedback({ type: "error", message: json.error?.message || "Failed to update preference" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Network error" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">PLATFORM</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">System Settings</h1>
      </div>

      <div className="space-y-8">
        <div>
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">SITE</div>
          <div className="admin-card p-6 space-y-4 text-sm">
            <div className="flex justify-between">Maintenance Mode <span className="text-[#4ADE80]">OFF</span></div>
            <div className="flex justify-between">Public Site Status <span className="text-[#4ADE80]">LIVE</span></div>
            <div className="flex justify-between">CDN Cache <span className="text-[var(--admin-accent)]">99.8% hit rate</span></div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">AI &amp; PERSONALIZATION</div>
          <div className="admin-card p-6 text-sm space-y-3">
            <div>Default model: Claude 3.7 Sonnet (Opus priority enabled)</div>
            <div>Personal AI Concierge: Active • 1,847 generations today</div>
            <div>Recommendation graph: Fresh (refreshed 4m ago)</div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">INTEGRATIONS</div>
          <div className="admin-card p-6 text-sm">Typesense, Upstash Redis, BullMQ queues, Stripe, all healthy.</div>
        </div>

        {/* Notification Preferences */}
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">
            <Bell size={14} />
            NOTIFICATION PREFERENCES
          </div>
          <div className="admin-card p-6 space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)]">
                <RefreshCw size={14} className="animate-spin" />
                Loading preferences...
              </div>
            ) : (
              <>
                {/* Feedback toast */}
                {feedback && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    feedback.type === "success"
                      ? "bg-[#4ADE80]/10 text-[#4ADE80]"
                      : "bg-[#F87171]/10 text-[#F87171]"
                  }`}>
                    {feedback.type === "success" ? <Check size={12} /> : <AlertTriangle size={12} />}
                    {feedback.message}
                  </div>
                )}

                {/* Comment Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    {commentNotifMuted ? (
                      <BellOff size={18} className="text-[#F87171] mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bell size={18} className="text-[#4ADE80] mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-[#EDEDED]">
                        Comment Status Notifications
                      </div>
                      <div className="text-xs text-[var(--admin-text-secondary)] mt-0.5">
                        {commentNotifMuted
                          ? "You will not receive notifications when your comments are approved, flagged, or removed."
                          : "Receive in-app notifications and emails when your comment status changes."}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleCommentMute}
                    disabled={saving === "comment"}
                    className={`flex-shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
                      commentNotifMuted
                        ? "bg-[#333]"
                        : "bg-[#C5AA8A]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      commentNotifMuted ? "translate-x-1" : "translate-x-6"
                    }`} />
                  </button>
                </div>

                {/* Mute count info */}
                <div className="text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-3">
                  {mutes.length > 0
                    ? `${mutes.length} notification mute${mutes.length === 1 ? " is" : "s are"} active`
                    : "No notification mutes configured."}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          className="btn-admin-primary"
          onClick={() => alert("Settings saved (demo — all production config frozen)")}
        >
          Save Changes
        </button>
      </div>

      <div className="text-xs text-[var(--admin-text-muted)] mt-10">All production readiness work (Docker, PM2, Nginx, workers, env validation, backups) remains frozen and untouched.</div>
    </div>
  );
}

