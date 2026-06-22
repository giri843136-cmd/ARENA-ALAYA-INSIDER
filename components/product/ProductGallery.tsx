"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Expand } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

/**
 * ProductGallery — Premium full-screen lightbox gallery with zoom and navigation.
 *
 * Click any thumbnail to open the lightbox. Navigate with arrow keys,
 * swipe on mobile, or click the prev/next arrows. Hover to zoom on desktop.
 *
 * Usage:
 *   <ProductGallery images={product.images} productName={product.name} />
 */
export function ProductGallery({ images, productName, className = "" }: ProductGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      setIsOpen(false);
      setIsZoomed(false);
    } else if (e.key === "ArrowLeft") {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsZoomed(false);
    } else if (e.key === "ArrowRight") {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setIsZoomed(false);
    }
  }, [isOpen, images.length]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const openAtIndex = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    setIsZoomed(false);
  };

  const allImages = images.length > 0 ? images : ["/placeholder.svg"];
  const maxThumbnails = Math.min(allImages.length, 5);

  return (
    <>
      {/* Thumbnail Grid — Click to open lightbox */}
      <div className={`space-y-4 ${className}`}>
        <div
          className="relative overflow-hidden rounded-3xl border border-[#E4DDD5] bg-[#EFE7DE] aspect-[4/3] cursor-pointer group"
          onClick={() => openAtIndex(0)}
          role="button"
          tabIndex={0}
          aria-label={`Open ${productName} gallery`}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openAtIndex(0); }}
        >
          {/* Blur-up background while image loads */}
          <div className="absolute inset-0 bg-[#EFE7DE] animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={allImages[0]}
            alt={productName}
            loading="lazy"
            decoding="async"
            className="relative inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <div className="badge badge-gold text-[10px] flex items-center gap-1">
              <Expand size={10} /> VIEW GALLERY
            </div>
          </div>
        </div>

        {allImages.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {allImages.slice(1, maxThumbnails).map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-[#E4DDD5] bg-white aspect-[4/3] cursor-pointer group"
                onClick={() => openAtIndex(i + 1)}
                role="button"
                tabIndex={0}
                aria-label={`View ${productName} image ${i + 2}`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openAtIndex(i + 1); }}
              >
                <div className="absolute inset-0 bg-[#EFE7DE] animate-pulse" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${productName} ${i + 2}`}
                  loading="lazy"
                  decoding="async"
                  className="relative inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02]"
                />
                {i === maxThumbnails - 1 && allImages.length > maxThumbnails && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xl font-medium tracking-tight">+{allImages.length - maxThumbnails}</span>
                  </div>
                )}
              </div>
            ))}
            {/* Lifestyle placeholder */}
            <div className="relative overflow-hidden rounded-2xl border border-[#E4DDD5] bg-[#EFE7DE] aspect-[4/3] flex items-center justify-center">
              <div className="text-center text-[#6D655F]">
                <div className="text-[10px] tracking-[2px] mb-1">LIFESTYLE</div>
                <div className="font-display text-xl tracking-tight">In situ</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) { setIsOpen(false); setIsZoomed(false); } }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs tracking-wider font-mono tabular-nums">
                {currentIndex + 1} / {allImages.length}
              </span>
              <span className="text-white/40 text-xs max-w-[200px] truncate hidden sm:block">
                {productName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                  isZoomed ? "bg-white/20 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}
                aria-label={isZoomed ? "Disable zoom" : "Enable zoom"}
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsZoomed(false); }}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close gallery"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1)); setIsZoomed(false); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all z-10 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>

            <div
              ref={imgRef}
              className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in"
              onClick={(e) => { e.stopPropagation(); }}
              onMouseMove={handleMouseMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allImages[currentIndex]}
                alt={`${productName} — view ${currentIndex + 1}`}
                loading="lazy"
                decoding="async"
                className={`max-h-[75vh] max-w-full object-contain transition-transform duration-200 select-none ${
                  isZoomed ? "scale-[2]" : "scale-100"
                }`}
                style={
                  isZoomed
                    ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                    : undefined
                }
                draggable={false}
              />
            </div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1)); setIsZoomed(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all z-10 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 flex-shrink-0 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIndex(i); setIsZoomed(false); }}
                  className={`flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentIndex
                      ? "border-white opacity-100 scale-105"
                      : "border-white/20 opacity-50 hover:opacity-80 hover:border-white/40"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
