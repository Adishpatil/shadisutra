import { site } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { getGalleryImages } from "@/lib/gallery";
import { GalleryView } from "@/components/sections/GalleryView";
import Link from "next/link";

export const metadata = pageMetadata(
  "Event Gallery",
  `Browse event designs and celebrations curated by ${site.name}.`,
  "/gallery"
);

export default function GalleryPage() {
  const images = getGalleryImages("all");

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          Portfolio &amp; Showcase
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          Celebrations in Frame
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
          Explore a curated glimpse of mandaps, floral backdrops, immersive party themes, and gala evenings.
        </p>
      </section>

      {/* Gallery with filter and lightbox */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-8">
        <GalleryView initialImages={images} />
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center py-12">
        <div className="p-8 sm:p-12 bg-surface rounded-radius-lg border border-border">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Have a Specific Theme or Design in Mind?
          </h2>
          <p className="mt-3 text-ink-muted text-base max-w-xl mx-auto">
            Our creative designers will customize your color schemes, stage architecture, and lighting presets.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)]"
            >
              Start Your Design Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
