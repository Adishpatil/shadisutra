"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AdminEventSummary } from "@/lib/admin/data";
import { updateEventStatusAction } from "@/lib/admin/event-actions";
import { formatINRDecimal } from "@/lib/format";
import { Badge, Card, EmptyState } from "@/components/ui/AdminPrimitives";

interface EventsViewClientProps {
  initialEvents: AdminEventSummary[];
}

const statuses = ["all", "planning", "finalized", "completed", "cancelled"] as const;

export function EventsViewClient({ initialEvents }: EventsViewClientProps) {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState(initialEvents);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [quickAction, setQuickAction] = useState<string | null>(() => {
    const action = searchParams.get("quick");
    return ["payment", "expense", "guest", "share"].includes(action ?? "")
      ? action
      : null;
  });

  useEffect(() => {
    const handleQuickAction = (event: Event) => {
      const action = (event as CustomEvent<string>).detail;
      if (["payment", "expense", "guest", "share"].includes(action)) {
        setQuickAction(action);
      }
    };
    window.addEventListener("admin:quick-action", handleQuickAction);
    return () => window.removeEventListener("admin:quick-action", handleQuickAction);
  }, []);

  const eventHref = (eventId: string) =>
    `/admin/events/${eventId}${quickAction ? `?quick=${quickAction}` : ""}`;

  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [event.name, event.venue, event.type].some((value) =>
        value.toLowerCase().includes(query)
      );
    return matchesStatus && matchesSearch;
  });
  const groupedEvents = filteredEvents.reduce<Record<string, AdminEventSummary[]>>(
    (groups, event) => {
      const [year, month] = event.date.split("-").map(Number);
      const monthLabel = year && month
        ? new Intl.DateTimeFormat("en-IN", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(year, month - 1, 1)))
        : "Date not set";
      (groups[monthLabel] ??= []).push(event);
      return groups;
    },
    {}
  );

  const handleStatusChange = async (
    eventId: string,
    newStatus: "planning" | "finalized" | "completed" | "cancelled"
  ) => {
    const result = await updateEventStatusAction(eventId, newStatus);
    if (!result.success) {
      alert(`Could not update event status: ${result.error}`);
      return;
    }
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, status: newStatus } : event
      )
    );
  };

  const statusVariant = {
    planning: "warning",
    finalized: "success",
    completed: "neutral",
    cancelled: "danger",
  } as const;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-brand-strong">
          Planning &amp; staging
        </p>
        <h1 className="mt-1 text-3xl font-heading font-bold text-ink">
          Events
        </h1>
        <p className="mt-2 text-base text-ink-muted">
          Search and manage your events, plans and vendors.
        </p>
        {quickAction && (
          <p role="status" className="mt-4 rounded-xl border border-border bg-surface p-4 text-base text-ink">
            Choose an event to continue with {quickAction === "share" ? "sharing" : `the ${quickAction}`} action.
          </p>
        )}
      </header>

      <label className="block">
        <span className="sr-only">Search events</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search events or venues"
          className="min-h-11 w-full rounded-radius-md border border-border bg-surface px-4 text-base text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </label>

      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" aria-label="Filter events by status">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filterStatus === status}
            onClick={() => setFilterStatus(status)}
            className={`min-h-11 shrink-0 rounded-radius-full px-4 text-base font-semibold capitalize ${
              filterStatus === status
                ? "bg-ink text-white"
                : "bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-3 lg:hidden">
        {Object.entries(groupedEvents).map(([month, monthEvents]) => (
          <section key={month} aria-label={month} className="space-y-3">
          <h2 className="pt-2 font-heading text-lg font-semibold text-ink">{month}</h2>
          {monthEvents.map((event) => {
          const balanceDue = Math.max(
            0,
            Math.round((event.budget_total ?? 0) * 100) -
              Math.round((event.total_paid ?? 0) * 100)
          );

          return (
            <Card key={event.id} className="space-y-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-strong">
                    {event.type}
                  </p>
                  <Link
                    href={eventHref(event.id)}
                    className="mt-1 block break-words text-xl font-heading font-bold text-ink focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    {event.name}
                  </Link>
                </div>
                <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
              </div>
              <dl className="space-y-2 text-base text-ink-muted">
                <div className="flex justify-between gap-3">
                  <dt>Date</dt>
                  <dd className="text-right text-ink">{event.date}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Venue</dt>
                  <dd className="max-w-[65%] text-right text-ink">{event.venue}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Balance due</dt>
                  <dd className="text-right font-semibold text-ink">
                    {formatINRDecimal(balanceDue / 100)}
                  </dd>
                </div>
              </dl>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <label className="sr-only" htmlFor={`event-status-${event.id}`}>
                  Change status for {event.name}
                </label>
                <select
                  id={`event-status-${event.id}`}
                  value={event.status}
                  onChange={(e) =>
                    handleStatusChange(
                      event.id,
                      e.target.value as "planning" | "finalized" | "completed" | "cancelled"
                    )
                  }
                  className="min-h-11 min-w-0 rounded-radius-md border border-border bg-bg px-3 text-base text-ink"
                >
                  <option value="planning">Planning</option>
                  <option value="finalized">Finalized</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Link
                  href={eventHref(event.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-radius-md bg-brand-strong px-4 text-base font-semibold text-bg"
                >
                  Open event
                </Link>
              </div>
            </Card>
          );
          })}
          </section>
        ))}
        {filteredEvents.length === 0 && (
          <EmptyState
            title={search ? "No matching events" : "No events in this status"}
            description="Try another search or status filter."
          />
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-radius-lg bg-surface shadow-[var(--shadow-sm)] lg:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-border text-base font-semibold text-ink-muted">
              <th className="p-4">Event</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Status</th>
              <th className="p-4">Balance due</th>
              <th className="p-4">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(groupedEvents).map(([month, monthEvents]) => (
              <Fragment key={month}>
              <tr className="bg-bg">
                <th scope="rowgroup" colSpan={7} className="px-4 py-2 text-sm font-semibold text-ink-muted">{month}</th>
              </tr>
              {monthEvents.map((event) => {
              const balanceDue = Math.max(
                0,
                Math.round((event.budget_total ?? 0) * 100) -
                  Math.round((event.total_paid ?? 0) * 100)
              );
              return (
                <tr key={event.id}>
                  <td className="p-4 font-semibold text-ink">
                    <Link href={eventHref(event.id)} className="hover:text-brand-strong">
                      {event.name}
                    </Link>
                  </td>
                  <td className="p-4 capitalize text-ink-muted">{event.type}</td>
                  <td className="p-4 text-ink-muted">{event.date}</td>
                  <td className="p-4 text-ink-muted">{event.venue}</td>
                  <td className="p-4">
                    <label className="sr-only" htmlFor={`event-status-wide-${event.id}`}>
                      Change status for {event.name}
                    </label>
                    <select
                      id={`event-status-wide-${event.id}`}
                      value={event.status}
                      onChange={(e) =>
                        handleStatusChange(
                          event.id,
                          e.target.value as "planning" | "finalized" | "completed" | "cancelled"
                        )
                      }
                      className="min-h-11 rounded-radius-md border border-border bg-bg px-3 text-base text-ink"
                    >
                      <option value="planning">Planning</option>
                      <option value="finalized">Finalized</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 font-semibold text-ink">
                    {formatINRDecimal(balanceDue / 100)}
                  </td>
                  <td className="p-4">
                    <Link
                      href={eventHref(event.id)}
                      className="inline-flex min-h-11 items-center rounded-radius-md px-4 font-semibold text-brand-strong hover:bg-brand-soft"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
              })}
              </Fragment>
            ))}
          </tbody>
        </table>
        {filteredEvents.length === 0 && (
          <EmptyState title={search ? "No matching events" : "No events in this status"} />
        )}
      </div>

    </div>
  );
}
