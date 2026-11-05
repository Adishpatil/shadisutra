import { existsSync } from "node:fs";
import { cwd } from "node:process";
import path from "node:path";
import { pageMetadata } from "@/config/seo";
import { galleryImages, imageSlots, type ImageSlot } from "@/data/images";
import { GalleryView } from "@/components/sections/GalleryView";

export const metadata = pageMetadata(
  "Event Gallery | Shadi Sutra",
  "Browse photos of weddings, birthdays and functions styled by Shadi Sutra.",
  "/gallery"
);

export default function GalleryPage() {
  const images = galleryImages;
  const availableImages: Record<ImageSlot, boolean> = {
    hero: imageExists(imageSlots.hero.src),
    about: imageExists(imageSlots.about.src),
    galleryWedding3: imageExists(imageSlots.galleryWedding3.src),
    galleryWedding4: imageExists(imageSlots.galleryWedding4.src),
    galleryWedding6: imageExists(imageSlots.galleryWedding6.src),
    galleryBirthday4: imageExists(imageSlots.galleryBirthday4.src),
    galleryBirthday5: imageExists(imageSlots.galleryBirthday5.src),
    galleryFunction2: imageExists(imageSlots.galleryFunction2.src),
    serviceFunction: imageExists(imageSlots.serviceFunction.src),
  };

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
        <GalleryView initialImages={images} availableImages={availableImages} />
      </section>
    </div>
  );
}

function imageExists(source: string) {
  return existsSync(path.join(cwd(), "public", source.replace(/^\//, "")));
}
