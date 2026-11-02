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

  if (images.length === 0) return null;

  return (
    <div className="page-shell">
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pb-12 lg:px-10">
        <h1 className="break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
          Our Work
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          A look at celebrations we have styled. Filter by event type.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <GalleryView initialImages={images} />
      </section>
    </div>
  );
}
