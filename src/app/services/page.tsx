import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { LineArt } from "@/components/ui/LineArt";
import { Section, type SectionTone } from "@/components/ui/Section";
import { PlanEventSheet } from "@/components/sections/PlanEventSheet";
import { getImageAvailability } from "@/data/image-availability";
import { imageSlots, type ImageSlot } from "@/data/images";

export const metadata = pageMetadata(
  "Our Services | Shadi Sutra",
  "Wedding, birthday and function planning with decor, lighting, floral design, music and day-of coordination from Shadi Sutra.",
  "/services"
);

const serviceCards: {
  slug: string;
  eventType: string;
  title: string;
  description: string;
  imageSlot: ImageSlot;
  tone: SectionTone;
  highlights: string[];
}[] = [
  {
    slug: "weddings",
    eventType: "wedding",
    title: "Weddings",
    description:
      "Your wedding, planned and styled from the first ceremony to the last dance.",
    imageSlot: "serviceWedding",
    tone: "white",
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
    description:
      "Birthday celebrations with a theme your family will love, from first birthdays to milestone years.",
    imageSlot: "serviceBirthday",
    tone: "red",
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
    description:
      "Family gatherings and special occasions, managed from setup to farewell.",
    imageSlot: "serviceFunction",
    tone: "ink",
    highlights: [],
  },
];

export default function ServicesPage() {
  const available = getImageAvailability();

  return (
    <div className="page-shell">
      <Section
        tone="soft"
        className="relative overflow-hidden px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-10"
        aria-labelledby="services-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h1
            id="services-heading"
            className="max-w-[12ch] break-words text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
          >
            <span className="lime-highlight">Services</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Whatever you are celebrating, we plan it, style it and run it, so
            you don&apos;t have to.
          </p>
        </div>
      </Section>

      {serviceCards.map((service, index) => {
        const image = imageSlots[service.imageSlot];
        const hasPhoto = available[service.imageSlot];
        const onDark = service.tone === "red" || service.tone === "ink";
        return (
          <Section
            key={service.slug}
            tone={service.tone}
            className="service-band px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
            aria-labelledby={`service-${service.slug}-heading`}
          >
            <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-3">
                <h2
                  id={`service-${service.slug}-heading`}
                  className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight"
                >
                  {service.title}
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="max-w-xl text-base leading-relaxed sm:text-lg">
                  {service.description}
                </p>
                {service.highlights.length > 0 && (
                  <details
                    className={`service-included mt-5 border-y ${
                      service.tone === "red"
                        ? "border-ink"
                        : "border-border-strong"
                    }`}
                  >
                    <summary
                      className={`flex min-h-12 cursor-pointer items-center justify-between gap-4 py-3 text-lg font-semibold focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                        service.tone === "ink" ? "text-bg" : "text-ink"
                      }`}
                    >
                      What is included
                      <span aria-hidden="true" className="text-xl font-normal">
                        +
                      </span>
                    </summary>
                    <ul
                      className={`list-disc space-y-2 pb-4 pl-5 text-base leading-relaxed ${
                        service.tone === "red" || service.tone === "ink"
                          ? "marker:text-lime"
                          : "marker:text-brand-strong"
                      }`}
                    >
                      {service.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </details>
                )}
                <div className="mt-5">
                  <PlanEventSheet
                    initialService={service.eventType}
                    variant={onDark ? "lime" : "primary"}
                  />
                </div>
              </div>
              <div className="service-band-photo group relative overflow-hidden rounded-[24px] bg-brand-soft lg:col-span-4">
                {hasPhoto ? (
                  <PlaceholderImage
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    available
                    focalPoint={image.focalPoint}
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="service-photo-fallback aspect-[4/3]">
                    <LineArt
                      id={index === 1 ? "heart-line" : "arch"}
                      tone="brand"
                    />
                    <span>{service.title}</span>
                  </div>
                )}
              </div>
            </div>
          </Section>
        );
      })}
    </div>
  );
}
