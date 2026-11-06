import type { Metadata } from "next";
import { site, siteLinks, hasSiteValue } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { BrandLogo } from "@/components/ui/BrandLogo";
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
  const venue = imageSlots.aboutDetailVenue;

  return (
    <div className="page-shell">
      <Section
        tone="soft"
        className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-10"
        aria-labelledby="about-heading"
      >
        <LineArt id="couple" tone="brand" className="about-line-art" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="relative z-10 lg:col-span-7">
            <h1
              id="about-heading"
              className="max-w-[12ch] break-words text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink"
            >
              About
              <br />
              <span className="lime-highlight">Shadi Sutra</span>
            </h1>
          </div>
          <div className="about-photo-arch relative mx-auto w-full max-w-sm lg:col-span-4 lg:col-start-9">
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
            <LineArt id="arch" tone="brand" className="about-arch-accent" />
          </div>
        </div>
      </Section>

      <Section
        tone="red"
        className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-label="About Shadi Sutra"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-5 lg:col-span-6">
            <p className="max-w-3xl text-2xl font-semibold leading-relaxed text-bg">
              Shadi Sutra is an event management company for weddings, birthday
              parties and family functions.
            </p>
            <p className="max-w-3xl text-2xl font-semibold leading-relaxed text-bg">
              We take care of planning, decor, lighting, flowers, music and
              coordination.
            </p>
            <p className="max-w-3xl text-2xl font-semibold leading-relaxed text-bg">
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
            <LineArt id="sun-lines" tone="white" className="about-sun-art" />
          </figure>
        </div>
      </Section>

      <Section
        tone="white"
        className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        aria-label="What we handle"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative overflow-hidden rounded-[24px] bg-brand-soft lg:col-span-5">
            <div className="aspect-[3/2]">
              {available.aboutDetailVenue ? (
                <PlaceholderImage
                  src={venue.src}
                  alt={venue.alt}
                  width={venue.width}
                  height={venue.height}
                  available
                  focalPoint={venue.focalPoint}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="service-photo-fallback h-full">
                  <LineArt id="divider-line" tone="brand" />
                </div>
              )}
            </div>
            <LineArt id="divider-line" tone="brand" className="about-divider-art" />
          </div>
          <ul className="about-service-list space-y-5 text-lg leading-relaxed text-ink lg:col-span-6 lg:col-start-7">
            <li>We turn your ideas into a clear plan, timeline and budget.</li>
            <li>
              Stages, mandaps, entrances and lighting designed around your theme.
            </li>
            <li>Fresh florals and music that set the mood for every moment.</li>
            <li>
              A dedicated team on the day, so you can enjoy your own celebration.
            </li>
          </ul>
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
            className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.04em] text-bg"
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
            <BrandLogo dark />
          </div>
        </div>
      </Section>
    </div>
  );
}
