import { pageMetadata } from "@/config/seo";
import { getGalleryImages } from "@/lib/gallery";
import { GalleryView } from "@/components/sections/GalleryView";

export const metadata = pageMetadata(
  "Event Gallery | Shadi Sutra",
  "Browse photos of weddings, birthdays and functions styled by Shadi Sutra.",
  "/gallery"
);

export default function GalleryPage() {
  const images = getGalleryImages("all");

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          Our Work
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          Our Work
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
          A look at celebrations we have styled. Filter by event type.
        </p>
      </section>

      {/* Gallery with filter and lightbox */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-8">
        <GalleryView initialImages={images} />
      </section>

    </div>
  );
}
