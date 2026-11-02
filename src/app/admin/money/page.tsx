import Link from "next/link";
import { getAdminMoneyOverview } from "@/lib/admin/event-money-data";
import { formatDate } from "@/lib/date-time";
import { formatINRDecimal } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminMoneyOverviewPage() {
  const rows = await getAdminMoneyOverview();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold text-ink">Money overview</h1>
        <p className="mt-2 text-base text-ink-muted">Agreed amounts, client receipts, expenses and calculated profit by event.</p>
      </header>
      {rows.length ? (
        <>
          <div className="space-y-3 md:hidden">
            {rows.map((event) => (
              <article key={event.eventId} className="rounded-radius-lg border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
                <Link href={`/admin/events/${event.eventId}`} className="text-lg font-bold text-accent underline">{event.eventName}</Link>
                <p className="mt-1 text-sm text-ink-muted">{formatDate(event.eventDate)}</p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-ink-muted">Agreed</dt><dd className="font-semibold">{formatINRDecimal(event.agreedTotal / 100)}</dd></div>
                  <div><dt className="text-ink-muted">Received</dt><dd className="font-semibold">{formatINRDecimal(event.received / 100)}</dd></div>
                  <div><dt className="text-ink-muted">Expenses</dt><dd className="font-semibold">{formatINRDecimal(event.expenses / 100)}</dd></div>
                  <div><dt className="text-ink-muted">Profit</dt><dd className="font-semibold">{formatINRDecimal(event.profit / 100)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-radius-lg border border-border bg-surface md:block">
            <table className="w-full border-collapse text-left text-base">
              <thead className="bg-bg">
                <tr>{["Event", "Date", "Agreed", "Received", "Expenses", "Profit"].map((heading) => <th key={heading} scope="col" className="whitespace-nowrap border-b border-border px-4 py-3 font-semibold">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((event) => (
                  <tr key={event.eventId} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 font-semibold"><Link href={`/admin/events/${event.eventId}`} className="text-accent underline">{event.eventName}</Link></th>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(event.eventDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatINRDecimal(event.agreedTotal / 100)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatINRDecimal(event.received / 100)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatINRDecimal(event.expenses / 100)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatINRDecimal(event.profit / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <p className="rounded-radius-lg border border-border bg-surface p-6 text-base text-ink-muted">No events have been added yet.</p>}
    </div>
  );
}
