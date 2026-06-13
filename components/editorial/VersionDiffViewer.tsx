"use client";

import React, { useState } from "react";
import { History, ChevronDown, ChevronUp, RotateCcw, AlertTriangle, Clock, Check } from "lucide-react";

interface Version {
  id: string;
  articleId: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  diff: any;
  createdAt: string;
}

interface VersionDiffViewerProps {
  articleId: string;
  versions: Version[];
  currentTitle: string;
  currentContent: string;
  onRollback: (versionId: string) => Promise<void>;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Simple line-diff comparison — splits by newline and highlights differences.
 */
function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="text-xs font-mono leading-relaxed overflow-x-auto">
      <div className="grid grid-cols-2 gap-0">
        <div className="text-[10px] text-[#F87171] px-2 py-1 bg-[#F87171]/5 font-sans sticky top-0">Original</div>
        <div className="text-[10px] text-[#4ADE80] px-2 py-1 bg-[#4ADE80]/5 font-sans sticky top-0">Edited</div>
        {Array.from({ length: maxLines }, (_, i) => {
          const oldLine = oldLines[i] || "";
          const newLine = newLines[i] || "";
          const changed = oldLine !== newLine;
          return (
            <React.Fragment key={i}>
              <div className={`px-2 py-0.5 border-b border-[#252525]/50 ${changed ? "bg-[#F87171]/10 text-[#F87171]" : "text-[#A1A1A1]"}`}>
                {oldLine || "\u00a0"}
              </div>
              <div className={`px-2 py-0.5 border-b border-[#252525]/50 ${changed ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "text-[#A1A1A1]"}`}>
                {newLine || "\u00a0"}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function VersionDiffViewer({
  articleId,
  versions,
  currentTitle,
  currentContent,
  onRollback,
}: VersionDiffViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [rollbackConfirm, setRollbackConfirm] = useState<string | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);

  if (!versions || versions.length === 0) return null;

  const selected = selectedVersion
    ? versions.find((v) => v.id === selectedVersion)
    : versions[0];

  const handleRollback = async (versionId: string) => {
    setRollbackLoading(true);
    setRollbackError(null);
    try {
      await onRollback(versionId);
      setRollbackConfirm(null);
      setSelectedVersion(null);
    } catch (err: any) {
      setRollbackError(err.message || "Rollback failed");
    } finally {
      setRollbackLoading(false);
    }
  };

  return (
    <div className="admin-card overflow-hidden border border-[#252525]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1A1A1A] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#C5AA8A]/10">
            <History size={16} className="text-[#C5AA8A]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#EDEDED]">Version History</div>
            <div className="text-xs text-[#666]">{versions.length} version{versions.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-[#666]" /> : <ChevronDown size={18} className="text-[#666]" />}
      </button>

      {expanded && (
        <div className="border-t border-[#252525]">
          <div className="flex" style={{ minHeight: "400px" }}>
            {/* Version List */}
            <div className="w-64 flex-shrink-0 border-r border-[#252525] overflow-y-auto max-h-[600px]">
              <div className="p-2 space-y-1">
                {/* Current version */}
                <div className="p-3 rounded-lg bg-[#C5AA8A]/10 border border-[#C5AA8A]/20">
                  <div className="text-xs font-medium text-[#C5AA8A]">Current</div>
                  <div className="text-[10px] text-[#666] mt-0.5">{formatRelative(new Date().toISOString())}</div>
                  <div className="text-[10px] text-[#666] mt-0.5 truncate">{currentTitle}</div>
                </div>

                <div className="border-t border-[#252525] my-2" />

                {versions.map((version, idx) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedVersion === version.id
                        ? "bg-[#1F1F1F] border border-[#333]"
                        : "hover:bg-[#1A1A1A] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#EDEDED]">
                        v{versions.length - idx}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full badge-admin ${
                        version.status === "PUBLISHED" || version.status === "APPROVED"
                          ? "badge-admin-success"
                          : version.status === "DRAFT"
                          ? "badge-admin-neutral"
                          : "badge-admin-warning"
                      }`}>
                        {version.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#666] mt-1">{formatDate(version.createdAt)}</div>
                    <div className="text-[10px] text-[#666] mt-0.5 truncate">{version.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Diff View */}
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {selected ? (
                <div className="p-5 space-y-5">
                  {/* Version Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#EDEDED]">{selected.title}</div>
                      <div className="text-xs text-[#666] mt-0.5">
                        {formatDate(selected.createdAt)} ({formatRelative(selected.createdAt)})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rollbackConfirm === selected.id ? (
                        <div className="flex items-center gap-2 bg-[#FBBF24]/10 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-[#FBBF24]">Rollback to this version?</span>
                          <button
                            onClick={() => handleRollback(selected.id)}
                            disabled={rollbackLoading}
                            className="text-xs font-medium text-[#FBBF24] hover:text-white transition-colors disabled:opacity-50"
                          >
                            {rollbackLoading ? "Rolling..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setRollbackConfirm(null)}
                            className="text-xs text-[#666] hover:text-[#EDEDED] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRollbackConfirm(selected.id)}
                          className="btn-admin text-xs text-[#FBBF24] border-[#FBBF24]/20 hover:bg-[#FBBF24]/10"
                        >
                          <RotateCcw size={14} />
                          Rollback
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Diff Sections */}
                  <div>
                    <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium mb-3">TITLE</div>
                    <DiffView oldText={currentTitle} newText={selected.title} />
                  </div>

                  <div>
                    <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium mb-3">CONTENT</div>
                    <DiffView oldText={currentContent} newText={selected.content} />
                  </div>

                  {selected.excerpt && (
                    <div>
                      <div className="text-[10px] tracking-[1.5px] text-[#C5AA8A] font-medium mb-3">EXCERPT</div>
                      <DiffView oldText={""} newText={selected.excerpt} />
                    </div>
                  )}

                  {/* Rollback Error */}
                  {rollbackError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F87171]/10 text-[#F87171] text-xs">
                      <AlertTriangle size={12} />
                      {rollbackError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-[#666] text-sm">
                  Select a version to view differences
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
