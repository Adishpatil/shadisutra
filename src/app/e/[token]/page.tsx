import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { hasSiteValue, site, siteLinks } from "@/config/site";
import { getPublicSharedEvent } from "@/lib/events/public-share";
import { formatDate, formatDateTimeKolkata, formatTime12Hour } from "@/lib/date-time";
import { CardFrame } from "@/components/ui/CardFrame";
import { LinkGateway } from "@/components/ui/LinkGateway";
import { GuestSchedule } from "@/components/sections/GuestSchedule";
import { SharedEventActions } from "@/components/sections/SharedEventActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Private Event Details | ${site.name}`,
  robots: { index: false, follow: false, noarchive: true },
};

function InvalidLink() {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <main id="main-content" className="min-h-[100dvh] bg-bg">
        <div className="flex justify-end bg-brand px-5 pb-4 pt-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Visit Shadi Sutra
          </Link>
        </div>
        <section className="bg-brand px-4 pb-12 sm:px-8 sm:pb-16">
          <div className="invitation-card-shell mx-auto max-w-xl">
            <article className="ticket-card invitation-card">
              <CardFrame className="min-h-72 px-6 pb-8 pt-24 text-center sm:px-12">
                <h1 className="font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                  This invitation is unavailable
                </h1>
                <p className="mt-4 text-base leading-relaxed text-ink-muted">
                  This event link may have expired or been updated. Contact your
                  event organizer for a current invitation.
                </p>
              </CardFrame>
            </article>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {hasSiteValue(site.whatsapp) && (
              <a
                href={siteLinks.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-bg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                WhatsApp
              </a>
            )}
            {hasSiteValue(site.phone) && (
              <a
                href={siteLinks.phoneUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/40 px-5 text-base font-semibold text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Call
              </a>
            )}
          </div>
        </section>
        <LinkGateway />
      </main>
    </>
  );
}

function formatTimelineTime(value: string) {
  return formatDateTimeKolkata(value).replace(/\b(am|pm)\b/i, (period) =>
    period.toUpperCase()
  );
}

export default async function SharedEventPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [{ token }, requestHeaders] = await Promise.all([params, headers()]);
  const event = await getPublicSharedEvent(token, requestHeaders);
  if (!event) return <InvalidLink />;

  const mapUrl = event.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
    : null;

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <main id="main-content" className="min-h-[100dvh] bg-bg text-ink">
        <header className="flex justify-end bg-brand px-5 pb-4 pt-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Visit Shadi Sutra
          </Link>
        </header>

        <section className="invitation-stage bg-brand px-4 pb-10 sm:px-6 sm:pb-14">
          <div className="invitation-card-shell mx-auto w-full max-w-3xl">
            <article className="ticket-card invitation-card">
              <CardFrame className="min-h-80 px-5 pb-10 pt-28 text-center sm:min-h-96 sm:px-16 sm:pt-32">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  Event invitation
                </p>
                <h1 className="mt-3 break-words font-heading text-[clamp(2.5rem,9vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
                  {event.name}
                </h1>
                <div className="mt-5 space-y-1 font-display-serif text-base italic leading-relaxed text-ink-muted sm:text-lg">
                  <p>
                    <time dateTime={event.date}>{formatDate(event.date)}</time>
                  </p>
                  <p className="break-words">{event.venue}</p>
                </div>
              </CardFrame>
            </article>
          </div>
        </section>

        <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
          <GuestSchedule
            entries={event.timeline.map((entry) => ({
              startsAt: entry.starts_at,
              time: formatTimelineTime(entry.starts_at),
              title: entry.title,
            }))}
          />

          <section aria-labelledby="functions-title">
            <h2 id="functions-title" className="font-heading text-2xl font-bold text-ink">
              Functions
            </h2>
            {event.functions.length ? (
              <ul
                aria-label="Swipe to browse functions"
                className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0"
              >
                {event.functions.map((eventFunction, index) => (
                  <li
                    key={`${eventFunction.date}-${eventFunction.name}-${index}`}
                    className="min-w-[86%] snap-center sm:min-w-[min(28rem,75%)]"
                  >
                    <details className="guest-function-card h-full overflow-hidden rounded-[24px] border border-border bg-surface">
                      <summary className="min-h-72 cursor-pointer list-none text-center focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink">
                        <CardFrame className="px-5 pb-8 pt-24">
                          <h3 className="break-words font-heading text-3xl font-semibold leading-tight text-ink">
                            {eventFunction.name}
                          </h3>
                          <p className="mt-3 font-display-serif text-base italic text-ink-muted">
                            {formatDate(eventFunction.date)}
                            {eventFunction.start_time
                              ? ` · ${formatTime12Hour(eventFunction.start_time)}`
                              : ""}
                          </p>
                          <p className="mt-2 break-words text-base text-ink-muted">
                            {event.venue}
                          </p>
                          <span className="mt-4 inline-block text-sm font-semibold text-brand-strong">
                            Details
                          </span>
                        </CardFrame>
                      </summary>
                      <div className="space-y-3 border-t border-border px-5 py-4">
                        <p className="text-base text-ink-muted">
                          <time dateTime={`${eventFunction.date}${eventFunction.start_time ? `T${eventFunction.start_time}` : ""}`}>
                            {formatDate(eventFunction.date)}
                            {eventFunction.start_time
                              ? ` at ${formatTime12Hour(eventFunction.start_time)}`
                              : ""}
                          </time>
                        </p>
                        {mapUrl && (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center font-semibold text-brand-strong underline underline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                          >
                            Open in Maps
                          </a>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-base text-ink-muted">
                Function details will be shared here when available.
              </p>
            )}
          </section>

          <section aria-label="Event actions" className="border-t border-border pt-7">
            <SharedEventActions
              name={event.name}
              date={event.date}
              venue={event.venue}
              functions={event.functions}
            />
          </section>
        </div>
        <LinkGateway />
      </main>
    </>
  );
}
