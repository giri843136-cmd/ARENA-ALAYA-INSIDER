"use client";

import React, { useState } from "react";
import {
  BookOpen, Search, ExternalLink, FileText, Code, Copy,
  CheckCircle, ArrowRight, Shield, Package, Users,
  Globe, Server, Key, Zap, Mail, Bell, MessageSquare,
  Image, Link as LinkIcon, Database, TrendingUp, FlaskConical,
  LayoutDashboard, DollarSign, Target, Tag, Percent,
  WebhookIcon, Bot, Rocket, Upload, ChevronDown
} from "lucide-react";

// =============================================
// API ENDPOINT DEFINITIONS
// =============================================

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth: "None" | "Optional" | "Required" | "Admin" | "API Key";
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  responses?: { code: number; description: string }[];
}

interface ApiGroup {
  category: string;
  icon: React.ElementType;
  description: string;
  basePath: string;
  endpoints: Endpoint[];
}

const API_GROUPS: ApiGroup[] = [
  {
    category: "Products",
    icon: Package,
    description: "Product catalog, details, merchant selection, and embeds",
    basePath: "/api/v1/products",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/products",
        description: "Paginated list of all products with filters",
        auth: "None",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
          { name: "category", type: "string", required: false, description: "Filter by category slug" },
          { name: "brand", type: "string", required: false, description: "Filter by brand slug" },
          { name: "universe", type: "string", required: false, description: "Filter by universe slug" },
          { name: "sort", type: "string", required: false, description: "Sort: relevance, price_asc, price_desc, rating, newest" },
          { name: "minPrice", type: "number", required: false, description: "Minimum price filter" },
          { name: "maxPrice", type: "number", required: false, description: "Maximum price filter" },
        ],
        responses: [
          { code: 200, description: "Paginated product list" },
          { code: 400, description: "Invalid parameters" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/products",
        description: "Create a new product",
        auth: "Admin",
        parameters: [
          { name: "name", type: "string", required: true, description: "Product name" },
          { name: "slug", type: "string", required: true, description: "URL-friendly slug" },
          { name: "price", type: "number", required: true, description: "Product price" },
          { name: "brandId", type: "string", required: true, description: "Brand UUID" },
          { name: "universeId", type: "string", required: true, description: "Universe UUID" },
        ],
        responses: [
          { code: 201, description: "Product created" },
          { code: 400, description: "Validation error" },
          { code: 401, description: "Unauthorized" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/products/[slug]",
        description: "Get product details by slug",
        auth: "None",
        parameters: [
          { name: "slug", type: "string", required: true, description: "Product URL slug" },
        ],
        responses: [
          { code: 200, description: "Product details with brand, affiliate links, stats" },
          { code: 404, description: "Product not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/products/[slug]/best-merchant",
        description: "Best affiliate merchant for a product",
        auth: "None",
        parameters: [
          { name: "slug", type: "string", required: true, description: "Product URL slug" },
          { name: "details", type: "boolean", required: false, description: "Include full scoring details" },
        ],
        responses: [
          { code: 200, description: "Best merchant with URL, label, network, score" },
          { code: 404, description: "Product not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/products/embeds",
        description: "Generate product embed codes",
        auth: "Admin",
        parameters: [
          { name: "productId", type: "string", required: true, description: "Product UUID" },
          { name: "theme", type: "string", required: false, description: "Embed theme: default, compact, card" },
        ],
      },
    ],
  },
  {
    category: "Search & Discovery",
    icon: Search,
    description: "Full-text search, autocomplete, and search analytics",
    basePath: "/api/v1/search",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/search",
        description: "Full-text search across products, articles, and brands",
        auth: "None",
        parameters: [
          { name: "q", type: "string", required: true, description: "Search query" },
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
          { name: "type", type: "string", required: false, description: "Scope: all, products, articles, brands" },
          { name: "category", type: "string", required: false, description: "Category filter" },
          { name: "brand", type: "string", required: false, description: "Brand filter" },
          { name: "sort", type: "string", required: false, description: "Sort: relevance, price_asc, price_desc, rating, newest" },
        ],
        responses: [
          { code: 200, description: "Search results with pagination" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/search/autocomplete",
        description: "Autocomplete suggestions for search queries",
        auth: "None",
        parameters: [
          { name: "q", type: "string", required: true, description: "Partial search query" },
          { name: "limit", type: "number", required: false, description: "Max suggestions (default: 5)" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/search/analytics",
        description: "Search analytics data (top queries, zero results)",
        auth: "Admin",
        parameters: [
          { name: "period", type: "string", required: false, description: "Period: day, week, month" },
        ],
      },
    ],
  },
  {
    category: "Articles & Content",
    icon: FileText,
    description: "Editorial content, articles, and CMS operations",
    basePath: "/api/v1/articles",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/articles",
        description: "Paginated list of articles",
        auth: "None",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "limit", type: "number", required: false, description: "Items per page" },
          { name: "universe", type: "string", required: false, description: "Filter by universe" },
          { name: "author", type: "string", required: false, description: "Filter by author slug" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/articles/[slug]",
        description: "Get article details by slug",
        auth: "None",
        responses: [
          { code: 200, description: "Article with author, related products, stats" },
          { code: 404, description: "Article not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/articles",
        description: "Create a new article",
        auth: "Admin",
      },
    ],
  },
  {
    category: "Brands",
    icon: Users,
    description: "Brand vault and manufacturer information",
    basePath: "/api/v1/brands",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/brands/[slug]",
        description: "Get brand details by slug",
        auth: "None",
        responses: [
          { code: 200, description: "Brand details with products and stats" },
          { code: 404, description: "Brand not found" },
        ],
      },
    ],
  },
  {
    category: "Categories",
    icon: Database,
    description: "Product taxonomy and categories",
    basePath: "/api/v1/categories",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/categories",
        description: "List all product categories",
        auth: "None",
      },
      {
        method: "GET",
        path: "/api/v1/categories/[slug]",
        description: "Get category with products",
        auth: "None",
      },
    ],
  },
  {
    category: "Deals & Coupons",
    icon: Tag,
    description: "Active deals, coupons, and price alerts",
    basePath: "/api/v1/deals",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/deals",
        description: "List all deals and promotions",
        auth: "None",
      },
      {
        method: "GET",
        path: "/api/v1/deals/active",
        description: "Currently active deals only",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/price-alerts/subscribe",
        description: "Subscribe to price drop alerts",
        auth: "Optional",
        parameters: [
          { name: "email", type: "string", required: true, description: "Subscriber email" },
          { name: "productId", type: "string", required: true, description: "Product UUID" },
          { name: "targetPrice", type: "number", required: true, description: "Target price threshold" },
        ],
      },
    ],
  },
  {
    category: "Affiliate",
    icon: LinkIcon,
    description: "Affiliate links, auto-fill, commissions, and link health",
    basePath: "/api/v1/affiliate",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/affiliate/autofill",
        description: "Auto-fill coupon codes via merchant URL detection",
        auth: "None",
        parameters: [
          { name: "url", type: "string", required: true, description: "Affiliate URL to match coupons for" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/affiliate/offline-clicks",
        description: "Sync offline affiliate clicks from service worker",
        auth: "None",
        parameters: [
          { name: "clicks", type: "array", required: true, description: "Array of offline click records" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/admin/affiliate-links",
        description: "List all affiliate links",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/affiliate-links/health",
        description: "Affiliate link health status",
        auth: "Admin",
        parameters: [
          { name: "limit", type: "number", required: false, description: "Max records (default: 50)" },
          { name: "broken", type: "boolean", required: false, description: "Only broken links" },
          { name: "refresh", type: "boolean", required: false, description: "Bypass cache" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/admin/affiliate-links/health/scan",
        description: "Trigger a full health scan of all affiliate links",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/commission-split",
        description: "Commission splitting rules and configuration",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/commission-split",
        description: "Create commission split rules",
        auth: "Admin",
      },
    ],
  },
  {
    category: "Revenue & Analytics",
    icon: DollarSign,
    description: "Revenue intelligence, forecasting, and analytics",
    basePath: "/api/v1/admin/revenue",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admin/revenue/forecast",
        description: "Revenue forecast for upcoming periods",
        auth: "Admin",
        parameters: [
          { name: "months", type: "number", required: false, description: "Forecast horizon in months (default: 3)" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/admin/commission",
        description: "Commission tracking and earnings data",
        auth: "Admin",
        parameters: [
          { name: "period", type: "string", required: false, description: "Period: day, week, month, year" },
          { name: "network", type: "string", required: false, description: "Filter by affiliate network" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/admin/stats",
        description: "Aggregated platform statistics",
        auth: "Admin",
        responses: [
          { code: 200, description: "Stats: total products, articles, users, revenue" },
        ],
      },
    ],
  },
  {
    category: "Inventory & Predictions",
    icon: TrendingUp,
    description: "AI-powered inventory predictions and stockout warnings",
    basePath: "/api/v1/admin/inventory",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admin/inventory/predictions",
        description: "Inventory predictions and stockout analysis",
        auth: "Admin",
        parameters: [
          { name: "mode", type: "string", required: false, description: "summary, low-stock, single" },
          { name: "productId", type: "string", required: false, description: "Product UUID (for single mode)" },
        ],
        responses: [
          { code: 200, description: "Prediction data based on mode" },
          { code: 400, description: "Invalid mode or missing productId" },
        ],
      },
    ],
  },
  {
    category: "Security & Admin",
    icon: Shield,
    description: "Authentication, security dashboard, 2FA, API keys, RBAC",
    basePath: "/api/v1/admin/security",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admin/security/dashboard",
        description: "Security dashboard overview (events, active sessions, recent activity)",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/security/activity",
        description: "Security audit log with filters",
        auth: "Admin",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "limit", type: "number", required: false, description: "Items per page" },
          { name: "severity", type: "string", required: false, description: "Filter: info, warning, critical" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/admin/security/setup-2fa",
        description: "Setup two-factor authentication",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/security/change-password",
        description: "Change user password",
        auth: "Required",
      },
      {
        method: "GET",
        path: "/api/v1/admin/security/delegated-access",
        description: "List delegated access grants",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/security/delegated-access",
        description: "Grant delegated access to another user",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/users",
        description: "List all users with roles",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/api-keys",
        description: "List API keys",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/api-keys",
        description: "Create new API key",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/activity-logs",
        description: "Activity and audit logs",
        auth: "Admin",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "limit", type: "number", required: false, description: "Items per page" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/admin/moderation-logs",
        description: "Content moderation audit trail",
        auth: "Admin",
      },
    ],
  },
  {
    category: "Comments & Community",
    icon: MessageSquare,
    description: "Article comments, moderation, and votes",
    basePath: "/api/v1/comments",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/comments",
        description: "List comments for an article",
        auth: "None",
        parameters: [
          { name: "articleId", type: "string", required: true, description: "Article UUID" },
          { name: "page", type: "number", required: false, description: "Page number" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/comments",
        description: "Post a comment on an article",
        auth: "Optional",
        parameters: [
          { name: "articleId", type: "string", required: true, description: "Article UUID" },
          { name: "content", type: "text", required: true, description: "Comment body" },
          { name: "parentId", type: "string", required: false, description: "Parent comment UUID (for replies)" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/comments/[id]/vote",
        description: "Upvote or downvote a comment",
        auth: "Optional",
        parameters: [
          { name: "vote", type: "number", required: true, description: "1 for upvote, -1 for downvote" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/admin/comments",
        description: "List all comments (admin)",
        auth: "Admin",
        parameters: [
          { name: "status", type: "string", required: false, description: "Filter: pending, approved, spam" },
          { name: "page", type: "number", required: false, description: "Page number" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/admin/comments/bulk",
        description: "Bulk approve/reject/delete comments",
        auth: "Admin",
      },
    ],
  },
  {
    category: "AI & Automation",
    icon: Bot,
    description: "AI workspace tools, automation rules, and trends",
    basePath: "/api/v1/ai",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/ai",
        description: "List available AI tools and their status",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/ai/analytics",
        description: "AI-powered content analytics",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/feature-flags",
        description: "List all feature flags and A/B tests",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/feature-flags",
        description: "Create or update feature flags",
        auth: "Admin",
      },
    ],
  },
  {
    category: "Webhooks & Integrations",
    icon: WebhookIcon,
    description: "Webhook endpoints for external services",
    basePath: "/api/v1/webhooks",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/webhooks/affiliate/cj",
        description: "Commission Junction affiliate network webhook",
        auth: "API Key",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/affiliate/impact",
        description: "Impact Radius affiliate network webhook",
        auth: "API Key",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/resend",
        description: "Resend email delivery webhook",
        auth: "API Key",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/stripe",
        description: "Stripe payment events webhook",
        auth: "API Key",
      },
      {
        method: "GET",
        path: "/api/v1/admin/webhooks",
        description: "List configured webhooks",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/webhooks",
        description: "Create new webhook configuration",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/redirects",
        description: "List URL redirects",
        auth: "Admin",
      },
    ],
  },
  {
    category: "User Services",
    icon: Users,
    description: "User profiles, bookmarks, favorites, notifications, subscriptions",
    basePath: "/api/v1/user",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/user/profile",
        description: "Get current user profile",
        auth: "Required",
      },
      {
        method: "PUT",
        path: "/api/v1/user/profile",
        description: "Update user profile",
        auth: "Required",
      },
      {
        method: "GET",
        path: "/api/v1/user/bookmarks",
        description: "List user bookmarks",
        auth: "Required",
      },
      {
        method: "POST",
        path: "/api/v1/user/bookmarks",
        description: "Add bookmark",
        auth: "Required",
      },
      {
        method: "GET",
        path: "/api/v1/user/favorites",
        description: "List user favorites",
        auth: "Required",
      },
      {
        method: "GET",
        path: "/api/v1/user/notifications",
        description: "List user notifications",
        auth: "Required",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "unreadOnly", type: "boolean", required: false, description: "Only unread notifications" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/user/notifications/read-all",
        description: "Mark all notifications as read",
        auth: "Required",
      },
      {
        method: "POST",
        path: "/api/v1/user/push-subscribe",
        description: "Subscribe to push notifications",
        auth: "Required",
      },
      {
        method: "POST",
        path: "/api/v1/newsletter/subscribe",
        description: "Subscribe to email newsletter",
        auth: "None",
        parameters: [
          { name: "email", type: "string", required: true, description: "Email address" },
          { name: "name", type: "string", required: false, description: "Subscriber name" },
        ],
      },
    ],
  },
  {
    category: "Email & Campaigns",
    icon: Mail,
    description: "Email campaigns, subscriber management, and templates",
    basePath: "/api/v1/admin/email-campaigns",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/newsletter/subscribe",
        description: "Subscribe to email list",
        auth: "None",
      },
      {
        method: "GET",
        path: "/api/v1/newsletter/verify/[token]",
        description: "Verify email subscription",
        auth: "None",
      },
    ],
  },
  {
    category: "Operations & Health",
    icon: Globe,
    description: "System health, status, queues, and deployment",
    basePath: "/api/ops",
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        description: "Basic health check (public)",
        auth: "None",
        responses: [
          { code: 200, description: "{ status: 'ok', timestamp }" },
        ],
      },
      {
        method: "GET",
        path: "/api/ops/health",
        description: "Detailed health check (DB, Redis, queue connections)",
        auth: "None",
      },
      {
        method: "GET",
        path: "/api/ops/global-status",
        description: "Global system status overview",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/ops/queues",
        description: "BullMQ queue status and metrics",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/deploy",
        description: "Deployment configuration and history",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/deploy",
        description: "Trigger one-click deployment",
        auth: "Admin",
        parameters: [
          { name: "branch", type: "string", required: false, description: "Git branch to deploy (default: main)" },
        ],
      },
    ],
  },
  {
    category: "Media & Uploads",
    icon: Image,
    description: "Image uploads, alt text generation, Cloudinary management",
    basePath: "/api/v1/admin/media",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admin/media/upload",
        description: "Upload media to Cloudinary",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/media/generate-alt",
        description: "AI-generated alt text for images",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/products/export",
        description: "Export products to CSV/JSON",
        auth: "Admin",
      },
    ],
  },
  {
    category: "Import & Data",
    icon: Upload,
    description: "Bulk product import, presets, and validation",
    basePath: "/api/v1/admin/products/import",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admin/products/import",
        description: "Bulk import products from file",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/products/import/validate",
        description: "Validate import file without importing",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/products/import/presets",
        description: "List import column presets",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/products/import/presets",
        description: "Save import column preset",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/import-history",
        description: "Import job history",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/import-presets",
        description: "Custom import presets",
        auth: "Admin",
      },
    ],
  },
  {
    category: "A/B Testing & Content",
    icon: FlaskConical,
    description: "A/B tests, content ROI, editorial workflows",
    basePath: "/api/v1/admin/ab-tests",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admin/ab-tests",
        description: "List A/B tests",
        auth: "Admin",
      },
      {
        method: "POST",
        path: "/api/v1/admin/ab-tests",
        description: "Create A/B test",
        auth: "Admin",
      },
      {
        method: "GET",
        path: "/api/v1/admin/analytics/content",
        description: "Content performance analytics",
        auth: "Admin",
      },
    ],
  },
];

