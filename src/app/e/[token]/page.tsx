import type { Metadata } from "next";
import { headers } from "next/headers";
import { site } from "@/config/site";
import { getPublicSharedEvent } from "@/lib/events/public-share";
import { formatDate, formatDateTimeKolkata, formatTime12Hour } from "@/lib/date-time";

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
    <main id="main-content" className="flex min-h-[100dvh] items-center justify-center bg-bg px-5 py-10">
      <section
        aria-labelledby="invalid-link-title"
        className="w-full max-w-lg rounded-[24px] border border-border bg-surface p-6 text-center shadow-[var(--shadow-sm)] sm:p-10"
      >
        <h1
          id="invalid-link-title"
          className="text-3xl font-semibold text-ink"
        >
          Link not valid
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          This event link is invalid, expired, or revoked. Contact your event
          organizer for a current link.
        </p>
      </section>
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

  return (
    <>
    <a href="#main-content" className="skip-to-content">
      Skip to content
    </a>
    <main id="main-content" className="min-h-[100dvh] bg-bg px-4 py-6 text-ink sm:px-6 sm:py-10">
      <article className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-border pb-6">
          <p className="text-sm text-ink-muted">Event details</p>
          <h1 className="break-words text-[clamp(2rem,7vw,3rem)] font-semibold leading-tight tracking-[-0.035em]">
            {event.name}
          </h1>
          <dl className="grid gap-3 text-base sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Date</dt>
              <dd>
                <time dateTime={event.date}>
                  {formatDate(event.date)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Venue</dt>
              <dd className="break-words">{event.venue}</dd>
            </div>
          </dl>
        </header>

        <section aria-labelledby="functions-title">
          <h2 id="functions-title" className="font-heading text-2xl font-bold">
            Functions
          </h2>
          {event.functions.length ? (
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {event.functions.map((eventFunction, index) => (
                <li key={`${eventFunction.date}-${eventFunction.name}-${index}`} className="p-4">
                  <details>
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                      {eventFunction.name}
                      <span className="text-sm font-normal text-ink-muted">Details</span>
                    </summary>
                    <p className="pt-2 text-base text-ink-muted">
                      <time dateTime={`${eventFunction.date}${eventFunction.start_time ? `T${eventFunction.start_time}` : ""}`}>
                        {formatDate(eventFunction.date)}
                        {eventFunction.start_time
                          ? ` at ${formatTime12Hour(eventFunction.start_time)}`
                          : ""}
                      </time>
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-base text-ink-muted">
              Function details will be shared here when available.
            </p>
          )}
        </section>

        <section aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="font-heading text-2xl font-bold">
            Timeline
          </h2>
          {event.timeline.length ? (
            <ol className="mt-3 space-y-3">
              {event.timeline.map((entry, index) => (
                <li
                  key={`${entry.starts_at}-${entry.title}-${index}`}
                  className="home-reveal rounded-2xl border border-border bg-surface p-4"
                >
                  <time
                    dateTime={entry.starts_at}
                    className="text-base font-semibold text-ink"
                  >
                    {formatTimelineTime(entry.starts_at)}
                  </time>
                  <p className="mt-1 break-words text-base">{entry.title}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-base text-ink-muted">
              The schedule will be shared here when available.
            </p>
          )}
        </section>

      </article>
    </main>
    </>
  );
}
