import Link from "next/link";
import { getAdminEvents, getAdminEnquiries } from "@/lib/admin/data";
import { formatINRDecimal } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [events, enquiries] = await Promise.all([
    getAdminEvents(),
    getAdminEnquiries(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter(
    (event) =>
      event.date >= today &&
      event.status !== "completed" &&
      event.status !== "cancelled"
  );
  const pendingItemsCount = events.reduce((acc, curr) => acc + (curr.pending_items || 0), 0);
  const totalAgreedPaise = events.reduce(
    (sum, event) => sum + Math.round((event.budget_total ?? 0) * 100),
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

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            Operations &amp; Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
            Admin Dashboard
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-accent text-accent-ink rounded-radius-md font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[44px]"
          >
            + Create Event
          </Link>
          <Link
            href="/admin/customers"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-surface border border-border text-ink rounded-radius-md font-medium text-sm hover:border-accent hover:text-accent transition-colors min-h-[44px]"
          >
            + Add Customer
          </Link>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Upcoming Events
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-ink">
              {upcomingEvents.length}
            </span>
            <span className="text-xs font-medium text-success bg-success-light px-2 py-0.5 rounded-radius-full">
              Active
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Next event on {upcomingEvents[0]?.date || "TBD"}</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Pending Items
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-warning">
              {pendingItemsCount}
            </span>
            <span className="text-xs font-medium text-warning bg-warning-light px-2 py-0.5 rounded-radius-full">
              Needs Action
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Across vendor categories</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Payments Due
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-ink">
              {formatINRDecimal(totalDuePaise / 100)}
            </span>
            <span className="text-xs font-medium text-accent bg-accent-light px-2 py-0.5 rounded-radius-full">
              {formatINRDecimal(totalPaidPaise / 100)} Paid
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Agreed Total: {formatINRDecimal(totalAgreedPaise / 100)}</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            New Enquiries
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-ink">
              {enquiries.length}
            </span>
            <span className="text-xs font-medium text-ink bg-bg px-2 py-0.5 rounded-radius-full border border-border">
              Contact Form
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Unanswered leads</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Events & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Events (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-ink">
              Active Events Schedule
            </h2>
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View All ({events.length})
            </Link>
          </div>

          <div className="space-y-4">
            {events.map((event) => {
              const statusColors = {
                planning: "bg-warning-light text-warning border-warning/30",
                finalized: "bg-success-light text-success border-success/30",
                completed: "bg-bg text-ink-muted border-border",
                cancelled: "bg-danger-light text-danger border-danger/30",
              }[event.status];

              return (
                <div
                  key={event.id}
                  className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:border-accent/40"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase font-semibold text-accent tracking-wider">
                        {event.type}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-radius-full border ${statusColors}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-heading font-bold text-lg text-ink hover:text-accent transition-colors block"
                    >
                      {event.name}
                    </Link>
                    <div className="text-xs text-ink-muted flex items-center gap-4 flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-surface border border-border text-ink hover:border-accent hover:text-accent font-semibold text-xs rounded-radius-md transition-colors min-h-[44px]"
                    >
                      Manage Event →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: New Enquiries (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-ink">
              Recent Enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-accent hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {enquiries.slice(0, 3).map((enq) => (
              <div
                key={enq.id}
                className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                    {enq.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-accent px-1.5 py-0.5 rounded-radius-sm bg-accent-light">
                    {enq.event_type}
                  </span>
                </div>
                <p className="text-xs text-ink-muted line-clamp-2">
                  &ldquo;{enq.message}&rdquo;
                </p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-ink-muted font-mono">{enq.phone}</span>
                  <a
                    href={`https://wa.me/${enq.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-success hover:underline flex items-center gap-1"
                  >
                    Reply WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
