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
  const hasDirectContact =
    hasSiteValue(site.whatsapp) ||
    hasSiteValue(site.phone) ||
    hasSiteValue(site.email) ||
    hasSiteValue(site.address) ||
    hasSiteValue(site.hours);

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          Contact
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          Let&apos;s plan your celebration
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-2xl mx-auto">
          Share your date, venue and ideas, and we&apos;ll be in touch.
        </p>
      </section>

      {/* Main Grid: Form + Direct Contact Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-8">
        <div className={`grid grid-cols-1 gap-12 ${hasDirectContact ? "lg:grid-cols-12" : ""}`}>
          {/* Contact Form */}
          <div className={hasDirectContact ? "lg:col-span-7" : ""}>
            <h2 className="text-2xl font-heading font-bold text-ink mb-6">
              Send an Enquiry
            </h2>
            <ContactForm initialService={service || "wedding"} />
          </div>

          {/* Quick Contact & Details */}
          {hasDirectContact && <div className="lg:col-span-5 space-y-8">
            {(hasSiteValue(site.whatsapp) ||
              hasSiteValue(site.phone) ||
              hasSiteValue(site.email)) && <div>
              <h2 className="text-2xl font-heading font-bold text-ink mb-6">
                Direct Channels
              </h2>
              <div className="space-y-4">
                {/* WhatsApp Button card */}
                {hasSiteValue(site.whatsapp) && (
                  <a
                    href={siteLinks.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 rounded-radius-md bg-[#25D366]/10 border border-[#25D366]/20 text-ink hover:bg-[#25D366]/15 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-radius-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Instant Messaging
                      </span>
                      <p className="font-semibold text-base text-ink group-hover:text-accent transition-colors">
                        Chat on WhatsApp
                      </p>
                    </div>
                  </a>
                )}

                {/* Direct Phone card */}
                {hasSiteValue(site.phone) && (
                  <a
                    href={siteLinks.phoneUrl}
                    className="flex items-center gap-4 p-5 rounded-radius-md bg-surface border border-border text-ink hover:border-accent/40 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-radius-full bg-accent text-accent-ink flex items-center justify-center shrink-0">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Phone Consultation
                      </span>
                      <p className="font-semibold text-base text-ink group-hover:text-accent transition-colors">
                        {site.phone}
                      </p>
                    </div>
                  </a>
                )}

                {/* Email card */}
                {hasSiteValue(site.email) && (
                  <a
                    href={siteLinks.emailUrl}
                    className="flex items-center gap-4 p-5 rounded-radius-md bg-surface border border-border text-ink hover:border-accent/40 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-radius-full bg-surface border border-border text-accent flex items-center justify-center shrink-0">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Official Inquiries
                      </span>
                      <p className="font-semibold text-base text-ink group-hover:text-accent transition-colors">
                        {site.email}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>}

            {/* Office & Studio Info */}
            {(hasSiteValue(site.address) || hasSiteValue(site.hours)) && <div className="p-6 rounded-radius-lg bg-surface border border-border space-y-4">
              <h3 className="font-heading text-lg font-bold text-ink">
                Office &amp; Consultations
              </h3>
              <div className="text-sm text-ink-muted space-y-2">
                {hasSiteValue(site.address) && <p>
                  <strong className="text-ink font-semibold">Address: </strong>
                  {site.address}
                </p>}
                {hasSiteValue(site.hours) && <p>
                  <strong className="text-ink font-semibold">Consultation Hours: </strong>
                  {site.hours}
                </p>}
              </div>
            </div>}
          </div>}
        </div>
      </section>
    </div>
  );
}
