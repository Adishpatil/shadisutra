import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { clientSessionCookieName, hasValidClientSession } from "@/lib/events/client-link-access";
import { getActiveClientLink, getClientShareView } from "@/lib/events/client-share";
import { formatDate, formatDateTimeKolkata, formatTime12Hour } from "@/lib/date-time";
import { formatINRDecimal } from "@/lib/format";
import { CardFrame } from "@/components/ui/CardFrame";
import { LinkGateway } from "@/components/ui/LinkGateway";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Private Client Event Details",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

const genericMessage = "This link or PIN is invalid. Check the details or contact your event organizer.";

function formatTimelineTime(value: string) {
  return formatDateTimeKolkata(value).replace(/\b(am|pm)\b/i, (period) =>
    period.toUpperCase()
  );
}

function ClientGate({ token, pinRequired, invalid }: { token: string; pinRequired: boolean; invalid: boolean }) {
  const unavailable = invalid && !pinRequired;

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <main id="main-content" className="min-h-[100dvh] bg-bg">
        <header className="flex justify-end bg-brand px-5 pb-4 pt-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-base font-semibold text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Visit Shadi Sutra
          </Link>
        </header>
        <section className="bg-brand px-4 pb-12 sm:px-8 sm:pb-16">
          <div className="invitation-card-shell mx-auto max-w-xl">
            <article className="ticket-card invitation-card">
              <CardFrame className="min-h-72 px-6 pb-8 pt-24 text-center sm:px-12">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  Private client invitation
                </p>
                <h1 className="mt-2 font-heading text-3xl font-semibold text-ink sm:text-4xl">
                  Your event details
                </h1>
                <p className="mt-4 text-base leading-relaxed text-ink-muted">
                  {unavailable
                    ? "This client link may have expired or been updated. Contact Shadi Sutra for help."
                    : "Enter the details shared by your event organizer to continue."}
                </p>
              </CardFrame>
            </article>
          </div>
          {!unavailable && (
            <form
              method="post"
              action={`/api/c/${token}/session`}
              className="mx-auto mt-5 w-full max-w-xl rounded-2xl border border-border bg-surface p-5 sm:p-6"
            >
              {invalid && (
                <p role="alert" className="mb-4 rounded-xl bg-danger-light p-3 text-base text-danger">
                  {genericMessage}
                </p>
              )}
              {pinRequired && (
                <div>
                  <label htmlFor="client-pin" className="mb-1 block text-base font-semibold text-ink">
                    Client PIN
                  </label>
                  <input
                    autoComplete="one-time-code"
                    id="client-pin"
                    name="pin"
                    inputMode="numeric"
                    pattern="[0-9]{4,6}"
                    minLength={4}
                    maxLength={6}
                    required
                    className="min-h-12 w-full rounded-xl border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  />
                </div>
              )}
              <button
                type="submit"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-bg transition-colors hover:bg-brand hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {pinRequired ? "Continue" : "View event details"}
              </button>
            </form>
          )}
        </section>
        <LinkGateway />
      </main>
    </>
  );
}

