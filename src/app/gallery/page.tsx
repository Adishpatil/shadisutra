import { pageMetadata } from "@/config/seo";
import { getImageAvailability } from "@/data/image-availability";
import { galleryImages } from "@/data/images";
import { GalleryView } from "@/components/sections/GalleryView";
import { Section } from "@/components/ui/Section";

export const metadata = pageMetadata(
  "Event Gallery | Shadi Sutra",
  "Browse photos of weddings, birthdays and functions styled by Shadi Sutra.",
  "/gallery"
);

export default function GalleryPage() {
  const availableImages = getImageAvailability();
  const visibleImages = galleryImages.filter(
    (image) => availableImages[image.imageSlot]
  );

  return (
    <div className="page-shell">
      <Section
        tone="soft"
        className="px-5 pb-10 pt-32 sm:px-8 sm:pb-12 lg:px-10"
        aria-labelledby="gallery-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h1
            id="gallery-heading"
            className="break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
          >
            <span className="lime-highlight">Our Work</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            A look at celebrations we have styled. Filter by event type.
          </p>
        </div>
      </Section>

      <Section tone="white" className="px-5 pb-20 pt-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <GalleryView
            initialImages={visibleImages}
            availableImages={availableImages}
          />
        </div>
      </Section>
    </div>
  );
}
