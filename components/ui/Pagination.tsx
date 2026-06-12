"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  className?: string;
}

/**
 * Accessible pagination with page numbers, first/last, and sibling ellipsis.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const getPageNumbers = (): (number | "...")[] => {
    const totalVisible = siblings * 2 + 5; // first, siblings, current, siblings, last
    if (totalPages <= totalVisible) return range(1, totalPages);

    const leftBound = Math.max(2, currentPage - siblings);
    const rightBound = Math.min(totalPages - 1, currentPage + siblings);

    const pages: (number | "...")[] = [1];
    if (leftBound > 2) pages.push("...");
    pages.push(...range(leftBound, rightBound));
    if (rightBound < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1 ${className}`}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#8A8178] text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-[#C5AA8A] text-white"
                : "hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] text-[#26221E] dark:text-[#EDE6DC]"
            }`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
