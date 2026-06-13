"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
  type: string;
};

const MOCK_PREVIEW: Notification[] = [
  {
    id: "1",
    title: "Price Drop Alert",
    body: "Ceramic Pour-Over Set dropped to $68",
    read: false,
    createdAt: "2h",
    link: "/products/ceramic-pour-over-set",
    type: "price_drop",
  },
  {
    id: "2",
    title: "Back in Stock",
    body: "Marble Serving Board is back",
    read: true,
    createdAt: "3d",
    link: "/products/marble-serving-board",
    type: "back_in_stock",
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications] = useState(MOCK_PREVIEW);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-[#E4DDD5] dark:hover:bg-[#3D3530] transition-colors"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell size={20} strokeWidth={1.5} className="text-[#6D655F] dark:text-[#B8AFA3]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#7A6848] text-[10px] font-medium text-white flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#2F2925] rounded-xl border border-[#E4DDD5] dark:border-[#3D3530] shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-[#E4DDD5] dark:border-[#3D3530] flex items-center justify-between">
            <span className="text-sm font-medium text-[#26221E] dark:text-[#EDE6DC]">
              Notifications
            </span>
            <Link
              href="/notifications"
              className="text-xs text-[#7A6848] hover:text-[#B99B79] transition-colors"
            >
              See all
            </Link>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#5C5249]">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => setOpen(false)}
                  className={`block p-3 border-b border-[#E4DDD5]/50 dark:border-[#3D3530]/50 hover:bg-[#F5F0EA]/50 dark:hover:bg-white/5 transition-colors ${
                    !n.read ? "bg-[#7A6848]/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#7A6848] mt-1.5 flex-shrink-0" />
                    )}
                    <div className={n.read ? "ml-4" : ""}>
                      <p className="text-sm font-medium text-[#26221E] dark:text-[#EDE6DC]">
                        {n.title}
                      </p>
                      <p className="text-xs text-[#6D655F] dark:text-[#B8AFA3] mt-0.5">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-[#5C5249] mt-1">{n.createdAt}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
