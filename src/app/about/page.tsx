import type { Metadata } from "next";
import { site } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export const metadata: Metadata = pageMetadata(
  "About Shadi Sutra | Event Management",
  "Meet Shadi Sutra, an event management company that brings planning, decor, lighting, flowers and music together for weddings and celebrations.",
  "/about"
);

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-10">
        <h1 className="max-w-[16ch] break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
          About Shadi Sutra
        </h1>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="relative overflow-hidden rounded-[24px] lg:sticky lg:top-28 lg:col-span-6">
            <PlaceholderImage
              src="/images/gallery/weddings/weddings-3.webp"
              alt="Hanging floral arrangements, brass vessels and seating beneath an outdoor tree"
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div className="space-y-6 text-base leading-relaxed text-ink-muted sm:text-lg lg:col-span-5 lg:col-start-8">
            <p>
              {site.name} is an event management company for weddings, birthday
              parties and family functions.
            </p>
            <p>
              We take care of planning, decor, lighting, flowers, music and
              coordination, so you can be fully present for the moments that
              matter.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
