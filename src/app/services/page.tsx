import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import Link from "next/link";
import { PlanEventSheet } from "@/components/sections/PlanEventSheet";

export const metadata = pageMetadata(
  "Our Services | Shadi Sutra",
  "Wedding, birthday and function planning with decor, lighting, floral design, music and day-of coordination from Shadi Sutra.",
  "/services"
);

const serviceCards = [
  {
    slug: "weddings",
    eventType: "wedding",
    title: "Weddings",
    description: "Your wedding, planned and styled from the first ceremony to the last dance.",
    image: "/images/gallery/weddings/weddings-3.webp",
    imageAlt:
      "Hanging floral arrangements and brass vessels beneath a tree at an outdoor celebration",
    highlights: [
      "Planning and day-by-day timeline",
      "Stage, mandap and venue decor",
      "Lighting design",
      "Floral design",
      "Music and instruments",
      "On-the-day coordination",
    ],
  },
  {
    slug: "birthdays",
    eventType: "birthday",
    title: "Birthdays",
    description: "Birthday celebrations with a theme your family will love, from first birthdays to milestone years.",
    image: "/images/gallery/birthdays/birthdays-5.webp",
    imageAlt:
      "Floral arrangements lining an event walkway beneath a canopy of warm string lights",
    highlights: [
      "Themed decor",
      "Lighting and setup",
      "Music",
      "Event-day coordination",
    ],
  },
  {
    slug: "functions",
    eventType: "function",
    title: "Functions",
    description: "Family gatherings and special occasions, managed from setup to farewell.",
    image: "/images/gallery/functions/functions-3.webp",
    imageAlt:
      "Round banquet tables arranged across a rooftop lawn during event setup",
    highlights: [],
  },
];

export default function ServicesPage() {
  return (
    <div className="page-shell">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-10">
        <div className="max-w-3xl">
          <h1 className="break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
            Services
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Whatever you are celebrating, we plan it, style it and run it, so
            you don&apos;t have to.
          </p>
        </div>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative overflow-hidden rounded-[24px] lg:sticky lg:top-28 lg:col-span-5">
            <PlaceholderImage
              src={serviceCards[0].image}
              alt={serviceCards[0].imageAlt}
              width={1000}
              height={1250}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="divide-y divide-border border-y border-border">
              {serviceCards.map((service) => (
                <li key={service.slug} className="py-6 sm:py-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
                        {service.title}
                      </h2>
                      <p className="mt-2 text-base leading-relaxed text-ink-muted">
                        {service.description}
                      </p>
                    </div>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-full border border-ink/25 px-5 text-base font-semibold text-ink transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      View details
                    </Link>
                  </div>
                  {service.highlights.length > 0 && (
                    <ul className="mt-5 grid gap-x-6 text-base text-ink-muted sm:grid-cols-2">
                      {service.highlights.map((item) => (
                        <li key={item} className="border-t border-border py-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-5">
                    <PlanEventSheet initialService={service.eventType} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
