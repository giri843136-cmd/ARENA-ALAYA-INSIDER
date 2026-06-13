"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, BookOpen, Package, Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DateSelectArg } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: "article" | "product";
  status: string;
  extendedProps: {
    contentType: string;
    status: string;
    author?: string;
    slug?: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#8B5CF6",
  published: "#22C55E",
  in_review: "#3B82F6",
  draft: "#6B7280",
  changes_requested: "#F59E0B",
  approved: "#22C55E",
  archived: "#9CA3AF",
};

const TYPE_ICONS: Record<string, string> = {
  article: "\u{1F4D6}",
  product: "\u{1F4E6}",
};

const DEMO_USER_ID = "user_demo_admin";

export default function ContentCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");

  const fetchScheduledContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch scheduled articles
      const [articlesRes, productsRes] = await Promise.all([
        fetch("/api/v1/articles?status=SCHEDULED&limit=100"),
        fetch("/api/v1/products?status=SCHEDULED&limit=100"),
      ]);

      const [articlesJson, productsJson] = await Promise.all([
        articlesRes.json(),
        productsRes.json(),
      ]);

      const mappedEvents: CalendarEvent[] = [];

      if (articlesJson.success) {
        const articles = Array.isArray(articlesJson.data) ? articlesJson.data
          : articlesJson.data?.articles || articlesJson.data?.items || [];
        articles.forEach((article: any) => {
          if (article.publishedAt || article.scheduledAt) {
            mappedEvents.push({
              id: `article-${article.id}`,
              title: article.title,
              start: article.publishedAt || article.scheduledAt,
              type: "article",
              status: article.status?.toLowerCase() || "draft",
              extendedProps: {
                contentType: "article",
                status: article.status?.toLowerCase() || "draft",
                author: article.author?.name || "Unknown",
                slug: article.slug,
              },
            });
          }
        });
      }

      if (productsJson.success) {
        const products = Array.isArray(productsJson.data) ? productsJson.data
          : productsJson.data?.products || productsJson.data?.items || [];
        products.forEach((product: any) => {
          if (product.publishedAt || product.scheduledAt) {
            mappedEvents.push({
              id: `product-${product.id}`,
              title: product.name,
              start: product.publishedAt || product.scheduledAt,
              type: "product",
              status: product.status?.toLowerCase() || "draft",
              extendedProps: {
                contentType: "product",
                status: product.status?.toLowerCase() || "draft",
                slug: product.slug,
              },
            });
          }
        });
      }

      // Fall back to mock data if API returns empty
      if (mappedEvents.length === 0) {
        setEvents(getMockEvents());
      } else {
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error("Failed to load calendar events:", err);
      // Fall back to mock data on error
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduledContent();
  }, [fetchScheduledContent]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const { extendedProps } = info.event;
    if (extendedProps.slug) {
      const path = extendedProps.contentType === "article"
        ? `/admin/journal/${extendedProps.slug}`
        : `/admin/products/${extendedProps.slug}`;
      window.open(path, "_blank");
    }
  }, []);

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    const title = window.prompt("New event title:");
    if (!title) return;
    const type = window.confirm("Is this an article? Click OK for article, Cancel for product.")
      ? "article" : "product";
    const newEvent: CalendarEvent = {
      id: `temp-${Date.now()}`,
      title,
      start: info.startStr,
      type: type as "article" | "product",
      status: "draft",
      extendedProps: { contentType: type, status: "draft" },
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const handleEventDrop = useCallback(async (info: any) => {
    const { event, oldEvent, revert } = info;
    const newDate = event.start?.toISOString().split("T")[0];
    const oldDate = oldEvent.start?.toISOString().split("T")[0];
    if (newDate === oldDate) return;

    const [type, id] = event.id.split("-");
    try {
      const endpoint = type === "article" ? `/api/v1/admin/articles/${id}` : `/api/v1/admin/products/${id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(newDate!).toISOString() }),
      });
      if (!res.ok) {
        revert();
      }
    } catch {
      revert();
    }
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[2px] text-[var(--admin-accent)] font-medium">
            <CalIcon size={14} /> EDITORIAL
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mt-1">Content Calendar</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">Plan, schedule, and reschedule editorial content. Drag events to move them.</p>
        </div>
        <button onClick={fetchScheduledContent} disabled={loading}
          className="btn-admin text-xs disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-[#F87171]/10 text-[#F87171] text-sm border border-[#F87171]/20">
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)] p-4">
        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={18} className="animate-spin text-[var(--admin-accent)]" />
            <span className="text-sm text-[var(--admin-text-secondary)] ml-2">Loading calendar...</span>
          </div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek",
              }}
              events={events}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={true}
              eventClick={handleEventClick}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              eventContent={(arg) => ({
                html: `
                  <div class="fc-event-content" style="display:flex;align-items:center;gap:4px;padding:2px 4px;">
                    <span>${arg.event.extendedProps.contentType === "article" ? "\u{1F4D6}" : "\u{1F4E6}"}</span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;">${arg.event.title}</span>
                  </div>
                `,
              })}
              eventDidMount={(info) => {
                const status = info.event.extendedProps.status || "draft";
                info.el.style.borderColor = STATUS_COLORS[status] || STATUS_COLORS.draft;
                info.el.style.borderLeftWidth = "3px";
                info.el.style.backgroundColor = `${STATUS_COLORS[status] || STATUS_COLORS.draft}15`;
                info.el.style.cursor = "pointer";
              }}
              height="auto"
              contentHeight="auto"
              themeSystem="standard"
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-[var(--admin-text-muted)] flex-wrap">
        <span className="flex items-center gap-2">
          <BookOpen size={12} className="text-blue-400" /> Article
        </span>
        <span className="flex items-center gap-2">
          <Package size={12} className="text-green-400" /> Product
        </span>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

// Mock data fallback
function getMockEvents(): CalendarEvent[] {
  return [
    {
      id: "article-1", title: "The Quiet Luxury of Linen", start: "2026-06-15",
      type: "article", status: "scheduled",
      extendedProps: { contentType: "article", status: "scheduled", author: "Elena Voss" },
    },
    {
      id: "article-2", title: "Organic Cotton Bedding Review", start: "2026-06-18",
      type: "article", status: "scheduled",
      extendedProps: { contentType: "article", status: "scheduled", author: "Maya Chen" },
    },
    {
      id: "product-1", title: "Summer Entertaining Edit", start: "2026-06-12",
      type: "product", status: "scheduled",
      extendedProps: { contentType: "product", status: "scheduled" },
    },
    {
      id: "article-3", title: "The Art of Slow Living", start: "2026-06-22",
      type: "article", status: "draft",
      extendedProps: { contentType: "article", status: "draft", author: "Elena Voss" },
    },
    {
      id: "article-4", title: "Bathroom Organization Guide", start: "2026-06-25",
      type: "article", status: "changes_requested",
      extendedProps: { contentType: "article", status: "changes_requested", author: "Priya Sharma" },
    },
    {
      id: "product-2", title: "Spring Linen Collection", start: "2026-06-20",
      type: "product", status: "in_review",
      extendedProps: { contentType: "product", status: "in_review" },
    },
  ] as CalendarEvent[];
}

// Use any for the FullCalendar eventDrop arg to avoid type conflicts

