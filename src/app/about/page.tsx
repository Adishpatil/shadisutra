import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${site.name}, our philosophy, team, and bespoke approach to event management.`,
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Header Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          Our Story &amp; Philosophy
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          Crafting Celebrations With Soul &amp; Precision
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
          At {site.name}, we believe every milestone celebration deserves meticulous craft,
          serene elegance, and heartfelt hospitality.
        </p>
      </section>

      {/* Story & Visual Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-radius-lg overflow-hidden shadow-[var(--shadow-md)]">
            <PlaceholderImage
              src="/images/about/about-01.webp"
              alt="Shadi Sutra team collaborating on event stage decor"
              width={1200}
              height={900}
              className="w-full h-auto aspect-[4/3] object-cover"
            />
          </div>

          <div className="space-y-6 text-ink-muted leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              Our Journey &amp; Approach
            </h2>
            <p>
              [TODO: Insert founding story. Founded with a vision to eliminate the chaos and stress
              traditionally associated with milestone events, {site.name} brings together seasoned event designers,
              master floral artists, logistical managers, and technical directors under one unified team.]
            </p>
            <p>
              Whether it is a regal wedding mandap steeped in cultural heritage, an energetic milestone birthday,
              or a sophisticated corporate gala, we oversee every touchpoint — from structural stage safety and
              acoustic tuning to ambient illumination and guest hospitality.
            </p>
            <div className="pt-4 border-t border-border grid grid-cols-2 gap-6">
              <div>
                <span className="block font-heading text-3xl font-bold text-accent">100%</span>
                <span className="text-sm text-ink-muted">Tailored &amp; Bespoke Design</span>
              </div>
              <div>
                <span className="block font-heading text-3xl font-bold text-accent">Zero</span>
                <span className="text-sm text-ink-muted">Stress For Your Family</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface border-y border-border py-16 sm:py-24 my-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-heading font-bold text-ink">
              The Principles That Guide Us
            </h2>
            <p className="mt-4 text-ink-muted">
              Every detail is deliberate, every vendor is vetted, and every timeline is rigorously maintained.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-radius-lg bg-bg border border-border">
              <span className="text-2xl font-heading text-accent font-bold">01</span>
              <h3 className="mt-3 text-xl font-heading font-semibold text-ink">
                Bespoke Artistry
              </h3>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                We avoid cookie-cutter packages. Your story, your aesthetic preferences, and your cultural rituals
                form the blueprint for every concept we design.
              </p>
            </div>

            <div className="p-8 rounded-radius-lg bg-bg border border-border">
              <span className="text-2xl font-heading text-accent font-bold">02</span>
              <h3 className="mt-3 text-xl font-heading font-semibold text-ink">
                Transparent Execution
              </h3>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                Clear communication, honest vendor pricing, and real-time portal tracking mean you are never left
                guessing what is happening behind the scenes.
              </p>
            </div>

            <div className="p-8 rounded-radius-lg bg-bg border border-border">
              <span className="text-2xl font-heading text-accent font-bold">03</span>
              <h3 className="mt-3 text-xl font-heading font-semibold text-ink">
                Grace Under Pressure
              </h3>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                Event day is when our operational rigour shines. We anticipate contingencies and manage vendors smoothly,
                allowing you to be fully present with your loved ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center py-12">
        <h2 className="text-3xl font-heading font-bold text-ink">
          Let’s Create Something Memorable Together
        </h2>
        <p className="mt-4 text-ink-muted text-base max-w-xl mx-auto">
          Reach out for an initial conversation with our planning team.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)]"
          >
            Contact Our Planners
          </Link>
        </div>
      </section>
    </div>
  );
}
