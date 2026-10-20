import type { Metadata } from "next";
import { headers } from "next/headers";
import { site } from "@/config/site";
import { getPublicSharedEvent } from "@/lib/events/public-share";

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
    <main id="main-content" className="flex min-h-[100dvh] items-center justify-center bg-bg px-4 py-10">
      <section
        aria-labelledby="invalid-link-title"
        className="w-full max-w-lg rounded-radius-lg border border-border bg-surface p-6 text-center shadow-[var(--shadow-sm)] sm:p-10"
      >
        <h1
          id="invalid-link-title"
          className="font-heading text-3xl font-bold text-ink"
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
    <main id="main-content" className="min-h-[100dvh] bg-bg px-4 py-8 text-ink sm:px-6 sm:py-12">
      <article className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-border pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Shadi Sutra · Event details
          </p>
          <h1 className="break-words font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {event.name}
          </h1>
          <dl className="grid gap-3 text-base sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Date</dt>
              <dd>
                <time dateTime={event.date}>
                  {new Date(`${event.date}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { dateStyle: "long" }
                  )}
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
            <ul className="mt-3 divide-y divide-border rounded-radius-md border border-border bg-surface">
              {event.functions.map((eventFunction, index) => (
                <li key={`${eventFunction.date}-${eventFunction.name}-${index}`} className="p-4">
                  <h3 className="font-semibold">{eventFunction.name}</h3>
                  <p className="mt-1 text-base text-ink-muted">
                    <time dateTime={`${eventFunction.date}${eventFunction.start_time ? `T${eventFunction.start_time}` : ""}`}>
                      {new Date(`${eventFunction.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "medium" }
                      )}
                      {eventFunction.start_time
                        ? ` · ${eventFunction.start_time.slice(0, 5)}`
                        : ""}
                    </time>
                  </p>
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
                  className="rounded-radius-md border border-border bg-surface p-4"
                >
                  <time
                    dateTime={entry.starts_at}
                    className="text-base font-semibold text-accent"
                  >
                    {new Date(entry.starts_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
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

        {event.designs.length > 0 && (
          <section aria-labelledby="designs-title">
            <h2 id="designs-title" className="font-heading text-2xl font-bold">
              Finalized designs
            </h2>
            <ul className="mt-3 space-y-3">
              {event.designs.map((design, index) => (
                <li
                  key={`${design.title}-${design.version}-${index}`}
                  className="flex flex-col justify-between gap-3 rounded-radius-md border border-border bg-surface p-4 sm:flex-row sm:items-center"
                >
                  <p className="font-medium">
                    {design.title} · Version {design.version}
                  </p>
                  <a
                    href={design.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-radius-md border border-accent px-4 text-base font-semibold text-accent hover:bg-accent hover:text-accent-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    View design
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
    </>
  );
}
