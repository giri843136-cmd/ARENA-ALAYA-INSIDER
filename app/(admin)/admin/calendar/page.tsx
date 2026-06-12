"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen, Package } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOCK_EVENTS: Record<string, { title: string; type: "article" | "product"; status: string }[]> = {
  "2026-06-15": [
    { title: "Summer Entertaining Edit", type: "product", status: "scheduled" },
  ],
  "2026-06-16": [
    { title: "Organic Cotton Bedding Review", type: "article", status: "scheduled" },
  ],
  "2026-06-18": [
    { title: "Spring Linen Collection", type: "product", status: "in_review" },
  ],
  "2026-06-20": [
    { title: "The Art of Slow Living", type: "article", status: "draft" },
  ],
  "2026-06-22": [
    { title: "Marble vs Wood Serving Boards", type: "article", status: "draft" },
  ],
  "2026-06-25": [
    { title: "Bathroom Organization Guide", type: "article", status: "changes_requested" },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "border-l-purple-500",
  in_review: "border-l-blue-500",
  draft: "border-l-gray-500",
  changes_requested: "border-l-amber-500",
  approved: "border-l-green-500",
};

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const calendarDays = [];
  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }
  // Next month overflow
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[2px] text-[#C5A26F] font-medium">EDITORIAL</div>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Content Calendar</h1>
        <p className="text-[#A1A1A1] mt-1">Plan and schedule your editorial content.</p>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-[#1F1F1F] rounded transition-colors">
          <ChevronLeft size={20} className="text-[#A1A1A1]" />
        </button>
        <h2 className="text-xl font-semibold tracking-tight">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-[#1F1F1F] rounded transition-colors">
          <ChevronRight size={20} className="text-[#A1A1A1]" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-[#252525] rounded-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#252525]">
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-xs font-medium text-[#666] text-center uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => {
            const dateStr = cell.isCurrentMonth ? formatDate(cell.day) : "";
            const events = MOCK_EVENTS[dateStr] || [];
            const isToday = cell.isCurrentMonth && cell.day === 12; // June 12

            return (
              <div
                key={idx}
                className={`min-h-[120px] border-b border-r border-[#252525] p-2 transition-colors ${
                  cell.isCurrentMonth
                    ? "bg-transparent hover:bg-[#1A1A1A]"
                    : "bg-[#0A0A0A] opacity-40"
                } ${isToday ? "ring-2 ring-[#C5A26F] ring-inset" : ""}`}
              >
                <span className={`text-xs font-medium ${
                  isToday ? "text-[#C5A26F]" : "text-[#666]"
                }`}>
                  {cell.day}
                </span>
                <div className="mt-1 space-y-1">
                  {events.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`text-[10px] px-1.5 py-0.5 rounded border-l-2 truncate ${
                        event.type === "article"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-green-500/10 text-green-400"
                      } ${STATUS_COLORS[event.status] || "border-l-gray-500"}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-[#666] pl-1">+{events.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-[#666]">
        <span className="flex items-center gap-2">
          <BookOpen size={12} className="text-blue-400" /> Article
        </span>
        <span className="flex items-center gap-2">
          <Package size={12} className="text-green-400" /> Product
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> Scheduled
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> In Review
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Changes
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Approved
        </span>
      </div>
    </div>
  );
}
