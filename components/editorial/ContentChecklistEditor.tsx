"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Save, Plus, Trash2, AlertTriangle, Check, RefreshCw } from "lucide-react";

export type ChecklistType = "SEO" | "AFFILIATE" | "EDITORIAL";

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

interface ContentChecklistEditorProps {
  contentType: string;
  contentId: string;
  checklistType: ChecklistType;
  initialItems?: ChecklistItem[];
  onSave?: () => void;
}

const CHECKLIST_PRESETS: Record<ChecklistType, string[]> = {
  SEO: [
    "Meta title is under 60 characters",
    "Meta description is between 120-158 characters",
    "Primary keyword appears in H1",
    "URL slug is short and descriptive",
    "Image alt text includes relevant keywords",
    "Internal links point to related content (min 3)",
    "External links have rel=nofollow where needed",
    "Open Graph tags are set correctly",
    "Schema markup is valid (Article/Product)",
    "Canonical URL is set",
    "Content is at least 800 words",
    "Reading time is correctly calculated",
  ],
  AFFILIATE: [
    "All affiliate links are properly tagged with ?ref=alaya",
    "Affiliate disclosure is visible before any links",
    "Commission rates are verified for all networks",
    "Links point to correct products (no broken URLs)",
    "Deep links use the most current format",
    "No affiliate links in the hero or opening paragraph",
    "Price comparison tables include affiliate badges",
    "Out-of-stock products have fallback recommendations",
    "Cookie duration is optimal for each network",
    "Affiliate links pass link health check",
  ],
  EDITORIAL: [
    "Hook is compelling in the first paragraph",
    "Brand voice is consistent throughout",
    "All claims are fact-checked and sourced",
    "Quotes are attributed correctly",
    "Tone matches the universe guidelines",
    "Article flows logically with clear section breaks",
    "No jargon without explanation",
    "CTA is natural and value-driven",
    "Author bio is up to date",
    "Editor has reviewed for clarity and impact",
  ],
};

export function ContentChecklistEditor({
  contentType,
  contentId,
  checklistType,
  initialItems,
  onSave,
}: ContentChecklistEditorProps) {
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>(
    initialItems || CHECKLIST_PRESETS[checklistType].map((item, idx) => ({
      id: `item-${idx}`,
      item,
      completed: false,
    }))
  );
  const [loaded, setLoaded] = useState(false);
  const [customItem, setCustomItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing checklist data on mount
  useEffect(() => {
    if (loaded) return;
    const fetchExisting = async () => {
      try {
        const res = await fetch(`/api/v1/workflow?contentType=${contentType}&contentId=${contentId}`);
        const json = await res.json();
        if (json.success && json.data?.checklists?.length > 0) {
          const existing = json.data.checklists.find((c: any) => c.checklistType === checklistType);
          if (existing) {
            setChecklistId(existing.id);
            setItems(existing.items.map((item: any, idx: number) => ({
              id: `item-${idx}`,
              item: item.item,
              completed: item.completed,
              completedBy: item.completedBy,
              completedAt: item.completedAt,
            })));
          }
        }
      } catch {
        // Silently fail — use presets as fallback
      } finally {
        setLoaded(true);
      }
    };
    fetchExisting();
  }, [contentType, contentId, checklistType, loaded]);

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined,
              completedBy: !item.completed ? "current_user" : undefined,
            }
          : item
      )
    );
    setSaved(false);
  };

  const addCustomItem = () => {
    if (!customItem.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        item: customItem.trim(),
        completed: false,
      },
    ]);
    setCustomItem("");
    setSaved(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSaved(false);
  };

  const saveChecklist = async () => {
    setSaving(true);
    setError(null);
    try {
      const itemsData = items.map((i) => ({ item: i.item, completed: i.completed, completedBy: i.completedBy, completedAt: i.completedAt }));

      if (!checklistId) {
        // Create new checklist first
        const createRes = await fetch("/api/v1/workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_checklist",
            contentType,
            contentId,
            checklistType,
            items: itemsData,
          }),
        });
        const createJson = await createRes.json();
        if (createJson.success) {
          setChecklistId(createJson.data.id);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          onSave?.();
        } else {
          setError(createJson.error?.message || "Failed to save checklist");
        }
      } else {
        // Update existing checklist
        const updateRes = await fetch("/api/v1/workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_checklist_items",
            checklistId,
            items: itemsData,
          }),
        });
        const updateJson = await updateRes.json();
        if (updateJson.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          onSave?.();
        } else {
          setError(updateJson.error?.message || "Failed to save checklist");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const resetChecklist = () => {
    setItems(
      CHECKLIST_PRESETS[checklistType].map((item, idx) => ({
        id: `item-${idx}`,
        item,
        completed: false,
      }))
    );
    setSaved(false);
  };

  return (
    <div className="admin-card overflow-hidden border border-[#252525]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#252525]">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-[#C5AA8A]" />
            <span className="text-sm font-medium text-[#EDEDED]">
              {checklistType.charAt(0) + checklistType.slice(1).toLowerCase()} Checklist
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-[#1F1F1F] h-1.5 rounded-full overflow-hidden w-32">
              <div
                className="h-full bg-[#4ADE80] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-[#666] tabular-nums">
              {completedCount}/{items.length} ({progress}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetChecklist} className="btn-admin btn-admin-ghost text-xs">
            <RefreshCw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="p-2 space-y-0.5 max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
              item.completed ? "bg-[#4ADE80]/5" : "hover:bg-[#1A1A1A]"
            }`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className={`flex-shrink-0 transition-colors ${
                item.completed ? "text-[#4ADE80]" : "text-[#666] hover:text-[#C5AA8A]"
              }`}
            >
              {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
            <span
              className={`flex-1 text-sm leading-relaxed ${
                item.completed ? "text-[#666] line-through" : "text-[#EDEDED]"
              }`}
            >
              {item.item}
            </span>
            {item.completedAt && (
              <span className="text-[10px] text-[#666] hidden sm:inline">
                {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#F87171]/10 text-[#666] hover:text-[#F87171] transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Custom Item */}
      <div className="border-t border-[#252525] p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
            placeholder="Add custom checklist item..."
            className="flex-1 bg-[#0A0A0A] border border-[#252525] rounded-lg px-3 py-2 text-xs text-[#EDEDED] placeholder:text-[#666] focus:outline-none focus:border-[#C5AA8A]/50"
          />
          <button
            onClick={addCustomItem}
            disabled={!customItem.trim()}
            className="p-2 rounded-lg bg-[#C5AA8A]/10 text-[#C5AA8A] hover:bg-[#C5AA8A]/20 disabled:opacity-30 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#252525] px-5 py-3">
        <div>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-[#4ADE80]">
              <Check size={12} /> Saved
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1.5 text-xs text-[#F87171]">
              <AlertTriangle size={12} /> {error}
            </span>
          )}
        </div>
        <button
          onClick={saveChecklist}
          disabled={saving}
          className="btn-admin text-xs disabled:opacity-50"
        >
          {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? "Saving..." : "Save Checklist"}
        </button>
      </div>
    </div>
  );
}
