import type { Metadata } from "next";
import Link from "next/link";
import { site, siteLinks, hasSiteValue } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { LineArt } from "@/components/ui/LineArt";
import { Section } from "@/components/ui/Section";
import { getImageAvailability } from "@/data/image-availability";
import { imageSlots } from "@/data/images";

export const metadata: Metadata = pageMetadata(
  "About Shadi Sutra | Event Management",
  "Meet Shadi Sutra, an event management company that brings planning, decor, lighting, flowers and music together for weddings and celebrations.",
  "/about"
);

export default function AboutPage() {
  const available = getImageAvailability();
  const portrait = imageSlots.about;
  const celebration = imageSlots.aboutDetailWedding;
  const pairPhotoOne = imageSlots.recentWedding;
  const pairPhotoTwo = imageSlots.galleryBirthday5;

  return (
    <div className="page-shell">
      <Section
        tone="soft"
        className="relative overflow-hidden px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-24"
        aria-labelledby="about-heading"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="relative z-10 lg:col-span-7">
            <h1
              id="about-heading"
              className="max-w-[12ch] break-words text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
            >
              About
              <br />
              <span className="lime-highlight">Shadi Sutra</span>
            </h1>
            <div className="mt-6 max-w-2xl space-y-3 text-base leading-relaxed sm:text-lg">
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
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink transition-colors hover:bg-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Plan this event
            </Link>
          </div>
          <div className="about-photo-arch relative z-10 mx-auto w-full max-w-sm lg:col-span-4 lg:col-start-9">
            <div className="aspect-[4/5] overflow-hidden rounded-t-[50%] border border-ink/15 bg-brand-soft">
              {available.about ? (
                <PlaceholderImage
                  src={portrait.src}
                  alt={portrait.alt}
                  width={portrait.width}
                  height={portrait.height}
                  available
                  focalPoint={portrait.focalPoint}
                  sizes="(min-width: 1024px) 32vw, 90vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="service-photo-fallback h-full">
                  <LineArt id="arch" tone="brand" />
                  <span>Shadi Sutra</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section
        tone="red"
        className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
        aria-label="About Shadi Sutra"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-5 lg:col-span-6">
            <p data-tone-text="large" className="max-w-3xl text-2xl font-semibold leading-relaxed">
              Shadi Sutra is an event management company for weddings, birthday
              parties and family functions.
            </p>
            <p data-tone-text="large" className="max-w-3xl text-2xl font-semibold leading-relaxed">
              We take care of planning, decor, lighting, flowers, music and
              coordination.
            </p>
            <p data-tone-text="large" className="max-w-3xl text-2xl font-semibold leading-relaxed">
              You can be fully present for the moments that matter.
            </p>
          </div>
          <figure className="relative mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8">
            <div className="aspect-[4/5] overflow-hidden rounded-[24px] border border-ink/15 bg-brand-soft">
              {available.aboutDetailWedding ? (
                <PlaceholderImage
                  src={celebration.src}
                  alt={celebration.alt}
                  width={celebration.width}
                  height={celebration.height}
                  available
                  focalPoint={celebration.focalPoint}
                  sizes="(min-width: 1024px) 38vw, 90vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="service-photo-fallback h-full">
                  <LineArt id="arch" tone="brand" />
                </div>
              )}
            </div>
            <figcaption className="absolute -bottom-4 left-4 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink">
              Weddings
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section
        tone="white"
        className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
        aria-label="What we handle"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-5 lg:grid-cols-12 lg:gap-8">
          <figure className="relative overflow-hidden rounded-[24px] lg:col-span-7">
            <div className="aspect-[4/3] bg-brand-soft">
              {available.recentWedding ? (
                <PlaceholderImage
                  src={pairPhotoOne.src}
                  alt={pairPhotoOne.alt}
                  width={pairPhotoOne.width}
                  height={pairPhotoOne.height}
                  available
                  focalPoint={pairPhotoOne.focalPoint}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="service-photo-fallback h-full">
                  <LineArt id="arch" tone="brand" />
                </div>
              )}
            </div>
          </figure>
          <figure className="relative mt-0 overflow-hidden rounded-[24px] lg:col-span-4 lg:col-start-9 lg:mt-16">
            <div className="aspect-[4/5] bg-brand-soft">
              {available.galleryBirthday5 ? (
                <PlaceholderImage
                  src={pairPhotoTwo.src}
                  alt={pairPhotoTwo.alt}
                  width={pairPhotoTwo.width}
                  height={pairPhotoTwo.height}
                  available
                  focalPoint={pairPhotoTwo.focalPoint}
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="service-photo-fallback h-full">
                  <LineArt id="divider-line" tone="brand" />
                </div>
              )}
            </div>
          </figure>
        </div>
      </Section>

      <Section
        tone="ink"
        className="px-5 py-16 text-center sm:px-8 sm:py-24 lg:px-10"
        aria-labelledby="about-contact-heading"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            id="about-contact-heading"
            className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em]"
          >
            Let&apos;s plan your <span className="lime-highlight">celebration</span>
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {hasSiteValue(site.whatsapp) && (
              <a
                href={siteLinks.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink transition-transform active:scale-[0.97] hover:bg-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
              >
                WhatsApp
              </a>
            )}
            {hasSiteValue(site.phone) && (
              <a
                href={siteLinks.phoneUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink transition-transform active:scale-[0.97] hover:bg-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
              >
                Call
              </a>
            )}
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink transition-transform active:scale-[0.97] hover:bg-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
            >
              Plan this event
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
