"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GalleryImage, GalleryCategory } from "@/lib/types";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

interface GalleryViewProps {
  initialImages: GalleryImage[];
}

const categories: { label: string; value: GalleryCategory }[] = [
  { label: "All Works", value: "all" },
  { label: "Weddings", value: "weddings" },
  { label: "Birthdays", value: "birthdays" },
  { label: "Functions", value: "functions" },
];

export function GalleryView({ initialImages }: GalleryViewProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const filteredImages =
    activeCategory === "all"
      ? initialImages
      : initialImages.filter((img) => img.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filteredImages.length : null
    );
  }, [lightboxIndex, filteredImages.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + filteredImages.length) % filteredImages.length
        : null
    );
  }, [lightboxIndex, filteredImages.length]);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, showNext, showPrev]);

  const currentImage =
    lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setActiveCategory(cat.value);
                setLightboxIndex(null);
              }}
              className={`px-5 py-2.5 rounded-radius-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent text-accent-ink shadow-[var(--shadow-sm)]"
                  : "bg-surface border border-border text-ink-muted hover:text-ink hover:border-accent/40"
              }`}
              aria-pressed={isActive}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 text-ink-muted bg-surface rounded-radius-lg border border-border">
          No images found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, index) => (
            <div
              key={`${img.src}-${index}`}
              className="group relative rounded-radius-md overflow-hidden bg-surface border border-border cursor-pointer transition-all hover:shadow-[var(--shadow-md)]"
              onClick={() => openLightbox(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View photo: ${img.alt}`}
            >
              <div className="overflow-hidden aspect-[4/3] relative">
                <PlaceholderImage
                  src={img.src}
                  alt={img.alt}
                  width={img.width || 800}
                  height={img.height || 600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-white bg-ink/60 px-3 py-1.5 rounded-radius-full backdrop-blur-sm">
                    Enlarge Photo
                  </span>
                </div>
              </div>

              <div className="p-4 bg-surface">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent block">
                  {img.category}
                </span>
                <p className="text-sm font-medium text-ink truncate mt-1">
                  {img.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Lightbox Modal */}
      {currentImage && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 backdrop-blur-md p-4 sm:p-6"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2 rounded-radius-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          {filteredImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white p-3 rounded-radius-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {filteredImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white p-3 rounded-radius-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Modal Content */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-radius-md shadow-2xl">
              <PlaceholderImage
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width || 1200}
                height={currentImage.height || 800}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-radius-md"
              />
            </div>

            <div className="mt-4 text-center text-white px-4">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                {currentImage.category} • {lightboxIndex + 1} of {filteredImages.length}
              </span>
              <p className="mt-1 text-sm sm:text-base font-medium text-white/90">
                {currentImage.alt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
