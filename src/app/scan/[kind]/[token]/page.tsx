import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { hasSiteValue, site, siteLinks } from "@/config/site";
import { LinkGateway } from "@/components/ui/LinkGateway";

export const metadata: Metadata = {
  title: `Event link | ${site.name}`,
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

const validToken = /^[A-Za-z0-9_-]{32}$/;

export default async function ScanLandingPage({
  params,
}: {
  params: Promise<{ kind: string; token: string }>;
}) {
  const { kind, token } = await params;
  const isValid = (kind === "guest" || kind === "client") && validToken.test(token);
  const eventHref = isValid
    ? `/${kind === "guest" ? "e" : "c"}/${token}`
    : null;
  const eventLabel = kind === "client" ? "Continue to private client link" : "Continue to event details";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-bg px-5 py-10">
      <section className="w-full max-w-lg rounded-[28px] border border-border bg-surface p-6 shadow-[var(--shadow-md)] sm:p-10">
        <div className="mb-8 inline-flex rounded-2xl bg-bg p-3">
          <Image
            src="/brand/logo.png"
            alt={site.name}
            width={172}
            height={58}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <p className="text-sm font-medium text-ink-muted">
          {kind === "client" ? "Private client link" : "Guest event link"}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {isValid ? "Your event link is ready" : "This link is not available"}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          {isValid
            ? "Choose whether to continue to the event details or explore the Shadi Sutra website."
            : "This link may be invalid or incomplete. Contact your event organizer for a current link."}
        </p>

        <div className="mt-8 grid gap-3">
          {eventHref && (
            <Link
              href={eventHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {eventLabel}
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-strong px-5 text-base font-semibold text-ink hover:bg-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Visit Shadi Sutra
          </Link>
        </div>
        {!isValid && (
          <div className="mt-4 flex flex-wrap gap-3">
            {hasSiteValue(site.whatsapp) && (
              <a
                href={siteLinks.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 text-base font-semibold text-ink"
              >
                WhatsApp
              </a>
            )}
            {hasSiteValue(site.phone) && (
              <a
                href={siteLinks.phoneUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 text-base font-semibold text-ink"
              >
                Call
              </a>
            )}
          </div>
        )}
      </section>
      <LinkGateway />
    </main>
  );
}
