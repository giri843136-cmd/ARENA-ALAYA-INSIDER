"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Bell, BellOff, Save } from "lucide-react";

export default function SystemSettings() {
  const [commentNotifMuted, setCommentNotifMuted] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const toggleCommentMute = () => {
    const newMuted = !commentNotifMuted;
    setCommentNotifMuted(newMuted);
    toast.success(newMuted ? "Comment notifications muted" : "Comment notifications unmuted");
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">PLATFORM</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">System Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Site Status */}
        <div>
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">SITE</div>
          <div className="admin-card p-6 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Maintenance Mode</span>
              <button
                onClick={() => { setMaintenanceMode(!maintenanceMode); toast.success(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled"); }}
                className={`w-12 h-7 rounded-full transition-colors ${maintenanceMode ? "bg-[#F87171]" : "bg-[#333]"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex justify-between">Public Site Status <span className="text-[#4ADE80]">LIVE</span></div>
            <div className="flex justify-between">CDN Cache <span className="text-[var(--admin-accent)]">Active</span></div>
          </div>
        </div>

        {/* AI & Personalization */}
        <div>
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">AI &amp; PERSONALIZATION</div>
          <div className="admin-card p-6 text-sm space-y-3">
            <div className="flex justify-between"><span>Default Model</span><span className="text-[var(--admin-accent)]">Claude 3.7 Sonnet</span></div>
            <div className="flex justify-between"><span>AI Workspace</span><span className="text-[#4ADE80]">Active</span></div>
            <div className="flex justify-between"><span>Recommendation Engine</span><span className="text-[#4ADE80]">Running</span></div>
          </div>
        </div>

        {/* Integrations */}
        <div>
          <div className="text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">INTEGRATIONS</div>
          <div className="admin-card p-6 text-sm space-y-2">
            {["Typesense Search", "BullMQ Queues", "Redis Cache", "PostgreSQL"].map((svc, i) => (
              <div key={i} className="flex justify-between"><span>{svc}</span><span className="text-[#4ADE80]">● Healthy</span></div>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[2px] text-[var(--admin-accent)] mb-3">
            <Bell size={14} /> NOTIFICATION PREFERENCES
          </div>
          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  {commentNotifMuted ? <BellOff size={18} className="text-[#F87171] mt-0.5" /> : <Bell size={18} className="text-[#4ADE80] mt-0.5" />}
                  <div>
                    <div className="text-sm font-medium">Comment Status Notifications</div>
                    <div className="text-xs text-[var(--admin-text-secondary)] mt-0.5">
                      {commentNotifMuted ? "Notifications muted" : "Receive notifications when comment status changes"}
                    </div>
                  </div>
                </div>
                <button onClick={toggleCommentMute}
                  className={`w-12 h-7 rounded-full transition-colors ${commentNotifMuted ? "bg-[#333]" : "bg-[#C5AA8A]"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${commentNotifMuted ? "translate-x-1" : "translate-x-6"}`} />
                </button>
              </div>
          </div>
        </div>

        <button className="btn-admin-primary flex items-center gap-2" onClick={() => toast.success("Settings saved")}>
          <Save size={14} /> Save Changes
        </button>
      </div>
    </div>
  );
}