export default async function ClientEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ invalid?: string }>;
}) {
  const [{ token }, query, cookieStore] = await Promise.all([params, searchParams, cookies()]);
  const link = await getActiveClientLink(token);
  if (!link) return <ClientGate token={token} pinRequired={false} invalid={true} />;

  const authenticated = hasValidClientSession(
    token,
    cookieStore.get(clientSessionCookieName(token))?.value,
    link.expires_at
  );
  if (!authenticated) {
    return <ClientGate token={token} pinRequired={Boolean(link.pin_hash)} invalid={query.invalid === "1"} />;
  }

  const view = await getClientShareView(link);
  if (!view) return <ClientGate token={token} pinRequired={false} invalid={true} />;

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
                Private client event
              </p>
              <h1 className="mt-3 break-words font-heading text-[clamp(2.5rem,9vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
                {view.event.name}
              </h1>
              <div className="mt-5 space-y-1 font-display-serif text-base italic leading-relaxed text-ink-muted sm:text-lg">
                <p>
                  <time dateTime={view.event.date}>{formatDate(view.event.date)}</time>
                </p>
                <p className="break-words">{view.event.venue}</p>
              </div>
            </CardFrame>
          </article>
        </div>
      </section>
      <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">

        <section aria-labelledby="client-functions-title">
          <h2 id="client-functions-title" className="font-heading text-2xl font-bold">Functions</h2>
          {view.functions.length ? (
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {view.functions.map((item) => (
                <li key={item.id} className="p-4">
                  <details>
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                      {item.name}
                      <span className="text-sm font-normal text-ink-muted">Details</span>
                    </summary>
                    <p className="pt-2 text-base text-ink-muted">
                      {formatDate(item.date)}{item.start_time ? ` at ${formatTime12Hour(item.start_time)}` : ""}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-base text-ink-muted">Function details will be shared here when available.</p>}
        </section>

        <section aria-labelledby="client-timeline-title">
          <h2 id="client-timeline-title" className="font-heading text-2xl font-bold">Timeline</h2>
          {view.timeline.length ? (
            <ol className="mt-3 space-y-3">
              {view.timeline.map((item, index) => (
                <li key={`${item.starts_at}-${index}`} className="home-reveal rounded-2xl border border-border bg-surface p-4">
                  <time dateTime={item.starts_at} className="text-base font-semibold text-ink">{formatTimelineTime(item.starts_at)}</time>
                  <p className="mt-1 break-words text-base">{item.title}</p>
                </li>
              ))}
            </ol>
          ) : <p className="mt-2 text-base text-ink-muted">The schedule will be shared here when available.</p>}
        </section>

        <section aria-labelledby="client-items-title">
          <h2 id="client-items-title" className="font-heading text-2xl font-bold">Item status</h2>
          {view.items.length ? (
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {view.items.map((item) => (
                <li key={item.id} className="flex min-h-14 items-center justify-between gap-3 p-4">
                  <span className="break-words">{item.title}</span>
                  <span className="shrink-0 rounded-full border border-border px-3 py-1 text-sm font-semibold capitalize text-ink">{item.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-base text-ink-muted">Item updates will appear here when available.</p>}
        </section>

        {view.designs.length > 0 && (
          <section aria-labelledby="client-designs-title">
            <h2 id="client-designs-title" className="font-heading text-2xl font-bold">Finalized designs</h2>
            <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {view.designs.map((design) => (
                <li key={design.id} className="flex min-w-[85%] snap-center flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-4 sm:min-w-[min(24rem,50%)]">
                  <p className="font-medium">{design.title}, Version {design.version}</p>
                  <a href={design.url} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 text-base font-semibold text-ink transition-colors hover:bg-ink/5">
                    View design
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="client-guests-title">
          <h2 id="client-guests-title" className="font-heading text-2xl font-bold">Guest list</h2>
          {view.guests.length ? (
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {view.guests.map((guest, index) => (
                <li key={`${guest.name}-${index}`} className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 text-base sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                  <span className="break-words font-semibold">{guest.name}</span>
                  <span>{guest.party_size} {guest.party_size === 1 ? "guest" : "guests"}</span>
                  <span className="capitalize">{guest.rsvp}</span>
                  <span>{guest.table_no ? `Table ${guest.table_no}` : "No table"}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-base text-ink-muted">Guest details will appear here when available.</p>}
        </section>

        {view.payments && (
          <section aria-labelledby="client-payments-title">
            <h2 id="client-payments-title" className="font-heading text-2xl font-bold">Payment summary</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="text-sm text-ink-muted">Agreed total</dt>
                <dd className="mt-1 text-lg font-semibold">{formatINRDecimal(view.payments.agreed_total / 100)}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <dt className="text-sm text-ink-muted">Received</dt>
                <dd className="mt-1 text-lg font-semibold">{formatINRDecimal(view.payments.total_received / 100)}</dd>
              </div>
            </dl>
            <h3 className="mt-5 font-semibold">Payment history</h3>
            {view.payments.history.length ? (
              <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface">
                {view.payments.history.map((payment, index) => (
                  <li key={`${payment.paid_on}-${index}`} className="flex min-h-14 items-center justify-between gap-3 p-4">
                    <span>{formatDate(payment.paid_on)}, {payment.mode}</span>
                    <span className="font-semibold">{formatINRDecimal(payment.amount / 100)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-base text-ink-muted">No payments have been recorded yet.</p>}
          </section>
        )}
      </article>
      <LinkGateway />
    </main>
    </>
  );
}
