import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { LineArt } from "@/components/ui/LineArt";
import { Section } from "@/components/ui/Section";
import { PlanEventSheet } from "@/components/sections/PlanEventSheet";
import { getImageAvailability } from "@/data/image-availability";
import { imageSlots, type ImageSlot } from "@/data/images";

interface ServiceDetail {
  eventType: string;
  categoryName: string;
  pageTitle: string;
  metadataTitle: string;
  description: string;
  imageSlot: ImageSlot;
  included: string[];
}

const serviceData: Record<string, ServiceDetail> = {
  weddings: {
    eventType: "wedding",
    categoryName: "Weddings",
    pageTitle: "Wedding Planning & Decor",
    metadataTitle: "Wedding Planning & Decor | Shadi Sutra",
    description:
      "Your wedding, planned and styled from the first ceremony to the last dance.",
    imageSlot: "serviceWedding",
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
    eventType: "birthday",
    categoryName: "Birthdays",
    pageTitle: "Birthday Party Planning",
    metadataTitle: "Birthday Party Planning | Shadi Sutra",
    description:
      "Birthday celebrations with a theme your family will love, from first birthdays to milestone years.",
    imageSlot: "serviceBirthday",
    included: [
      "Themed decor",
      "Lighting and setup",
      "Music",
      "Event-day coordination",
    ],
  },
  functions: {
    eventType: "function",
    categoryName: "Functions",
    pageTitle: "Event & Function Management",
    metadataTitle: "Event & Function Management | Shadi Sutra",
    description:
      "Family gatherings and special occasions, managed from setup to farewell.",
    imageSlot: "serviceFunction",
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

  const image = imageSlots[service.imageSlot];
  const available = getImageAvailability()[service.imageSlot];

  return (
    <div className="page-shell">
      <Section
        tone="soft"
        className="px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-10"
        aria-label={`${service.categoryName} service`}
      >
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/services"
                className="inline-flex min-h-11 items-center hover:text-ink"
              >
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-ink" aria-current="page">
              {service.categoryName}
            </li>
          </ol>
        </nav>
        <div className="mx-auto mt-5 grid max-w-7xl items-start gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="service-detail-photo relative overflow-hidden rounded-[24px] bg-brand-soft lg:sticky lg:top-28 lg:col-span-6">
            {available ? (
              <PlaceholderImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                available
                focalPoint={image.focalPoint}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="service-photo-fallback aspect-[4/5]">
                <LineArt id="arch" tone="brand" />
                <span>{service.categoryName}</span>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h1 className="break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              <span className="lime-highlight">{service.pageTitle}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {service.description}
            </p>
            <div className="mt-7">
              <PlanEventSheet initialService={service.eventType} />
            </div>
          </div>
        </div>
      </Section>

      {service.included.length > 0 && (
        <Section
          tone="red"
          className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
          aria-labelledby="included-heading"
        >
          <div className="mx-auto max-w-7xl">
            <h2
              id="included-heading"
              className="max-w-3xl text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-tight text-bg"
            >
              What is included
            </h2>
            <ul className="mt-8 grid max-w-5xl gap-x-12 sm:grid-cols-2">
              {service.included.map((item) => (
                <li
                  key={item}
                  className="border-t border-bg/40 py-4 text-lg leading-relaxed text-bg marker:text-lime"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section
        tone="ink"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
        aria-label="Plan your event"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight text-bg">
            <span className="lime-highlight">{service.categoryName}</span>
          </h2>
          <PlanEventSheet initialService={service.eventType} variant="lime" />
        </div>
      </Section>
    </div>
  );
}
