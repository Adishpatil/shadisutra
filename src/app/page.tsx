import { existsSync } from "node:fs";
import { cwd } from "node:process";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import galleryImages from "@/data/gallery.json";
import { heroImages } from "@/data/hero";
import { site } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export const metadata = pageMetadata(
  "Shadi Sutra | Wedding & Event Management",
  "Shadi Sutra plans and styles weddings, birthday parties and family functions, with decor, lighting, flowers, music and on-the-day coordination.",
  "/"
);

const eventTypes = [
  {
    title: "Weddings",
    category: "weddings",
    href: "/services/weddings",
  },
  {
    title: "Birthdays",
    category: "birthdays",
    href: "/services/birthdays",
  },
  {
    title: "Functions",
    category: "functions",
    href: "/services/functions",
  },
] as const;

const services = [
  {
    title: "Planning",
    description: "We turn your ideas into a clear plan, timeline and budget.",
  },
  {
    title: "Decor & Lighting",
    description: "Stages, mandaps, entrances and lighting designed around your theme.",
  },
  {
    title: "Flowers & Music",
    description: "Fresh florals and music that set the mood for every moment.",
  },
  {
    title: "Coordination",
    description: "A dedicated team on the day, so you can enjoy your own celebration.",
  },
] as const;

const process = [
  {
    step: "01",
    title: "Discover",
    description: "We listen to your ideas, dates and budget.",
  },
  {
    step: "02",
    title: "Plan",
    description: "We design the look, the schedule and the vendors.",
  },
  {
    step: "03",
    title: "Execute",
    description: "We set up and run the day with a dedicated team.",
  },
  {
    step: "04",
    title: "Remember",
    description: "You take home the memories, not the stress.",
  },
] as const;

export default function HomePage() {
  const heroImage = heroImages[0];
  const mobileHeroPath = path.join(
    cwd(),
    "public",
    heroImage.mobileSrc.replace(/^\//, "")
  );
  const hasMobileHero = existsSync(mobileHeroPath);
  const mosaicImages = galleryImages;

  return (
    <>
      <section className="home-hero relative isolate overflow-hidden border-b border-white/10 bg-ink">
        <div className="absolute inset-0 -z-20">
          <picture className="block h-full w-full">
            {hasMobileHero && (
              <source
                media="(max-width: 767px)"
                srcSet={heroImage.mobileSrc}
                type="image/webp"
              />
            )}
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              sizes="100vw"
              style={{
                objectPosition: `${heroImage.focalPoint.x}% ${heroImage.focalPoint.y}%`,
              }}
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(28,26,23,0.8)_0%,rgba(28,26,23,0.58)_35%,rgba(28,26,23,0.12)_100%)]" aria-hidden="true" />

        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <div className="flex min-h-[32rem] items-end pb-6 sm:min-h-[38rem] lg:min-h-[42rem]">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-base">
                {site.name}
              </p>
              <h1 className="max-w-xl text-[clamp(2.4rem,7vw,4.55rem)] font-semibold leading-[0.97] tracking-[-0.04em] text-white">
                Celebrations, beautifully woven.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                Weddings, birthdays and special occasions, planned and styled
                with care, from the first idea to the last goodbye.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
                >
                  Plan Your Event
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        aria-labelledby="event-types-heading"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent sm:text-base">
            Occasions
          </p>
          <h2 id="event-types-heading" className="mt-3 text-3xl text-ink sm:text-4xl">
            Weddings · Birthdays · Functions
          </h2>
          <span className="section-ornament mt-5" aria-hidden="true" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((event) => {
            const image = galleryImages.find(
              (item) => item.category === event.category
            );

            return (
              <Link
                key={event.title}
                href={event.href}
                className="group block overflow-hidden rounded-[28px] border border-border bg-surface shadow-[var(--shadow-sm)] transition-colors hover:border-accent"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-accent-light">
                  <PlaceholderImage
                    src={image?.src}
                    alt={image?.alt ?? ""}
                    width={image?.width ?? 800}
                    height={image?.height ?? 600}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
                  <h3 className="text-2xl text-ink">{event.title}</h3>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-accent-light text-lg text-accent">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-ink text-white" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 id="services-heading" className="mt-3 text-3xl text-white sm:text-4xl">
              What We Handle
            </h2>
            <span className="section-ornament section-ornament-light mt-5" aria-hidden="true" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="rounded-[24px] border border-white/10 bg-white/3 p-5 sm:p-6"
              >
                <p className="font-heading text-4xl text-accent-light">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-xl" style={{ color: "#ffffff" }}>
                  {service.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="gallery-heading">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent sm:text-base">
              Our Work
            </p>
            <h2 id="gallery-heading" className="mt-3 text-3xl text-ink sm:text-4xl">
              A look at celebrations we have styled.
            </h2>
            <span className="section-ornament mt-5" aria-hidden="true" />
          </div>
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center text-base font-semibold text-accent underline decoration-border-strong underline-offset-4 hover:decoration-accent"
          >
            Explore the gallery
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {mosaicImages.map((image, index) => (
            <Link
              key={image.src}
              href="/gallery"
              className={`group relative block overflow-hidden rounded-[26px] border border-border bg-accent-light ${
                index === 0 ? "col-span-2 aspect-[16/9] lg:col-span-2 lg:row-span-2 lg:aspect-[1.25/1]" : "aspect-[4/3]"
              }`}
              aria-label={`View gallery: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface" aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent sm:text-base">
              How we work
            </p>
            <h2 id="process-heading" className="mt-3 text-3xl text-ink sm:text-4xl">
              From First Idea to Final Farewell
            </h2>
            <span className="section-ornament mt-5" aria-hidden="true" />
          </div>

          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <li key={item.step} className="rounded-[22px] border border-border bg-bg p-5 sm:p-6">
                <p className="font-heading text-3xl text-accent">{item.step}</p>
                <h3 className="mt-3 text-2xl text-ink">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-border bg-accent-light/70 px-6 py-10 text-center sm:px-12 sm:py-14">
          <h2 className="text-3xl text-ink sm:text-4xl">Planning a celebration?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Tell us your date and your dream, and we&apos;ll get back to you.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Send an Enquiry
          </Link>
        </div>
      </section>
    </>
  );
}
