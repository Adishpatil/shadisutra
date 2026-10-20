import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

interface ServiceDetail {
  categoryName: string;
  pageTitle: string;
  metadataTitle: string;
  description: string;
  image: string;
  imageAlt: string;
  included: string[];
}

const serviceData: Record<string, ServiceDetail> = {
  weddings: {
    categoryName: "Weddings",
    pageTitle: "Wedding Planning & Decor",
    metadataTitle: "Wedding Planning & Decor | Shadi Sutra",
    description:
      "Your wedding, planned and styled from the first ceremony to the last dance.",
    image: "/images/gallery/weddings/weddings-3.webp",
    imageAlt:
      "Hanging floral arrangements and brass vessels beneath a tree at an outdoor celebration",
    included: [
      "Planning and day-by-day timeline",
      "Stage, mandap and venue decor",
      "Lighting design",
      "Floral design",
      "Music and instruments",
      "On-the-day coordination",
    ],
  },
  birthdays: {
    categoryName: "Birthdays",
    pageTitle: "Birthday Party Planning",
    metadataTitle: "Birthday Party Planning | Shadi Sutra",
    description:
      "Birthday celebrations with a theme your family will love, from first birthdays to milestone years.",
    image: "/images/gallery/birthdays/birthdays-5.webp",
    imageAlt:
      "Floral arrangements lining an event walkway beneath a canopy of warm string lights",
    included: [
      "Themed decor",
      "Lighting and setup",
      "Music",
      "Event-day coordination",
    ],
  },
  functions: {
    categoryName: "Functions",
    pageTitle: "Event & Function Management",
    metadataTitle: "Event & Function Management | Shadi Sutra",
    description:
      "Family gatherings and special occasions, managed from setup to farewell.",
    image: "/images/gallery/functions/functions-3.webp",
    imageAlt:
      "Round banquet tables arranged across a rooftop lawn during event setup",
    included: [],
  },
};

export async function generateStaticParams() {
  return [
    { slug: "weddings" },
    { slug: "birthdays" },
    { slug: "functions" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceData[slug];
  if (!service) return { title: "Service Not Found", robots: { index: false } };

  return pageMetadata(
    service.metadataTitle,
    service.description,
    `/services/${slug}`
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceData[slug];

  if (!service) notFound();

  return (
    <div className="pt-24 pb-20">
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      >
        <ol className="flex items-center space-x-2 text-sm text-ink-muted">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center hover:text-ink transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center hover:text-ink transition-colors"
            >
              Services
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink font-semibold" aria-current="page">
            {service.categoryName}
          </li>
        </ol>
      </nav>

      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-8 sm:py-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          {service.categoryName}
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-heading font-bold text-ink">
          {service.pageTitle}
        </h1>
        <p className="mt-4 text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
          {service.description}
        </p>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-16">
        <div className="rounded-radius-lg overflow-hidden shadow-[var(--shadow-md)]">
          <PlaceholderImage
            src={service.image}
            alt={service.imageAlt}
            aspectRatio={16 / 9}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-16">
        <div className="p-8 sm:p-10 bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]">
          <h2 className="text-2xl font-heading font-bold text-ink mb-4">
            {service.categoryName}
          </h2>
          <p className="text-ink-muted leading-relaxed text-base sm:text-lg">
            {service.description}
          </p>
        </div>
      </section>

      {service.included.length > 0 && (
        <section className="bg-surface border-y border-border py-16 sm:py-24 my-16">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-heading font-bold text-ink">
                What is included
              </h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {service.included.map((item) => (
                <li
                  key={item}
                  className="p-6 rounded-radius-lg bg-bg border border-border text-base text-ink-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center py-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
          Planning a celebration?
        </h2>
        <p className="mt-3 text-ink-muted text-base max-w-xl mx-auto">
          Tell us your date and your dream, and we&apos;ll get back to you.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={`/contact?service=${slug}`}
            className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)]"
          >
            Send an Enquiry
          </Link>
        </div>
      </section>
    </div>
  );
}
