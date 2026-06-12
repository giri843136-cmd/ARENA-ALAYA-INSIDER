"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, DraftingCompass, BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface KanbanCard {
  id: string;
  title: string;
  type: "article" | "product";
  author: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

const INITIAL_COLUMNS: Record<string, { title: string; icon: any; color: string; items: KanbanCard[] }> = {
  draft: {
    title: "Draft",
    icon: DraftingCompass,
    color: "text-gray-400",
    items: [
      { id: "1", title: "The Art of Slow Living", type: "article", author: "Elena Voss", dueDate: "Jun 20", priority: "medium" },
      { id: "2", title: "Marble vs Wood Serving Boards", type: "article", author: "Priya Sharma", dueDate: "Jun 22", priority: "high" },
    ],
  },
  in_review: {
    title: "In Review",
    icon: BookOpen,
    color: "text-blue-400",
    items: [
      { id: "3", title: "Spring Linen Collection", type: "product", author: "Elena Voss", dueDate: "Jun 18", priority: "high" },
      { id: "4", title: "Sustainable Kitchen Essentials", type: "article", author: "Maya Chen", dueDate: "Jun 19", priority: "medium" },
    ],
  },
  changes_requested: {
    title: "Changes Requested",
    icon: AlertCircle,
    color: "text-amber-400",
    items: [
      { id: "5", title: "Bathroom Organization Guide", type: "article", author: "Priya Sharma", dueDate: "Jun 21", priority: "low" },
    ],
  },
  approved: {
    title: "Approved",
    icon: CheckCircle2,
    color: "text-green-400",
    items: [
      { id: "6", title: "Summer Entertaining Edit", type: "product", author: "Elena Voss", dueDate: "Jun 16", priority: "medium" },
    ],
  },
  scheduled: {
    title: "Scheduled",
    icon: Clock,
    color: "text-purple-400",
    items: [
      { id: "7", title: "Organic Cotton Bedding Review", type: "article", author: "Maya Chen", dueDate: "Jun 25", priority: "high" },
    ],
  },
};

export default function KanbanBoard() {
  const [columns] = useState(INITIAL_COLUMNS);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[2px] text-[#C5A26F] font-medium">EDITORIAL</div>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Kanban Board</h1>
        <p className="text-[#A1A1A1] mt-1">Drag and drop to manage your editorial workflow.</p>
      </div>

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
        {Object.entries(columns).map(([key, column]) => {
          const Icon = column.icon;
          return (
            <div key={key} className="flex-shrink-0 w-72">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={column.color} />
                  <span className="text-sm font-medium text-[#EDEDED]">{column.title}</span>
                  <span className="text-xs text-[#666] bg-[#1F1F1F] px-1.5 py-0.5 rounded-full">
                    {column.items.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-[#1F1F1F] rounded transition-colors">
                  <Plus size={14} className="text-[#666]" />
                </button>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 min-h-[200px]">
                {column.items.map((card) => {
                  const priorityColors = {
                    high: "border-l-red-500",
                    medium: "border-l-amber-500",
                    low: "border-l-gray-500",
                  };
                  return (
                    <div
                      key={card.id}
                      className={`bg-[#1A1A1A] border border-[#252525] rounded-lg p-4 border-l-4 ${priorityColors[card.priority]} cursor-grab active:cursor-grabbing hover:border-[#333] transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          card.type === "article" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                        }`}>
                          {card.type}
                        </span>
                        <button className="opacity-0 hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={14} className="text-[#666]" />
                        </button>
                      </div>
                      <h3 className="text-sm font-medium text-[#EDEDED] mb-3 line-clamp-2">
                        {card.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[#666]">
                        <span>{card.author}</span>
                        <span>Due {card.dueDate}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Add Card Placeholder */}
                <button className="w-full py-3 border-2 border-dashed border-[#252525] rounded-lg text-xs text-[#666] hover:border-[#333] hover:text-[#888] transition-colors">
                  + Add card
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
