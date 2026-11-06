"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryCategory } from "@/lib/types";
import { galleryImages, type ImageSlot } from "@/data/images";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Dialog } from "@/components/ui/Dialog";
import { useReveal } from "@/components/ui/useReveal";

type GallerySlotImage = (typeof galleryImages)[number];

interface GalleryViewProps {
  initialImages: readonly GallerySlotImage[];
  availableImages: Record<ImageSlot, boolean>;
}

const categories: { label: string; value: GalleryCategory }[] = [
  { label: "All", value: "all" },
  { label: "Weddings", value: "weddings" },
  { label: "Birthdays", value: "birthdays" },
  { label: "Functions", value: "functions" },
];

const imageRatios = ["aspect-[4/5]", "aspect-[4/3]", "aspect-square"];

export function GalleryView({ initialImages, availableImages }: GalleryViewProps) {
  useReveal();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const filteredImages =
    activeCategory === "all"
      ? initialImages
      : initialImages.filter((image) => image.category === activeCategory);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showNext = useCallback(() => {
    setLightboxIndex((index) =>
      index === null || filteredImages.length === 0
        ? null
        : (index + 1) % filteredImages.length
    );
  }, [filteredImages.length]);
  const showPrevious = useCallback(() => {
    setLightboxIndex((index) =>
      index === null || filteredImages.length === 0
        ? null
        : (index - 1 + filteredImages.length) % filteredImages.length
    );
  }, [filteredImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrevious]);

  const currentImage =
    lightboxIndex === null ? null : filteredImages[lightboxIndex] ?? null;

  return (
    <div>
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter photos"
      >
        {categories.map((category) => {
          const active = activeCategory === category.value;
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                setActiveCategory(category.value);
                setLightboxIndex(null);
              }}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active
                  ? "border-lime bg-lime text-ink"
                  : "border-border-strong bg-surface text-ink hover:border-ink"
              }`}
              aria-pressed={active}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {filteredImages.length === 0 ? (
        <p className="py-12 text-base text-ink-muted">
          No photos are available in this category.
        </p>
      ) : (
        <div className="gallery-masonry">
          {filteredImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="gallery-masonry-item group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[24px] bg-surface text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink sm:mb-5"
              aria-label={`Open photo: ${image.alt}`}
              data-reveal={index % 2 === 0 ? "left" : "right"}
              data-delay={(index % 3) + 1}
            >
              <div className={`relative overflow-hidden ${imageRatios[index % imageRatios.length]}`}>
                <PlaceholderImage
                  src={image.src}
                  alt={image.alt}
                  available={availableImages[image.imageSlot]}
                  focalPoint={image.focalPoint}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-3 inline-flex min-h-8 items-center rounded-full bg-lime px-3 py-1 text-sm font-semibold text-ink"
                >
                  {image.category === "weddings"
                    ? "Weddings"
                    : image.category === "birthdays"
                      ? "Birthdays"
                      : "Functions"}
                </span>
              </div>
              <span className="block px-4 py-3 text-base leading-snug text-ink">
                {image.alt}
              </span>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={currentImage !== null}
        onClose={closeLightbox}
        title="Our Work"
        className="sm:max-w-5xl"
      >
        {currentImage && lightboxIndex !== null && (
          <div
            onTouchStart={(event) => {
              touchStartX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStartX.current;
              const end = event.changedTouches[0]?.clientX;
              if (start !== null && end !== undefined && Math.abs(start - end) > 40) {
                if (end < start) showNext();
                else showPrevious();
              }
              touchStartX.current = null;
            }}
          >
            <div className="relative flex min-h-[min(60dvh,34rem)] items-center justify-center overflow-hidden rounded-2xl bg-ink">
              <PlaceholderImage
                src={currentImage.src}
                alt={currentImage.alt}
                available={availableImages[currentImage.imageSlot]}
                width={currentImage.width || 1200}
                height={currentImage.height || 900}
                sizes="(min-width: 1024px) 80vw, 100vw"
                focalPoint={currentImage.focalPoint}
                className="max-h-[65dvh] w-full object-contain"
              />
              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    aria-label="Previous photo"
                  >
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M19 12H5m6 6-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    aria-label="Next photo"
                  >
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink">
              {currentImage.alt}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {lightboxIndex + 1} of {filteredImages.length}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
