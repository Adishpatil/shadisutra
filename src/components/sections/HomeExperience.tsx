"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { site, siteLinks, hasSiteValue } from "@/config/site";
import {
  homeEventImages,
  imageSlots,
  introImages,
  recentImages,
  type GalleryCategory,
  type ImageSlot,
} from "@/data/images";
import { ContactForm } from "@/components/sections/ContactForm";
import { Button, Card, Pill } from "@/components/ui/Button";
import { Dialog, Sheet } from "@/components/ui/Dialog";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Section } from "@/components/ui/Section";
import { useReveal } from "@/components/ui/useReveal";

type EventType = "wedding" | "birthday" | "function";

const eventOptions: readonly SelectOption[] = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "function", label: "Function" },
];

const events: {
  key: EventType;
  title: string;
  description: string;
  category: GalleryCategory;
}[] = [
  {
    key: "wedding",
    title: "Weddings",
    description:
      "Your wedding, planned and styled from the first ceremony to the last dance.",
    category: "weddings",
  },
  {
    key: "birthday",
    title: "Birthdays",
    description:
      "Birthday celebrations with a theme your family will love, from first birthdays to milestone years.",
    category: "birthdays",
  },
  {
    key: "function",
    title: "Functions",
    description:
      "Family gatherings and special occasions, managed from setup to farewell.",
    category: "functions",
  },
];

const services = [
  {
    title: "Planning",
    description: "We turn your ideas into a clear plan, timeline and budget.",
  },
  {
    title: "Decor & Lighting",
    description:
      "Stages, mandaps, entrances and lighting designed around your theme.",
  },
  {
    title: "Flowers & Music",
    description:
      "Fresh florals and music that set the mood for every moment.",
  },
  {
    title: "Coordination",
    description:
      "A dedicated team on the day, so you can enjoy your own celebration.",
  },
] as const;

interface HomeExperienceProps {
  availableImages: Record<ImageSlot, boolean>;
  lineArt: {
    arch: ReactNode;
    divider: ReactNode;
    heart: ReactNode;
    sun: ReactNode;
  };
}

