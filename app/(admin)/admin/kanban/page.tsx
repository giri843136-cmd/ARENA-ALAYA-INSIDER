"use client";

import React, { useState, useCallback } from "react";
import {
  Plus, MoreHorizontal, DraftingCompass, BookOpen, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanCard {
  id: string;
  title: string;
  type: "article" | "product";
  author: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface Column {
  title: string;
  icon: any;
  color: string;
  items: KanbanCard[];
}

// =============================================
// Sortable Card Component
// =============================================

function SortableKanbanCard({ card }: { card: KanbanCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-amber-500",
    low: "border-l-gray-500",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#1A1A1A] border border-[var(--admin-border)] rounded-lg p-4 border-l-4 ${priorityColors[card.priority]} cursor-grab active:cursor-grabbing hover:border-[#333] transition-colors ${isDragging ? "shadow-xl shadow-black/30 z-50" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          card.type === "article" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
        }`}>
          {card.type}
        </span>
        <button className="opacity-0 hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={14} className="text-[var(--admin-text-muted)]" />
        </button>
      </div>
      <h3 className="text-sm font-medium text-[#EDEDED] mb-3 line-clamp-2">
        {card.title}
      </h3>
      <div className="flex items-center justify-between text-xs text-[var(--admin-text-muted)]">
        <span>{card.author}</span>
        <span>Due {card.dueDate}</span>
      </div>
    </div>
  );
}

// =============================================
// Kanban Column Component
// =============================================

function KanbanColumn({
  column,
}: {
  column: Column;
}) {
  const Icon = column.icon;

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon size={14} className={column.color} />
          <span className="text-sm font-medium text-[#EDEDED]">{column.title}</span>
          <span className="text-xs text-[var(--admin-text-muted)] bg-[var(--admin-bg-active)] px-1.5 py-0.5 rounded-full">
            {column.items.length}
          </span>
        </div>
        <button className="p-1 hover:bg-[var(--admin-bg-active)] rounded transition-colors">
          <Plus size={14} className="text-[var(--admin-text-muted)]" />
        </button>
      </div>

      {/* Drop Zone */}
      <SortableContext items={column.items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {column.items.map((card) => (
            <SortableKanbanCard key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {/* Add Card Placeholder */}
      <button className="w-full mt-3 py-3 border-2 border-dashed border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text-muted)] hover:border-[#333] hover:text-[#888] transition-colors">
        + Add card
      </button>
    </div>
  );
}

// =============================================
// Main Kanban Board Component
// =============================================

const INITIAL_COLUMNS: Record<string, Column> = {
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

// Map card IDs to their column for drag-and-drop lookup
function buildIdToColumnMap(columns: Record<string, Column>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [colId, col] of Object.entries(columns)) {
    for (const card of col.items) {
      map[card.id] = colId;
    }
  }
  return map;
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Record<string, Column>>(INITIAL_COLUMNS);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const findColumn = useCallback(
    (id: string): string | null => {
      const map = buildIdToColumnMap(columns);
      return map[id] || null;
    },
    [columns]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    // Find the card data from columns
    for (const col of Object.values(columns)) {
      const found = col.items.find((c) => c.id === active.id);
      if (found) {
        setActiveCard(found);
        break;
      }
    }
  }, [columns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColId = findColumn(active.id as string);
    const overColId = findColumn(over.id as string);

    if (!activeColId || !overColId || activeColId === overColId) return;

    // Move card between columns
    setColumns((prev) => {
      const sourceCol = { ...prev[activeColId] };
      const destCol = { ...prev[overColId] };

      const activeIndex = sourceCol.items.findIndex((c) => c.id === active.id);
      if (activeIndex === -1) return prev;

      const [movedCard] = sourceCol.items.splice(activeIndex, 1);

      const overIndex = destCol.items.findIndex((c) => c.id === over.id);
      if (overIndex === -1) {
        destCol.items.push(movedCard);
      } else {
        destCol.items.splice(overIndex, 0, movedCard);
      }

      return {
        ...prev,
        [activeColId]: sourceCol,
        [overColId]: destCol,
      };
    });
  }, [findColumn]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeColId = findColumn(active.id as string);
    const overColId = findColumn(over.id as string);

    if (!activeColId || !overColId) return;

    if (activeColId === overColId) {
      // Reorder within same column
      setColumns((prev) => {
        const col = { ...prev[activeColId] };
        const items = [...col.items];

        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const [moved] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, moved);

        return { ...prev, [activeColId]: { ...col, items } };
      });
    }
  }, [findColumn]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[2px] text-[var(--admin-accent)] font-medium">EDITORIAL</div>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Kanban Board</h1>
        <p className="text-[var(--admin-text-secondary)] mt-1">Drag and drop cards to manage your editorial workflow.</p>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
          {Object.entries(columns).map(([key, column]) => (
            <KanbanColumn key={key} column={column} />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="bg-[#1A1A1A] border border-[#C5AA8A]/50 rounded-lg p-4 border-l-4 border-l-[#C5AA8A] shadow-2xl shadow-black/40 rotate-2 w-72">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C5AA8A]/20 text-[var(--admin-accent)]">
                  {activeCard.type}
                </span>
              </div>
              <h3 className="text-sm font-medium text-[#EDEDED] mb-3">{activeCard.title}</h3>
              <div className="flex items-center justify-between text-xs text-[var(--admin-text-muted)]">
                <span>{activeCard.author}</span>
                <span>Due {activeCard.dueDate}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

