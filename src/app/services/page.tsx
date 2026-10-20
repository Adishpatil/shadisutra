import Link from "next/link";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export const metadata = pageMetadata(
  "Our Services | Shadi Sutra",
  "Wedding, birthday and function planning with decor, lighting, floral design, music and day-of coordination from Shadi Sutra.",
  "/services"
);

const serviceCards = [
  {
    slug: "weddings",
    title: "Weddings",
    subtitle: "Wedding planning and styling",
    description: "Your wedding, planned and styled from the first ceremony to the last dance.",
    image: "/images/gallery/weddings/weddings-3.webp",
    imageAlt:
      "Hanging floral arrangements and brass vessels beneath a tree at an outdoor celebration",
    aspectRatio: 16 / 9,
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
    title: "Birthdays",
    subtitle: "Birthday celebrations",
    description: "Birthday celebrations with a theme your family will love, from first birthdays to milestone years.",
    image: "/images/gallery/birthdays/birthdays-5.webp",
    imageAlt:
      "Floral arrangements lining an event walkway beneath a canopy of warm string lights",
    aspectRatio: 16 / 9,
    highlights: [
      "Themed decor",
      "Lighting and setup",
      "Music",
      "Event-day coordination",
    ],
  },
  {
    slug: "functions",
    title: "Functions",
    subtitle: "Family functions and special occasions",
    description: "Family gatherings and special occasions, managed from setup to farewell.",
    image: "/images/gallery/functions/functions-3.webp",
    imageAlt:
      "Round banquet tables arranged across a rooftop lawn during event setup",
    aspectRatio: 16 / 9,
    highlights: [],
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          What We Do
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          Our Services
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
          Whatever you are celebrating, we plan it, style it and run it, so you don&apos;t have to.
        </p>
      </section>

      {/* 3 Main Pillars Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 my-8">
        {serviceCards.map((service, index) => {
          const isEven = index % 2 === 1;
          return (
            <div
              key={service.slug}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]`}
            >
              <div
                className={`lg:col-span-6 rounded-radius-md overflow-hidden relative ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <PlaceholderImage
                  src={service.image}
                  alt={service.imageAlt}
                  aspectRatio={service.aspectRatio}
                  className="w-full h-auto object-cover rounded-radius-md"
                />
              </div>

              <div
                className={`lg:col-span-6 space-y-5 ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {service.subtitle}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
                    {service.title}
                  </h2>
                </div>

                <p className="text-ink-muted text-base leading-relaxed">
                  {service.description}
                </p>

                {service.highlights.length > 0 && <div className="space-y-2.5 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                    What&apos;s Included:
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-ink-muted">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>}

                <div className="pt-4 flex flex-wrap gap-4 items-center">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center px-6 py-3 bg-accent text-accent-ink font-semibold rounded-radius-full text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)]"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/contact?service=${service.slug}`}
                    className="inline-flex items-center px-6 py-3 border border-border text-ink font-medium rounded-radius-full text-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    Send an Enquiry
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center py-8">
        <h2 className="text-3xl font-heading font-bold text-ink">
          Planning a celebration?
        </h2>
        <p className="mt-4 text-ink-muted text-base max-w-xl mx-auto">
          Tell us your date and your dream, and we&apos;ll get back to you.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)]"
          >
            Send an Enquiry
          </Link>
        </div>
      </section>
    </div>
  );
}
