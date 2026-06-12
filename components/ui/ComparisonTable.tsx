"use client";

import { Check, X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ComparisonRow {
  label: string;
  values: (string | boolean | number)[];
}

interface ComparisonTableProps {
  products: { name: string; image?: string; price?: number; rating?: number }[];
  rows: ComparisonRow[];
  className?: string;
}

/**
 * Product comparison table with sticky header, editable rows, and highlight differences.
 * Renders checkmarks for boolean values and highlights non-matching cells.
 */
export function ComparisonTable({
  products,
  rows,
  className = "",
}: ComparisonTableProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // Group rows by section (before first colon)
  const sections = rows.reduce((acc, row) => {
    const section = row.label.includes(":") ? row.label.split(":")[0].trim() : "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(row);
    return acc;
  }, {} as Record<string, ComparisonRow[]>);

  return (
    <div className={`overflow-x-auto rounded-xl border border-[#E4DDD5] dark:border-[#3D3530] ${className}`}>
      <table className="w-full text-sm">
        {/* Header */}
        <thead className="bg-[#F5F0EA] dark:bg-[#1F1A17] sticky top-0 z-10">
          <tr>
            <th className="p-4 text-left text-xs tracking-[2px] text-[#8A8178] font-medium w-48">
              Features
            </th>
            {products.map((p, i) => (
              <th key={i} className="p-4 text-center min-w-[160px]">
                <div className="font-medium text-[#26221E] dark:text-[#EDE6DC]">{p.name}</div>
                {p.price && (
                  <div className="text-xs text-[#8A8178] mt-0.5">
                    ${p.price.toLocaleString()}
                  </div>
                )}
                {p.rating && (
                  <div className="text-xs text-[#C5AA8A] mt-0.5">
                    ★ {p.rating.toFixed(1)}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {Object.entries(sections).map(([sectionName, sectionRows]) => (
            <>
              {/* Section header */}
              <tr key={sectionName} className="border-t border-[#E4DDD5] dark:border-[#3D3530]">
                <td colSpan={products.length + 1} className="p-0">
                  <button
                    onClick={() => toggleSection(sectionName)}
                    className="w-full px-4 py-2 flex items-center gap-2 text-xs tracking-[2px] text-[#C5AA8A] bg-[#FAF7F4] dark:bg-[#26221E] hover:bg-[#F5F0EA] dark:hover:bg-[#333] transition-colors"
                  >
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${collapsedSections.has(sectionName) ? "-rotate-90" : ""}`}
                    />
                    {sectionName.toUpperCase()}
                  </button>
                </td>
              </tr>

              {/* Section rows */}
              {!collapsedSections.has(sectionName) &&
                sectionRows.map((row, ri) => {
                  // Find which values differ from the majority
                  const stringValues = row.values.map((v) => String(v));
                  const mode = stringValues.sort((a, b) =>
                    stringValues.filter((v) => v === a).length -
                    stringValues.filter((v) => v === b).length
                  ).pop();

                  return (
                    <tr
                      key={ri}
                      className="border-t border-[#E4DDD5]/50 dark:border-[#3D3530]/50 hover:bg-[#FAF7F4] dark:hover:bg-[#26221E]/50 transition-colors"
                    >
                      <td className="p-4 text-[#6D655F] dark:text-[#B8AFA3] text-xs">
                        {row.label.includes(":") ? row.label.split(":").slice(1).join(":").trim() : row.label}
                      </td>
                      {row.values.map((val, vi) => (
                        <td
                          key={vi}
                          className={`p-4 text-center ${
                            String(val) !== mode && mode !== undefined
                              ? "bg-[#FEF3C7]/30 dark:bg-[#FEF3C7]/10"
                              : ""
                          }`}
                        >
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check size={16} className="text-green-500 mx-auto" />
                            ) : (
                              <X size={16} className="text-red-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-[#26221E] dark:text-[#EDE6DC]">{String(val)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
