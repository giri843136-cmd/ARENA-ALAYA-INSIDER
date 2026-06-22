"use client";

import { useState } from "react";
import { Bell, CheckCheck, Package, Tag, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type Notification = {
  id: string;
  type: "price_drop" | "back_in_stock" | "deal" | "trend" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "price_drop",
    title: "Price Drop Alert",
    body: "The Ceramic Pour-Over Set dropped from $78 to $68 — save $10!",
    read: false,
    createdAt: "2 hours ago",
    link: "/products/ceramic-pour-over-set",
  },
  {
    id: "2",
    type: "deal",
    title: "Limited Time Deal",
    body: "French Flax Linen Bedding Set is now 20% off — ends in 3 days.",
    read: false,
    createdAt: "5 hours ago",
    link: "/products/linen-bedding-set",
  },
  {
    id: "3",
    type: "trend",
    title: "Trending Now",
    body: "Organic cotton sheets are trending this week — see our top picks.",
    read: true,
    createdAt: "1 day ago",
    link: "/search?q=organic+cotton+sheets",
  },
  {
    id: "4",
    type: "back_in_stock",
    title: "Back in Stock",
    body: "The Marble Serving Board is back in stock — grab it while it lasts.",
    read: true,
    createdAt: "3 days ago",
    link: "/products/marble-serving-board",
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  price_drop: <Tag size={18} className="text-green-600" />,
  back_in_stock: <Package size={18} className="text-blue-600" />,
  deal: <Clock size={18} className="text-amber-600" />,
  trend: <TrendingUp size={18} className="text-purple-600" />,
  system: <Bell size={18} className="text-gray-600" />,
};

const BG_MAP: Record<string, string> = {
  price_drop: "bg-green-50 dark:bg-green-900/20",
  back_in_stock: "bg-blue-50 dark:bg-blue-900/20",
  deal: "bg-amber-50 dark:bg-amber-900/20",
  trend: "bg-purple-50 dark:bg-purple-900/20",
  system: "bg-gray-50 dark:bg-gray-800",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-[#F5F0EA] dark:bg-[#1F1A17] min-h-[70vh] flex items-center">
        <div className="container">
          <EmptyState
            title="No notifications yet"
            description="We'll let you know when prices drop, deals go live, or something you love is back in stock."
            icon="product"
            actionLabel="Explore products"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EA] dark:bg-[#1F1A17] min-h-screen">
      <div className="container py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-[#26221E] dark:text-[#EDE6DC]">
              Notifications
            </h1>
            <p className="text-[#6D655F] dark:text-[#B8AFA3] mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck size={16} />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                filter === f
                  ? "bg-[#26221E] text-[#F5F0EA] dark:bg-[#EDE6DC] dark:text-[#1F1A17]"
                  : "bg-white/50 dark:bg-white/10 text-[#6D655F] dark:text-[#B8AFA3] hover:bg-white dark:hover:bg-white/20"
              }`}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-w-2xl">
          {filtered.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link || "#"}
              onClick={() => markRead(notification.id)}
              className={`block p-4 rounded-xl border transition-all ${
                notification.read
                  ? "bg-white/50 dark:bg-white/5 border-[#E4DDD5] dark:border-[#3D3530]"
                  : "bg-white dark:bg-white/10 border-[#C5AA8A] dark:border-[#D4B88A] shadow-sm"
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    BG_MAP[notification.type]
                  }`}
                >
                  {ICON_MAP[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm ${
                        notification.read
                          ? "text-[#26221E] dark:text-[#EDE6DC]"
                          : "text-[#26221E] dark:text-[#EDE6DC] font-semibold"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-[#C5AA8A] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-[#6D655F] dark:text-[#B8AFA3] mt-0.5">
                    {notification.body}
                  </p>
                  <p className="text-xs text-[#8A8178] dark:text-[#8A8178] mt-1.5">
                    {notification.createdAt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