// =============================================
// HELPER COMPONENTS
// =============================================

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  POST: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  PUT: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  PATCH: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
};

const AUTH_BADGES: Record<string, string> = {
  "None": "badge-admin-success",
  "Optional": "badge-admin-warning",
  "Required": "badge-admin-neutral",
  "Admin": "badge-admin-danger",
  "API Key": "badge-admin-neutral",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded-md hover:bg-[var(--admin-bg-active)] transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} className="text-[var(--admin-text-muted)]" />}
    </button>
  );
}

// =============================================
// PAGE COMPONENT
// =============================================

export default function ApiDocsPage() {
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string>("Products");
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("All");

  const filtered = API_GROUPS
    .map((group) => ({
      ...group,
      endpoints: group.endpoints.filter((ep) => {
        const matchesSearch = search === "" ||
          ep.path.toLowerCase().includes(search.toLowerCase()) ||
          ep.description.toLowerCase().includes(search.toLowerCase());
        const matchesMethod = selectedMethod === "All" || ep.method === selectedMethod;
        return matchesSearch && matchesMethod;
      }),
    }))
    .filter((group) => group.endpoints.length > 0);

  const totalEndpoints = API_GROUPS.reduce((sum, g) => sum + g.endpoints.length, 0);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Code size={14} /> API REFERENCE
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">API Documentation</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              Complete reference for all {totalEndpoints} public and admin API endpoints
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            <Server size={14} />
            <span>Base URL: https://alayainsider.com</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="input-admin w-full pl-9 text-sm py-2"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {["All", "GET", "POST", "PUT", "DELETE"].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                selectedMethod === method
                  ? method === "All"
                    ? "bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] border-[var(--admin-accent)]/30"
                    : `${METHOD_COLORS[method]} border`
                  : "text-[var(--admin-text-secondary)] border-transparent hover:bg-[var(--admin-bg-active)]"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* API Groups */}
      <div className="space-y-4">
        {filtered.map((group) => {
          const isExpanded = expandedGroup === group.category;
          const Icon = group.icon;

          return (
            <div key={group.category} className="admin-card border border-[var(--admin-border)] overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => setExpandedGroup(isExpanded ? "" : group.category)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--admin-bg-hover)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--admin-bg-subtle)]">
                    <Icon size={18} className="text-[var(--admin-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{group.category}</h3>
                    <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
                      {group.endpoints.length} {group.endpoints.length === 1 ? "endpoint" : "endpoints"} — {group.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--admin-text-muted)]">{group.basePath}</span>
                  <ArrowRight size={14} className={`text-[var(--admin-text-muted)] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Endpoints */}
              {isExpanded && (
                <div className="border-t border-[var(--admin-border)]">
                  {group.endpoints.map((ep) => {
                    const isEpExpanded = expandedEndpoint === ep.path;
                    return (
                      <div key={ep.path} className="border-b border-[var(--admin-border)] last:border-b-0">
                        <button
                          onClick={() => setExpandedEndpoint(isEpExpanded ? null : ep.path)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-[var(--admin-bg-hover)] transition-colors text-left"
                        >
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${METHOD_COLORS[ep.method]} shrink-0 w-14 text-center`}>
                            {ep.method}
                          </span>
                          <code className="text-xs font-mono text-[var(--admin-text-primary)] flex-1 truncate">
                            {ep.path}
                          </code>
                          <span className="text-[10px] text-[var(--admin-text-muted)] hidden sm:block truncate max-w-[200px]">
                            {ep.description}
                          </span>
                          <span className={`badge-admin text-[9px] ${AUTH_BADGES[ep.auth]}`}>
                            {ep.auth}
                          </span>
                          <ChevronDown size={12} className={`text-[var(--admin-text-muted)] shrink-0 transition-transform ${isEpExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isEpExpanded && (
                          <div className="px-3 pb-4 pt-1 bg-[var(--admin-bg-subtle)]/50">
                            <div className="ml-[4.5rem] space-y-3">
                              {/* Description */}
                              <p className="text-xs text-[var(--admin-text-secondary)]">{ep.description}</p>

                              {/* cURL example */}
                              <div className="bg-[var(--admin-bg-subtle)] rounded-lg p-3 font-mono text-[11px] leading-relaxed">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[9px] text-[var(--admin-text-muted)] tracking-wider">CURL EXAMPLE</span>
                                  <CopyButton text={`curl -X ${ep.method} https://alayainsider.com${ep.path}`} />
                                </div>
                                <code className="text-[var(--admin-text-primary)]">
                                  curl -X {ep.method} https://alayainsider.com{ep.path}
                                </code>
                              </div>

                              {/* Parameters */}
                              {ep.parameters && ep.parameters.length > 0 && (
                                <div>
                                  <div className="text-[9px] text-[var(--admin-text-muted)] tracking-wider mb-1.5">PARAMETERS</div>
                                  <div className="space-y-1">
                                    {ep.parameters.map((param, i) => (
                                      <div key={i} className="flex items-start gap-3 text-xs py-1">
                                        <code className="font-mono text-[var(--admin-text-primary)] w-32 shrink-0">{param.name}</code>
                                        <span className="text-[10px] text-[var(--admin-text-muted)] w-16 shrink-0">{param.type}</span>
                                        <span className={`text-[10px] ${param.required ? "text-red-400" : "text-[var(--admin-text-muted)]"} w-12 shrink-0`}>
                                          {param.required ? "Required" : "Optional"}
                                        </span>
                                        <span className="text-xs text-[var(--admin-text-secondary)]">{param.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Responses */}
                              {ep.responses && ep.responses.length > 0 && (
                                <div>
                                  <div className="text-[9px] text-[var(--admin-text-muted)] tracking-wider mb-1.5">RESPONSES</div>
                                  <div className="space-y-1">
                                    {ep.responses.map((resp, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs">
                                        <span className={`font-mono text-[11px] ${
                                          resp.code < 300 ? "text-emerald-400" : resp.code < 500 ? "text-amber-400" : "text-red-400"
                                        }`}>
                                          {resp.code}
                                        </span>
                                        <span className="text-[var(--admin-text-secondary)]">{resp.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Auth note */}
                              {ep.auth !== "None" && (
                                <div className="flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-400/5 rounded-lg p-2.5">
                                  <Shield size={12} className="shrink-0" />
                                  <span>
                                    {ep.auth === "Admin" ? "Requires admin session (cookie-based auth)" :
                                     ep.auth === "Required" ? "Requires authenticated user session" :
                                     ep.auth === "API Key" ? "Requires valid API key in X-API-Key header" :
                                     "Authentication optional"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-[var(--admin-text-muted)]">
          <Code size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No endpoints found</p>
          <button onClick={() => { setSearch(""); setSelectedMethod("All"); }} className="text-xs text-[var(--admin-accent)] hover:underline mt-2">
            Clear filters
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code size={12} />
          <span>{totalEndpoints} endpoints across {API_GROUPS.length} categories</span>
        </div>
        <div className="flex items-center gap-2">
          <Key size={12} />
          <span>All admin endpoints require authentication</span>
        </div>
      </div>
    </div>
  );
}


