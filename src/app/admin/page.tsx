import Link from "next/link";
import { getAdminEvents, getAdminEnquiries } from "@/lib/admin/data";

export default async function AdminDashboardPage() {
  const [events, enquiries] = await Promise.all([
    getAdminEvents(),
    getAdminEnquiries(),
  ]);

  const upcomingEvents = events.filter((e) => e.status !== "completed" && e.status !== "cancelled");
  const pendingItemsCount = events.reduce((acc, curr) => acc + (curr.pending_items || 0), 0);
  const totalAgreed = events.reduce((acc, curr) => acc + (curr.budget_total || 0), 0);
  const totalPaid = events.reduce((acc, curr) => acc + (curr.total_paid || 0), 0);
  const totalDue = Math.max(0, totalAgreed - totalPaid);

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
              ₹{(totalDue / 1000).toFixed(0)}k
            </span>
            <span className="text-xs font-medium text-accent bg-accent-light px-2 py-0.5 rounded-radius-full">
              ₹{(totalPaid / 1000).toFixed(0)}k Paid
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Agreed Total: ₹{(totalAgreed / 1000).toFixed(0)}k</p>
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
                      {event.show_payments_to_customer && (
                        <span className="text-[10px] text-ink-muted bg-bg px-2 py-0.5 rounded-radius-full border border-border">
                          Portal: Payments Visible
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-heading font-bold text-lg text-ink hover:text-accent transition-colors block"
                    >
                      {event.name}
                    </Link>
                    <div className="text-xs text-ink-muted flex items-center gap-4 flex-wrap">
                      <span>📅 {event.date}</span>
                      <span>📍 {event.venue}</span>
                      <span>👤 {event.customer_name}</span>
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
