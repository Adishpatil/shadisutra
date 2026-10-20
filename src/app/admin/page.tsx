import Link from "next/link";
import { getAdminEvents, getAdminEnquiries } from "@/lib/admin/data";
import { formatINRDecimal } from "@/lib/format";
import { Badge, Card, EmptyState } from "@/components/ui/AdminPrimitives";

export default async function AdminDashboardPage() {
  const [events, enquiries] = await Promise.all([
    getAdminEvents(),
    getAdminEnquiries(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter(
      (event) =>
        event.date >= today &&
        event.status !== "completed" &&
        event.status !== "cancelled"
    )
    .sort((left, right) => left.date.localeCompare(right.date));
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
    },
    {
      label: "Payments due",
      value: formatINRDecimal(totalDuePaise / 100),
      note: `${formatINRDecimal(totalPaidPaise / 100)} received`,
      variant: "warning" as const,
    },
    {
      label: "Pending items",
      value: String(pendingItemsCount),
      note: "Across all events",
      variant: pendingItemsCount ? ("warning" as const) : ("success" as const),
    },
    {
      label: "New enquiries",
      value: String(enquiries.length),
      note: "Contact form submissions",
      variant: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Dashboard</h1>
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="min-w-0 p-4 sm:p-5">
            <p className="text-base font-semibold text-ink-muted">{metric.label}</p>
            <p className="mt-2 break-words font-heading text-2xl font-bold text-ink sm:text-3xl">
              {metric.value}
            </p>
            <Badge variant={metric.variant} className="mt-3">
              {metric.note}
            </Badge>
          </Card>
        ))}
      </section>

      <section aria-labelledby="next-up-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold uppercase tracking-wider text-accent">
              Schedule
            </p>
            <h2 id="next-up-heading" className="mt-1 text-2xl font-heading font-bold text-ink">
              Next up
            </h2>
          </div>
          <Link
            href="/admin/events"
            className="inline-flex min-h-11 items-center px-2 text-base font-semibold text-accent underline underline-offset-4"
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
                className="inline-flex min-h-11 items-center justify-center rounded-radius-md bg-accent px-5 text-base font-semibold text-accent-ink"
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

              return (
                <Card key={event.id} className="p-4 sm:p-5">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="block rounded-radius-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
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
                      <span>
                        Balance due:{" "}
                        <strong className="font-semibold text-ink">
                          {formatINRDecimal(balanceDue / 100)}
                        </strong>
                      </span>
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
