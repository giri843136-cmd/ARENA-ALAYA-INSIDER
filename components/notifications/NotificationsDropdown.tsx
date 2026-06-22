"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, RefreshCw, ExternalLink, Trash2, Clock } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  link?: string;
  type: string;
  data?: any;
};

interface NotificationsDropdownProps {
  userId?: string;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  PRICE_DROP: <Bell size={14} className="text-[#4ADE80]" />,
  BACK_IN_STOCK: <Bell size={14} className="text-[#60A5FA]" />,
  NEW_ARTICLE: <Bell size={14} className="text-[#7A6848]" />,
  AFFILIATE_ALERT: <Bell size={14} className="text-[#FBBF24]" />,
  SYSTEM: <Bell size={14} className="text-[#A1A1A1]" />,
  SECURITY: <Bell size={14} className="text-[#F87171]" />,
  COMMENT_APPROVED: <Bell size={14} className="text-[#4ADE80]" />,
  COMMENT_FLAGGED: <Bell size={14} className="text-[#F87171]" />,
};

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationsDropdown({ userId = "user_demo", className = "" }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/user/notifications?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch {
      console.warn("Failed to fetch notifications — using fallback");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchNotifications();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      await fetch(`/api/v1/user/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      console.warn("Failed to mark notification as read");
    } finally {
      setMarkingRead(null);
    }
  };

  const getTypeIcon = (type: string) => TYPE_ICONS[type] || <Bell size={14} className="text-[#A1A1A1]" />;

  // Fetch on open if more than 2 minutes old
  const lastFetchRef = useRef(0);
  const handleToggle = () => {
    if (!open && Date.now() - lastFetchRef.current > 120000) {
      lastFetchRef.current = Date.now();
      fetchNotifications();
    }
    setOpen(!open);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-[#E4DDD5] dark:hover:bg-[#3D3530] transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={20} strokeWidth={1.5} className="text-[#6D655F] dark:text-[#B8AFA3]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7A6848] text-[10px] font-medium text-white flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#2F2925] rounded-xl border border-[#E4DDD5] dark:border-[#3D3530] shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="p-3 border-b border-[#E4DDD5] dark:border-[#3D3530] flex items-center justify-between">
            <span className="text-sm font-medium text-[#26221E] dark:text-[#EDE6DC]">
              Notifications
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 rounded hover:bg-[#E4DDD5] dark:hover:bg-[#3D3530] transition-colors"
                title="Refresh"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </button>
              <Link
                href="/notifications"
                className="text-xs text-[#7A6848] hover:text-[#B99B79] transition-colors"
              >
                See all
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={16} className="animate-spin text-[#5C5249]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={24} className="mx-auto text-[#E4DDD5] dark:text-[#3D3530] mb-2" />
                <p className="text-sm text-[#5C5249]">No notifications yet</p>
                <p className="text-[10px] text-[#B8AFA3] mt-1">We&apos;ll notify you when something needs your attention.</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 p-3 border-b border-[#E4DDD5]/50 dark:border-[#3D3530]/50 hover:bg-[#F5F0EA]/50 dark:hover:bg-white/5 transition-colors ${
                    !n.read ? "bg-[#7A6848]/5" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.read ? "text-[#6D655F] dark:text-[#B8AFA3]" : "text-[#26221E] dark:text-[#EDE6DC] font-medium"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          disabled={markingRead === n.id}
                          className="flex-shrink-0 p-0.5 rounded hover:bg-[#E4DDD5] dark:hover:bg-[#3D3530] opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Mark as read"
                        >
                          <Check size={12} className="text-[#5C5249]" />
                        </button>
                      )}
                    </div>
                    {n.body && (
                      <p className="text-xs text-[#5C5249] dark:text-[#B8AFA3] mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#B8AFA3]">
                        <Clock size={10} className="inline mr-0.5" />
                        {formatRelative(n.createdAt)}
                      </span>
                      {n.data?.articleUrl && (
                        <a
                          href={n.data.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#7A6848] hover:underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink size={10} />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="p-2 border-t border-[#E4DDD5] dark:border-[#3D3530]">
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/v1/user/notifications/read-all", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId }),
                    });
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    setUnreadCount(0);
                  } catch {}
                }}
                className="w-full py-1.5 text-xs text-[#5C5249] hover:text-[#6D655F] transition-colors text-center"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
