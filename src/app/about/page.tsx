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
    <div className="pt-24 pb-20">
      {/* Header Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          About Shadi Sutra
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          About Shadi Sutra
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
          {site.name} is an event management company for weddings, birthday
          parties and family functions.
        </p>
      </section>

      {/* Story & Visual Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-radius-lg overflow-hidden shadow-[var(--shadow-md)]">
            <PlaceholderImage
              src="/images/gallery/weddings/weddings-3.webp"
              alt="Hanging floral arrangements, brass vessels and seating beneath an outdoor tree"
              width={1200}
              height={900}
              className="w-full h-auto aspect-[4/3] object-cover"
            />
          </div>

          <div className="space-y-6 text-ink-muted leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              Celebrations, woven together
            </h2>
            <p>
              The name reflects how we work. Every celebration is made of many
              threads: people, rituals, flowers, light, music and time. Our job
              is to bring them together so the day feels effortless for you and
              memorable for your guests.
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
