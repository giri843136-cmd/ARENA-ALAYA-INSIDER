"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Users, BookOpen, TrendingUp, Search, Bot, Zap,
  Shield, Activity, Settings, ChevronLeft, ChevronRight, BarChart3, Globe,
  Image, Target, Link as LinkIcon, Database, MessageSquare, FlaskConical,
  Key, WebhookIcon, Flag, SearchX, TrendingUp as TrendIcon,
  DollarSign, Link2, FileText, Bell, Mail, Tag, Languages
} from "lucide-react";

const navGroups = [
  {
    label: "Command",
    items: [
      { href: "/admin", label: "Command Center", icon: LayoutDashboard },
      { href: "/admin/commission", label: "Commission & Earnings", icon: DollarSign },
      { href: "/admin/revenue", label: "Revenue Intelligence", icon: BarChart3 },
      { href: "/admin/affiliates", label: "Affiliate Links", icon: Link2 },
      { href: "/admin/link-health", label: "Link Health Monitor", icon: Activity },
    ]
  },
  {
    label: "Content",
    items: [
      { href: "/admin/products", label: "Product Studio", icon: Package },
      { href: "/admin/brands", label: "Brand Vault", icon: Users },
      { href: "/admin/story-builder", label: "Story Builder", icon: BookOpen },
      { href: "/admin/journal", label: "INSIDER Journal", icon: BookOpen },
      { href: "/admin/comments", label: "Comments", icon: MessageSquare },
      { href: "/admin/media", label: "Media Atelier", icon: Image },
      { href: "/admin/kanban", label: "Kanban Board", icon: LayoutDashboard },
      { href: "/admin/calendar", label: "Content Calendar", icon: LayoutDashboard },
    ]
  },
  {
    label: "Discovery",
    items: [
      { href: "/admin/seo", label: "SEO Command", icon: Target },
      { href: "/admin/seo-audit", label: "SEO Audit", icon: Search },
      { href: "/admin/search", label: "Search Intelligence", icon: Search },
      { href: "/admin/recommendations", label: "Recommendation Engine", icon: TrendingUp },
      { href: "/admin/feed-manager", label: "Feed Manager", icon: Database },
      { href: "/admin/broken-links", label: "Broken Links", icon: SearchX },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/ai", label: "AI Workspace", icon: Bot },
      { href: "/admin/automation", label: "Automation Center", icon: Zap },
      { href: "/admin/trends", label: "Trend Radar", icon: TrendIcon },
      { href: "/admin/ab-tests", label: "A/B Tests", icon: FlaskConical },
      { href: "/admin/content-roi", label: "Content ROI", icon: FileText },
    ]
  },
  {
    label: "Audience & Revenue",
    items: [
      { href: "/admin/audience", label: "Audience Hub", icon: Users },
      { href: "/admin/email-campaigns", label: "Email Campaigns", icon: Mail },
      { href: "/admin/campaigns", label: "Campaign Center", icon: Globe },
      { href: "/admin/price-monitor", label: "Price Monitor", icon: Bell },
      { href: "/admin/deals", label: "Deals & Coupons", icon: Tag },
    ]
  },
  {
    label: "System",
    items: [
      { href: "/admin/security", label: "Security Center", icon: Shield },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/activity-logs", label: "Activity & Audit", icon: Activity },
      { href: "/admin/moderation-logs", label: "Moderation Logs", icon: Shield },
      { href: "/admin/api-keys", label: "API Keys", icon: Key },
      { href: "/admin/webhooks", label: "Webhooks", icon: WebhookIcon },
      { href: "/admin/feature-flags", label: "Feature Flags", icon: Flag },
      { href: "/admin/integrations", label: "Integrations", icon: LinkIcon },
      { href: "/admin/i18n", label: "i18n & Localization", icon: Languages },
      { href: "/admin/settings", label: "System Settings", icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`admin-sidebar flex-shrink-0 flex flex-col border-r border-[#252525] transition-all duration-200 ${collapsed ? 'w-[68px]' : 'w-[248px]'}`}>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#252525] justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-[#C5A26F] flex items-center justify-center">
            <span className="text-[#0A0A0A] text-xs font-semibold tracking-[-1px]">A</span>
          </div>
          {!collapsed && <span className="font-semibold tracking-tight text-lg">ALAYA</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-[#1F1F1F] rounded">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 text-sm">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <div className="px-4 text-[10px] font-medium tracking-[1px] text-[#666] mb-2">{group.label}</div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-sidebar-item ${isActive ? "active" : ""} ${collapsed ? "justify-center px-3" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#252525] text-[10px] text-[#666] flex items-center justify-between">
        {!collapsed && <div>ALAYA v2026.06</div>}
        <div className="text-[#C5A26F]">● LIVE</div>
      </div>
    </div>
  );
}
