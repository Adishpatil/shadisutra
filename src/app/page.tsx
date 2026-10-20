import Image from "next/image";
import Link from "next/link";
import galleryImages from "@/data/gallery.json";
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
  const heroAlt = "White floral stage set against dark curtains with a matching dance-floor monogram";
  const mosaicImages = galleryImages;

  return (
    <>
      <section className="home-hero relative isolate flex h-[50svh] min-h-[22rem] max-h-[26rem] items-center overflow-hidden sm:h-[60vh] sm:max-h-[36rem]">
        <div className="absolute inset-0 -z-20">
          <PlaceholderImage
            src="/images/hero/hero-1.webp"
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="home-hero-scrim absolute inset-0 -z-10" aria-hidden="true" />

        <div className="mx-auto w-full max-w-7xl px-5 pb-5 pt-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-base font-semibold uppercase tracking-[0.18em] text-white/90">
              {site.name}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] text-white sm:text-5xl md:text-6xl">
              Celebrations, beautifully woven.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white sm:text-lg">
              Weddings, birthdays and special occasions, planned and styled
              with care, from the first idea to the last goodbye.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-radius-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
              >
                Plan Your Event
              </Link>
              <Link
                href="/gallery"
                className="inline-flex min-h-11 items-center justify-center rounded-radius-full border border-white/70 bg-ink/20 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/15"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="home-reveal mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
        aria-labelledby="event-types-heading"
      >
        <div className="mb-9 max-w-2xl">
          <p className="text-base font-semibold uppercase tracking-[0.16em] text-accent">
            Occasions
          </p>
          <h2 id="event-types-heading" className="mt-3 text-3xl sm:text-4xl">
            Weddings · Birthdays · Functions
          </h2>
          <span className="section-ornament mt-5" aria-hidden="true" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((event) => {
            const image = galleryImages.find(
              (item) => item.category === event.category
            );

            return (
              <Link
                key={event.title}
                href={event.href}
                className="group overflow-hidden border border-border bg-surface transition-colors hover:border-accent focus-visible:outline-offset-4"
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
                <div className="p-5 sm:p-6">
                  <h3 className="text-2xl">{event.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        className="home-reveal home-dark-section bg-ink text-white"
        aria-labelledby="services-heading"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mb-10 max-w-2xl">
              <h2 id="services-heading" className="mt-3 text-3xl text-white sm:text-4xl">
              What We Handle
            </h2>
            <span className="section-ornament section-ornament-light mt-5" aria-hidden="true" />
          </div>

          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="border-t border-white/20 py-6 sm:px-5 sm:first:pl-0 lg:border-l lg:border-t-0 lg:py-2 lg:first:border-l-0"
              >
                <p className="font-heading text-4xl text-accent-light">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-xl text-white">{service.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-white/75">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="home-reveal mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
        aria-labelledby="gallery-heading"
      >
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.16em] text-accent">
              Our Work
            </p>
            <h2 id="gallery-heading" className="mt-3 text-3xl sm:text-4xl">
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

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {mosaicImages.map((image, index) => (
            <Link
              key={image.src}
              href="/gallery"
              className={`group relative block overflow-hidden bg-accent-light ${
                index === 0
                  ? "col-span-2 aspect-[16/9] lg:col-span-2 lg:row-span-2 lg:aspect-auto"
                  : "aspect-[4/3]"
              }`}
              aria-label={`View gallery: ${image.alt}`}
            >
              {index === 0 ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
            </Link>
          ))}
        </div>
      </section>

      <section
        className="home-reveal border-y border-border bg-surface"
        aria-labelledby="process-heading"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mb-10 max-w-2xl">
            <p className="text-base font-semibold uppercase tracking-[0.16em] text-accent">
              How we work
            </p>
            <h2 id="process-heading" className="mt-3 text-3xl sm:text-4xl">
              From First Idea to Final Farewell
            </h2>
            <span className="section-ornament mt-5" aria-hidden="true" />
          </div>

          <ol className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <li key={item.step} className="border-t border-border pt-5">
                <p className="font-heading text-3xl text-accent">{item.step}</p>
                <h3 className="mt-3 text-2xl">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-reveal px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl border border-border bg-accent-light/40 px-6 py-10 text-center sm:px-12 sm:py-14">
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Planning a celebration?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Tell us your date and your dream, and we&apos;ll get back to you.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-radius-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Send an Enquiry
          </Link>
        </div>
      </section>
    </>
  );
}
