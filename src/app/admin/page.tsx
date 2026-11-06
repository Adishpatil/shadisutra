import Link from "next/link";
import { getAdminEvents, getAdminEnquiries } from "@/lib/admin/data";
import { formatINRDecimal } from "@/lib/format";
import { Badge, Card, EmptyState } from "@/components/ui/AdminPrimitives";

export default async function AdminDashboardPage() {
  const [events, enquiries] = await Promise.all([
    getAdminEvents(),
    getAdminEnquiries(),
  ]);

  const todayDate = new Date();
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const today = dateKey(todayDate);
  const sevenDaysOut = new Date(todayDate);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
  const weekEnd = dateKey(sevenDaysOut);
  const upcomingEvents = events
    .filter(
      (event) =>
        event.date >= today &&
        event.status !== "completed" &&
        event.status !== "cancelled"
    )
    .sort((left, right) => left.date.localeCompare(right.date));
  const eventsThisWeek = upcomingEvents.filter((event) => event.date <= weekEnd);
  const pendingItemsCount = events.reduce(
    (acc, event) => acc + (event.pending_items || 0),
    0
  );
  const totalPaidPaise = events.reduce(
    (sum, event) => sum + Math.round((event.total_paid ?? 0) * 100),
    0
  );
  const totalDuePaise = events.reduce(
    (sum, event) =>
      sum +
      Math.max(
        0,
        Math.round((event.budget_total ?? 0) * 100) -
          Math.round((event.total_paid ?? 0) * 100)
      ),
    0
  );

  const metrics = [
    {
      label: "Upcoming events",
      value: String(upcomingEvents.length),
      note: "Events still to come",
      variant: "accent" as const,
      href: "/admin/events",
    },
    {
      label: "Payments due",
      value: formatINRDecimal(totalDuePaise / 100),
      note: `${formatINRDecimal(totalPaidPaise / 100)} received`,
      variant: "warning" as const,
      href: "/admin/money",
    },
    {
      label: "Pending items",
      value: String(pendingItemsCount),
      note: "Plan items still to finish",
      variant: pendingItemsCount ? ("warning" as const) : ("success" as const),
      href: "/admin/events",
    },
    {
      label: "New enquiries",
      value: String(enquiries.length),
      note: "Contact form submissions",
      variant: "neutral" as const,
      href: "/admin/enquiries",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="admin-page-heading">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Dashboard</h1>
        <Link
          href="/admin/events?quick=share"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Create or manage share links
        </Link>
      </header>
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="block min-w-0 rounded-radius-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
          <Card className="h-full min-w-0 p-4 transition-shadow hover:shadow-[var(--shadow-md)] sm:p-5">
            <p className="text-base font-semibold text-ink-muted">{metric.label}</p>
            <p className="mt-3 break-words font-heading text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
              {metric.value}
            </p>
            <Badge variant={metric.variant} className="mt-3">
              {metric.note}
            </Badge>
          </Card>
          </Link>
        ))}
      </section>

      <section aria-label="Events in the next seven days" className="space-y-3">
        <h2 className="font-heading text-2xl font-semibold text-ink">Next seven days</h2>
        {eventsThisWeek.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface p-4 text-base text-ink-muted">No events scheduled in the next seven days.</p>
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {eventsThisWeek.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="min-w-56 rounded-2xl border border-border bg-surface p-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span className="block text-sm font-semibold text-ink-muted">{event.date}</span>
                <span className="mt-1 block font-heading text-lg font-semibold text-ink">{event.name}</span>
                <span className="mt-1 block text-sm text-ink-muted">{event.venue}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="attention-heading" className="font-heading text-2xl font-semibold text-ink">Needs attention</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {upcomingEvents.filter((event) => (event.budget_total ?? 0) > (event.total_paid ?? 0)).length > 0 && (
            <Link href="/admin/money" className="admin-attention-card">
              <span className="font-semibold text-ink">Events with a balance due</span>
              <span className="text-sm text-ink-muted">
                {upcomingEvents.filter((event) => (event.budget_total ?? 0) > (event.total_paid ?? 0)).length} upcoming
              </span>
            </Link>
          )}
          {pendingItemsCount > 0 && (
            <Link href="/admin/events" className="admin-attention-card">
              <span className="font-semibold text-ink">Plan items to finish</span>
              <span className="text-sm text-ink-muted">{pendingItemsCount} across events</span>
            </Link>
          )}
          {enquiries.length > 0 && (
            <Link href="/admin/enquiries" className="admin-attention-card">
              <span className="font-semibold text-ink">Website enquiries</span>
              <span className="text-sm text-ink-muted">{enquiries.length} received</span>
            </Link>
          )}
          {upcomingEvents.length === 0 && pendingItemsCount === 0 && enquiries.length === 0 && (
            <p className="rounded-2xl border border-border bg-surface p-5 text-base text-ink-muted">Nothing needs attention right now.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="next-up-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-strong">
              Schedule
            </p>
            <h2 id="next-up-heading" className="mt-1 text-2xl font-heading font-bold text-ink">
              Next up
            </h2>
          </div>
          <Link
            href="/admin/events"
            className="inline-flex min-h-11 items-center px-2 text-base font-semibold text-brand-strong underline underline-offset-4"
          >
            All events
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <EmptyState
            title="Nothing scheduled yet"
            description="Create an event to add it to the upcoming schedule."
            action={
              <Link
                href="/admin/events"
                className="inline-flex min-h-11 items-center justify-center rounded-radius-md bg-brand-strong px-5 text-base font-semibold text-bg"
              >
                View events
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => {
              const balanceDue = Math.max(
                0,
                Math.round((event.budget_total ?? 0) * 100) -
                  Math.round((event.total_paid ?? 0) * 100)
              );
              const statusVariant = {
                planning: "warning",
                finalized: "success",
                completed: "neutral",
                cancelled: "danger",
              }[event.status] as "warning" | "success" | "neutral" | "danger";
              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(`${event.date}T00:00:00`).getTime() -
                    new Date().setHours(0, 0, 0, 0)) /
                    86_400_000
                )
              );
              const paymentProgress = event.budget_total
                ? Math.min(100, Math.round(((event.total_paid ?? 0) / event.budget_total) * 100))
                : 0;

              return (
                <Card key={event.id} className="p-4 sm:p-5">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="block rounded-radius-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-ink-muted">{event.date}</p>
                        <h3 className="mt-1 break-words text-xl font-heading font-bold text-ink">
                          {event.name}
                        </h3>
                      </div>
                      <Badge variant={statusVariant}>{event.status}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-base text-ink-muted">
                      <span className="break-words">{event.venue}</span>
                      <span>{daysLeft === 0 ? "Today" : `${daysLeft} days left`}</span>
                      <span>
                        Balance due:{" "}
                        <strong className="font-semibold text-ink">
                          {formatINRDecimal(balanceDue / 100)}
                        </strong>
                      </span>
                    </div>
                    <div className="mt-4">
                      <progress className="admin-progress w-full is-start" max={100} value={paymentProgress} aria-label={`Payment progress ${paymentProgress}%`} />
                      <p className="mt-1 text-sm text-ink-muted">{paymentProgress}% received</p>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