export function HomeExperience({
  availableImages,
  lineArt,
}: HomeExperienceProps) {
  useReveal();

  const [eventType, setEventType] = useState<EventType>("wedding");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState<EventType | null>(null);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [expandedServices, setExpandedServices] = useState<string[]>(
    services.map((service) => service.title)
  );
  const touchStartX = useRef<number | null>(null);

  const closeEnquiry = useCallback(() => setEnquiryOpen(false), []);
  const closeDetail = useCallback(() => setDetailEvent(null), []);
  const closeLightbox = useCallback(() => setActivePhoto(null), []);
  const visibleGalleryImages = recentImages.filter(
    (image) => availableImages[image.imageSlot]
  );

  const selectedEvent =
    events.find((event) => event.key === (detailEvent ?? eventType)) ??
    events[0];
  const enquiryEvent = events.find((event) => event.key === eventType) ?? events[0];
  const photo = activePhoto === null ? null : visibleGalleryImages[activePhoto];
  const aboutImage = imageSlots.about;

  useEffect(() => {
    if (activePhoto === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setActivePhoto((index) =>
          index === null ? null : (index + 1) % visibleGalleryImages.length
        );
      } else if (event.key === "ArrowLeft") {
        setActivePhoto((index) =>
          index === null
            ? null
            : (index - 1 + visibleGalleryImages.length) % visibleGalleryImages.length
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activePhoto, visibleGalleryImages.length]);

  const openEnquiry = (nextEvent?: EventType) => {
    if (nextEvent) setEventType(nextEvent);
    setDetailEvent(null);
    setEnquiryOpen(true);
  };

  const onEnquirySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnquiryOpen(true);
  };

  const toggleService = (title: string) => {
    setExpandedServices((expanded) =>
      expanded.includes(title)
        ? expanded.filter((item) => item !== title)
        : [...expanded, title]
    );
  };

  const openDetail = (nextEvent: EventType) => setDetailEvent(nextEvent);
  const changePhoto = (direction: 1 | -1) => {
    setActivePhoto((index) =>
      index === null
        ? null
        : (index + direction + visibleGalleryImages.length) % visibleGalleryImages.length
    );
  };

  return (
    <>
      <Section
        tone="ink"
        className="home-hero relative isolate flex min-h-[100dvh] flex-col justify-between overflow-hidden text-bg"
        aria-labelledby="home-heading"
      >
        {availableImages.hero ? (
          <picture className="absolute inset-0 -z-20 block">
            {availableImages.heroMobile && (
              <source
                media="(max-width: 767px)"
                srcSet={imageSlots.heroMobile.src}
                type="image/webp"
              />
            )}
            <Image
              src={imageSlots.hero.src}
              alt=""
              width={imageSlots.hero.width}
              height={imageSlots.hero.height}
              priority
              sizes="100vw"
              style={{
                objectPosition: `${imageSlots.hero.focalPoint.x}% ${imageSlots.hero.focalPoint.y}%`,
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div className="home-hero-fallback absolute inset-0 -z-20" aria-hidden="true">
            {lineArt.arch}
          </div>
        )}
        <div className="home-hero-overlay absolute inset-0 -z-10" aria-hidden="true" />
        <div className="hero-sticker" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <defs>
              <path id="hero-sticker-circle" d="M50 50m-35 0a35 35 0 1 1 70 0a35 35 0 1 1-70 0" />
            </defs>
            <text>
              <textPath href="#hero-sticker-circle">
                Plan your event · Plan your event ·
              </textPath>
            </text>
          </svg>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 pb-8 pt-28 sm:px-8 sm:pb-10 lg:px-10">
          <div className="max-w-4xl py-10 sm:py-14">
            <h1
              id="home-heading"
              className="max-w-[16ch] break-words text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-bg"
            >
              Weddings, birthday parties and{" "}
              <span className="font-display-serif font-normal italic">
                family functions.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-bg/90 sm:text-lg">
              Share your date, venue and ideas, and we&apos;ll be in touch.
            </p>
          </div>

          <div className="home-hero-actions">
            <div className="home-mobile-actions">
              <Button
                type="button"
                variant="lime"
                className="w-full"
                onClick={() => setEnquiryOpen(true)}
              >
                Plan your event
              </Button>
              {hasSiteValue(site.whatsapp) && (
                <a
                  href={siteLinks.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-bg/75 px-6 py-3 text-base font-semibold text-bg transition-colors hover:bg-bg/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
                >
                  WhatsApp
                </a>
              )}
            </div>
            <form
              onSubmit={onEnquirySubmit}
              data-contact-form
              className="home-enquiry-bar"
            >
              <div className="home-enquiry-segment home-enquiry-select">
                <Select
                  id="home-event-type"
                  label="Event type"
                  ariaLabel="Event type"
                  value={eventType}
                  options={eventOptions}
                  onChange={(value) => {
                    if (
                      value === "wedding" ||
                      value === "birthday" ||
                      value === "function"
                    ) {
                      setEventType(value);
                    }
                  }}
                />
              </div>
              <label className="home-enquiry-segment">
                <span>Date</span>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                />
              </label>
              <label className="home-enquiry-segment">
                <span>Venue or city</span>
                <input
                  type="text"
                  value={venue}
                  onChange={(event) => setVenue(event.target.value)}
                  maxLength={120}
                  autoComplete="address-level2"
                />
              </label>
              <Button
                type="submit"
                className="home-enquiry-submit hover:bg-lime hover:text-ink"
              >
                Plan it
              </Button>
            </form>
          </div>
        </div>
      </Section>

      <Section
        tone="white"
        className="home-statement-section relative px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-label="Planning approach"
      >
        <div className="mx-auto max-w-7xl lg:pr-44">
          <p
            className="max-w-5xl text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-ink"
            data-reveal="up"
          >
            We take care of planning,{" "}
            decor, lighting, flowers, music and coordination, so you can be fully
            present for the moments that matter.
          </p>
          <div className="mt-8">{lineArt.divider}</div>
        </div>
        <div
          className="lime-marquee"
          role="img"
          aria-label="Weddings, Birthdays, Functions"
        >
          <div className="lime-marquee-track" aria-hidden="true">
            Weddings · Birthdays · Functions · Weddings · Birthdays · Functions ·
          </div>
        </div>
      </Section>

      <Section
        tone="soft"
        className="home-intro-section overflow-hidden px-5 py-12 sm:px-8 sm:py-20 lg:px-10"
        aria-label="Event planning services"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-4 sm:grid-cols-6 sm:gap-6 lg:grid-cols-12">
          {introImages.map((image, index) => {
            const ratios = [
              "col-span-1 aspect-[3/4] sm:col-span-3 lg:col-span-4 lg:aspect-[3/4]",
              "col-span-1 col-start-2 mt-10 aspect-square sm:col-span-3 sm:mt-8 lg:col-span-3 lg:mt-12 lg:aspect-square",
              "col-span-2 -mt-2 aspect-[4/3] sm:col-span-4 sm:col-start-2 sm:-mt-7 lg:col-span-4 lg:col-start-8 lg:-mt-20 lg:aspect-[4/3]",
            ];
            const captions: Record<string, string> = {
              weddings: "Planning",
              birthdays: "Decor & Lighting",
              functions: "Flowers & Music",
            };

            return (
              <article
                key={image.src}
                className={`relative min-w-0 overflow-hidden rounded-[24px] ${ratios[index]}`}
                data-reveal={index === 1 ? "right" : index === 2 ? "left" : "up"}
                data-delay={index + 1}
              >
                {availableImages[image.imageSlot] ? (
                  <PlaceholderImage
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    available
                    focalPoint={image.focalPoint}
                    sizes="(min-width: 1024px) 33vw, 60vw"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="event-card-fallback h-full">
                    {lineArt.arch}
                  </div>
                )}
                <Pill className="absolute bottom-3 left-3 border-transparent bg-lime text-ink">
                  {captions[image.category]}
                </Pill>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        tone="white"
        className="home-events-section px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-labelledby="event-types-heading"
      >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl" data-reveal="up">
              <h2
                id="event-types-heading"
                className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-ink"
              >
                Weddings, birthdays and{" "}
                <span className="lime-highlight">functions.</span>
              </h2>
            </div>
            <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {events.map((event) => {
                const image = homeEventImages.find(
                  (candidate) => candidate.category === event.category
                );
                if (!image) return null;

                return (
                  <Card
                    key={event.key}
                    className="event-card w-[86%] shrink-0 snap-center sm:w-auto"
                  >
                    <button
                      type="button"
                      onClick={() => openDetail(event.key)}
                      className="group block w-full text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      aria-label={`More about ${event.title}`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        {availableImages[image.imageSlot] ? (
                          <PlaceholderImage
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            available
                            focalPoint={image.focalPoint}
                            sizes="(min-width: 1024px) 33vw, 86vw"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="event-card-fallback">
                            {lineArt.arch}
                          </div>
                        )}
                      </div>
                      <span className="flex min-h-14 items-center justify-between gap-4 px-5 text-2xl font-semibold text-ink">
                        {event.title}
                        <svg
                          aria-hidden="true"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      </span>
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
      </Section>

      {visibleGalleryImages.length > 0 && (
        <Section
          tone="soft"
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
          aria-labelledby="recent-work-heading"
        >
          <div className="mb-8 flex items-end justify-between gap-5">
            <h2
              id="recent-work-heading"
              className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-ink"
              data-reveal="up"
            >
              Our <span className="lime-highlight">Work</span>
            </h2>
            <Link
              href="/gallery"
              className="inline-flex min-h-11 shrink-0 items-center text-base font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {visibleGalleryImages.slice(0, 6).map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActivePhoto(index)}
                className={`group relative block min-w-0 overflow-hidden rounded-[24px] border border-border bg-border/50 text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  index === 0 || index === 5
                    ? "col-span-2 aspect-[16/10] sm:col-span-2"
                    : "aspect-[4/5]"
                }`}
                aria-label={`Open photo: ${image.alt}`}
                data-reveal={index % 2 === 0 ? "left" : "right"}
                data-delay={(index % 3) + 1}
              >
                <PlaceholderImage
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  available={availableImages[image.imageSlot]}
                  focalPoint={image.focalPoint}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <Pill className="absolute bottom-3 left-3 border-transparent bg-lime text-ink">
                  {image.category === "weddings"
                    ? "Weddings"
                    : image.category === "birthdays"
                      ? "Birthdays"
                      : "Functions"}
                </Pill>
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section
        tone="red"
        className="home-services-section px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-labelledby="services-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="services-heading"
            className="mb-8 max-w-2xl text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-bg"
            data-reveal="up"
          >
            What We{" "}
            <span className="lime-highlight">
              Handle
            </span>
          </h2>
          <div className="border-t border-ink">
            {services.map((service) => {
              const expanded = expandedServices.includes(service.title);
              const panelId = `service-${service.title
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll("&", "and")}`;
              return (
                <article
                  key={service.title}
                  className="border-b border-ink"
                  data-reveal="up"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggleService(service.title)}
                      className="flex min-h-16 w-full items-center justify-between gap-5 py-4 text-left text-xl font-bold text-bg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-2xl"
                    >
                      {service.title}
                      <span aria-hidden="true" className="text-2xl font-normal">
                        {expanded ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    aria-hidden={!expanded}
                    inert={!expanded}
                    className={`service-accordion ${
                      expanded ? "is-expanded" : ""
                    }`}
                  >
                    <p className="max-w-2xl pb-5 text-base leading-relaxed text-ink">
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section
        tone="white"
        className="home-about-section px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-labelledby="about-heading"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div
            className="relative aspect-[3/2] overflow-hidden rounded-[26px]"
            data-reveal="left"
          >
            {availableImages.about ? (
              <PlaceholderImage
                src={aboutImage.src}
                alt={aboutImage.alt}
                width={aboutImage.width}
                height={aboutImage.height}
                available
                focalPoint={aboutImage.focalPoint}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="event-card-fallback h-full">
                {lineArt.arch}
                <span>About Shadi Sutra</span>
              </div>
            )}
          </div>
          <div data-reveal="right">
            <h2
              id="about-heading"
              className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-ink"
            >
              About <span className="lime-highlight">Shadi Sutra</span>
            </h2>
            <div className="mt-5 max-w-xl space-y-4 text-base leading-relaxed text-ink-muted sm:text-lg">
              <p>
                Shadi Sutra is an event management company for weddings, birthday
                parties and family functions.
              </p>
              <p>
                We take care of planning, decor, lighting, flowers, music and
                coordination.
              </p>
              <p>You can be fully present for the moments that matter.</p>
            </div>
            <div className="mt-6">{lineArt.sun}</div>
          </div>
        </div>
      </Section>

      <Section
        tone="ink"
        id="home-contact"
        className="home-contact-section relative px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-labelledby="contact-heading"
      >
        <div className="mx-auto max-w-4xl lg:pr-32">
          <h2
            id="contact-heading"
            className="mb-6 text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-bg"
          >
            Let&apos;s plan your celebration
          </h2>
          <div className="home-contact-art">{lineArt.heart}</div>
          <div className="mb-7 flex flex-wrap gap-3">
            {hasSiteValue(site.whatsapp) && (
              <a
                href={siteLinks.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                WhatsApp
              </a>
            )}
            {hasSiteValue(site.phone) && (
              <a
                href={siteLinks.phoneUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-bg/70 px-5 py-3 text-base font-semibold text-bg transition-colors hover:bg-bg/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Call
              </a>
            )}
          </div>
          <ContactForm key={eventType} initialService={eventType} />
          <p className="mt-6 text-base leading-relaxed text-bg">
            You can be fully present for the moments that matter.
          </p>
        </div>
      </Section>

      <Sheet
        open={enquiryOpen}
        onClose={closeEnquiry}
        title="Plan your event"
        className="sm:max-w-2xl"
      >
        <div className="space-y-5">
          <p className="text-base leading-relaxed text-ink-muted">
            Share your date, venue and ideas, and we&apos;ll be in touch.
          </p>
          <dl className="grid gap-3 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-ink-muted">Event type</dt>
              <dd className="mt-1 text-base font-semibold text-ink">
                {enquiryEvent.title}
              </dd>
            </div>
            {eventDate && (
              <div>
                <dt className="text-sm text-ink-muted">Date</dt>
                <dd className="mt-1 text-base font-semibold text-ink">
                  {eventDate}
                </dd>
              </div>
            )}
            {venue && (
              <div>
                <dt className="text-sm text-ink-muted">Venue or city</dt>
                <dd className="mt-1 break-words text-base font-semibold text-ink">
                  {venue}
                </dd>
              </div>
            )}
          </dl>
          <Link
            href={buildContactHref(eventType, eventDate, venue)}
            onClick={closeEnquiry}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-3 text-base font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Continue to enquiry form
          </Link>
        </div>
      </Sheet>

      <Sheet
        open={detailEvent !== null}
        onClose={closeDetail}
        title={selectedEvent.title}
      >
        <p className="text-base leading-relaxed text-ink-muted">
          {selectedEvent.description}
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={() => openEnquiry(selectedEvent.key)}
        >
          Plan this event
        </Button>
      </Sheet>

      <Dialog
        open={photo !== null}
        onClose={closeLightbox}
        title="Our Work"
        className="sm:max-w-5xl"
      >
        {photo && activePhoto !== null && (
          <div
            onTouchStart={(event) => {
              touchStartX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStartX.current;
              const end = event.changedTouches[0]?.clientX;
              if (start !== null && end !== undefined && Math.abs(end - start) > 40) {
                changePhoto(end < start ? 1 : -1);
              }
              touchStartX.current = null;
            }}
          >
            <div className="relative flex min-h-[min(60dvh,34rem)] items-center justify-center overflow-hidden rounded-2xl bg-ink">
              <PlaceholderImage
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                available={availableImages[photo.imageSlot]}
                focalPoint={photo.focalPoint}
                sizes="(min-width: 1024px) 80vw, 100vw"
                className="max-h-[65dvh] w-full object-contain"
              />
              {visibleGalleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => changePhoto(-1)}
                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    aria-label="Previous photo"
                  >
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M19 12H5m6 6-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => changePhoto(1)}
                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    aria-label="Next photo"
                  >
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink">
              {photo.alt}
            </p>
          </div>
        )}
      </Dialog>
    </>
  );
}

function buildContactHref(eventType: EventType, eventDate: string, venue: string) {
  const params = new URLSearchParams({ service: eventType });
  if (eventDate) params.set("date", eventDate);
  if (venue.trim()) params.set("venue", venue.trim());
  return `/contact?${params.toString()}`;
}
