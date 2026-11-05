import type { Metadata } from "next";
import { site, siteLinks, hasSiteValue } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = pageMetadata(
  "Contact Shadi Sutra | Plan Your Event",
  "Enquire about your wedding, birthday or function. Share your date and ideas, and the Shadi Sutra team will get back to you.",
  "/contact"
);

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  return (
    <div className="page-shell">
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pb-12 lg:px-10">
        <h1 className="max-w-[16ch] break-words text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
          Let&apos;s plan your celebration
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Share your date, venue and ideas, and we&apos;ll be in touch.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:px-10">
        <div className="space-y-5 lg:col-span-5">
          {hasSiteValue(site.whatsapp) && (
            <a
              href={siteLinks.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-base font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              WhatsApp
            </a>
          )}
          {hasSiteValue(site.phone) && (
            <a
              href={siteLinks.phoneUrl}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-border-strong px-6 text-base font-semibold text-ink transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Call {site.phone}
            </a>
          )}
          {hasSiteValue(site.email) && (
            <a
              href={siteLinks.emailUrl}
              className="inline-flex min-h-11 items-center text-base text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              {site.email}
            </a>
          )}
          {hasSiteValue(site.address) && (
            <div className="text-base leading-relaxed text-ink-muted">
              <p>{site.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
              >
                Open map
              </a>
            </div>
          )}
          {hasSiteValue(site.hours) && (
            <p className="text-base text-ink-muted">{site.hours}</p>
          )}
        </div>
        <div className="lg:col-span-7">
          <h2 className="mb-5 text-2xl font-semibold text-ink">Send an enquiry</h2>
          <ContactForm initialService={service || "wedding"} />
        </div>
      </section>
    </div>
  );
}
