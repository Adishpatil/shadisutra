import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { cwd } from "node:process";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { PlanEventSheet } from "@/components/sections/PlanEventSheet";
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
    imageSlot: "galleryWedding3",
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
    imageSlot: "galleryBirthday5",
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

  return (
    <div className="page-shell">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-5 pb-2 pt-28 sm:px-8 lg:px-10"
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

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pb-24 lg:px-10">
        <h1 className="max-w-[16ch] break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
          {service.pageTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {service.description}
        </p>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative overflow-hidden rounded-[24px] lg:sticky lg:top-28 lg:col-span-6">
            <PlaceholderImage
              src={image.src}
              alt={image.alt}
              width={1200}
              height={1500}
              available={imageExists(image.src)}
              focalPoint={image.focalPoint}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            {service.included.length > 0 && (
              <>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.035em] text-ink">
                  What is included
                </h2>
                <ul className="mt-5 divide-y divide-border border-y border-border">
                  {service.included.map((item) => (
                    <li key={item} className="py-4 text-base leading-relaxed text-ink-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-8">
              <PlanEventSheet initialService={service.eventType} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function imageExists(source: string) {
  return existsSync(path.join(cwd(), "public", source.replace(/^\//, "")));
}
