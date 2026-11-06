import Link from "next/link";
import { hasSiteValue, site, siteLinks } from "@/config/site";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Section } from "@/components/ui/Section";

export function LinkGateway() {
  return (
    <Section
      aria-labelledby="shadi-sutra-gateway"
      tone="ink"
      className="link-gateway px-5 py-12 text-bg sm:px-8 sm:py-16"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <BrandLogo dark />
        <h2
          id="shadi-sutra-gateway"
          className="mt-6 font-display-serif text-2xl font-medium italic text-bg sm:text-3xl"
        >
          You can be fully present for the moments that matter.
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink transition-colors hover:bg-brand hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
          >
            Visit Shadi Sutra
          </Link>
          {hasSiteValue(site.whatsapp) && (
            <a
              href={siteLinks.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-bg/50 px-5 text-base font-semibold text-bg transition-colors hover:bg-bg/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
            >
              WhatsApp
            </a>
          )}
          {hasSiteValue(site.phone) && (
            <a
              href={siteLinks.phoneUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-bg/50 px-5 text-base font-semibold text-bg transition-colors hover:bg-bg/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-bg"
            >
              Call
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
