import type { Metadata } from "next";
import { cookies } from "next/headers";
import { clientSessionCookieName, hasValidClientSession } from "@/lib/events/client-link-access";
import { getActiveClientLink, getClientShareView } from "@/lib/events/client-share";
import { formatDate, formatDateTimeKolkata, formatTime12Hour } from "@/lib/date-time";
import { formatINRDecimal } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Private Client Event Details",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

const genericMessage = "This link or PIN is invalid. Check the details or contact your event organizer.";

function ClientGate({ token, pinRequired, invalid }: { token: string; pinRequired: boolean; invalid: boolean }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-bg px-4 py-10">
      <section className="w-full max-w-md rounded-radius-lg border border-border bg-surface p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 className="font-heading text-3xl font-bold text-ink">Private client link</h1>
        <p className="mt-3 text-base text-ink-muted">
          {pinRequired ? "Enter the PIN shared by your event organizer." : "Continue to view your private event details."}
        </p>
        {invalid && <p role="alert" className="mt-4 rounded-radius-md bg-danger-light p-3 text-base text-danger">{genericMessage}</p>}
        <form method="post" action={`/api/c/${token}/session`} className="mt-6 space-y-4">
          {pinRequired && (
            <div>
              <label htmlFor="client-pin" className="mb-1 block text-base font-semibold text-ink">Client PIN</label>
              <input
                autoComplete="one-time-code"
                id="client-pin"
                name="pin"
                inputMode="numeric"
                pattern="[0-9]{4,6}"
                minLength={4}
                maxLength={6}
                required
                className="min-h-12 w-full rounded-radius-md border border-border-strong bg-surface px-3 text-base text-ink"
              />
            </div>
          )}
          <button type="submit" className="min-h-12 w-full rounded-radius-md bg-accent px-5 text-base font-semibold text-accent-ink hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {pinRequired ? "Continue" : "View event details"}
          </button>
        </form>
      </section>
    </main>
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
    <main className="min-h-[100dvh] bg-bg px-4 py-8 text-ink sm:px-6 sm:py-12">
      <article className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-border pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Shadi Sutra · Client event details</p>
          <h1 className="break-words font-heading text-3xl font-bold sm:text-4xl">{view.event.name}</h1>
          <dl className="grid gap-3 text-base sm:grid-cols-2">
            <div><dt className="font-semibold">Date</dt><dd><time dateTime={view.event.date}>{formatDate(view.event.date)}</time></dd></div>
            <div><dt className="font-semibold">Venue</dt><dd className="break-words">{view.event.venue}</dd></div>
          </dl>
        </header>

        <section aria-labelledby="client-functions-title">
          <h2 id="client-functions-title" className="font-heading text-2xl font-bold">Functions</h2>
          {view.functions.length ? (
            <ul className="mt-3 divide-y divide-border rounded-radius-md border border-border bg-surface">
              {view.functions.map((item) => (
                <li key={item.id} className="p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-1 text-base text-ink-muted">
                    {formatDate(item.date)}{item.start_time ? ` · ${formatTime12Hour(item.start_time)}` : ""}
                  </p>
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
                <li key={`${item.starts_at}-${index}`} className="rounded-radius-md border border-border bg-surface p-4">
                  <time dateTime={item.starts_at} className="text-base font-semibold text-accent">{formatDateTimeKolkata(item.starts_at)}</time>
                  <p className="mt-1 break-words text-base">{item.title}</p>
                </li>
              ))}
            </ol>
          ) : <p className="mt-2 text-base text-ink-muted">The schedule will be shared here when available.</p>}
        </section>

        <section aria-labelledby="client-items-title">
          <h2 id="client-items-title" className="font-heading text-2xl font-bold">Item status</h2>
          {view.items.length ? (
            <ul className="mt-3 divide-y divide-border rounded-radius-md border border-border bg-surface">
              {view.items.map((item) => (
                <li key={item.id} className="flex min-h-14 items-center justify-between gap-3 p-4">
                  <span className="break-words">{item.title}</span>
                  <span className="shrink-0 rounded-radius-full bg-accent-light px-3 py-1 text-sm font-semibold capitalize text-ink">{item.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-base text-ink-muted">Item updates will appear here when available.</p>}
        </section>

        {view.designs.length > 0 && (
          <section aria-labelledby="client-designs-title">
            <h2 id="client-designs-title" className="font-heading text-2xl font-bold">Finalized designs</h2>
            <ul className="mt-3 space-y-3">
              {view.designs.map((design) => (
                <li key={design.id} className="flex flex-col justify-between gap-3 rounded-radius-md border border-border bg-surface p-4 sm:flex-row sm:items-center">
                  <p className="font-medium">{design.title} · Version {design.version}</p>
                  <a href={design.url} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center justify-center rounded-radius-md border border-accent px-4 text-base font-semibold text-accent hover:bg-accent hover:text-accent-ink">
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
            <ul className="mt-3 divide-y divide-border rounded-radius-md border border-border bg-surface">
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
              <div className="rounded-radius-md border border-border bg-surface p-4">
                <dt className="text-sm text-ink-muted">Agreed total</dt>
                <dd className="mt-1 text-lg font-semibold">{formatINRDecimal(view.payments.agreed_total / 100)}</dd>
              </div>
              <div className="rounded-radius-md border border-border bg-surface p-4">
                <dt className="text-sm text-ink-muted">Received</dt>
                <dd className="mt-1 text-lg font-semibold">{formatINRDecimal(view.payments.total_received / 100)}</dd>
              </div>
            </dl>
            <h3 className="mt-5 font-semibold">Payment history</h3>
            {view.payments.history.length ? (
              <ul className="mt-2 divide-y divide-border rounded-radius-md border border-border bg-surface">
                {view.payments.history.map((payment, index) => (
                  <li key={`${payment.paid_on}-${index}`} className="flex min-h-14 items-center justify-between gap-3 p-4">
                    <span>{formatDate(payment.paid_on)} · {payment.mode}</span>
                    <span className="font-semibold">{formatINRDecimal(payment.amount / 100)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-base text-ink-muted">No payments have been recorded yet.</p>}
          </section>
        )}
      </article>
    </main>
  );
}
