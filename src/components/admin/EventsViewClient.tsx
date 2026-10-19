"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminEventSummary } from "@/lib/admin/data";
import { CreateEventModal } from "@/components/admin/CreateEventModal";
import { QRCodeModal } from "@/components/admin/QRCodeModal";
import { updateEventStatusAction } from "@/lib/admin/event-actions";

interface EventsViewClientProps {
  initialEvents: AdminEventSummary[];
  customers: { id: string; name: string }[];
}

export function EventsViewClient({
  initialEvents,
  customers,
}: EventsViewClientProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQrEvent, setSelectedQrEvent] = useState<AdminEventSummary | null>(null);

  const filteredEvents =
    filterStatus === "all"
      ? events
      : events.filter((e) => e.status === filterStatus);

  const handleStatusChange = async (
    eventId: string,
    newStatus: "planning" | "finalized" | "completed" | "cancelled"
  ) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
    );
    await updateEventStatusAction(eventId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            Planning &amp; Staging
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
            Events Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Track active productions, sub-events, vendors, and items across all client functions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-ink rounded-radius-md font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {["all", "planning", "finalized", "completed", "cancelled"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-radius-full text-xs font-semibold capitalize transition-all min-h-[36px] ${
              filterStatus === st
                ? "bg-accent text-accent-ink shadow-[var(--shadow-sm)]"
                : "bg-surface border border-border text-ink-muted hover:text-ink"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* 1. Desktop & Tablet Table (Hidden below 768px) */}
      <div className="hidden md:block overflow-x-auto bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/50 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <th className="py-3.5 px-4">Event Name</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Target Date</th>
              <th className="py-3.5 px-4">Venue</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEvents.map((ev) => (
              <tr key={ev.id} className="hover:bg-bg/40 transition-colors">
                <td className="py-4 px-4 font-semibold text-ink">
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="hover:text-accent transition-colors font-heading text-base"
                  >
                    {ev.name}
                  </Link>
                </td>
                <td className="py-4 px-4 uppercase text-xs font-bold text-accent">
                  <span className="px-2 py-0.5 rounded-radius-sm bg-accent/10 border border-accent/20">
                    {ev.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs font-mono text-ink-muted">
                  {ev.date}
                </td>
                <td className="py-4 px-4 text-xs text-ink-muted truncate max-w-xs">
                  {ev.venue}
                </td>
                <td className="py-4 px-4 text-xs text-ink font-medium">
                  {ev.customer_name || "Unassigned"}
                </td>
                <td className="py-4 px-4">
                  <select
                    value={ev.status}
                    onChange={(e) =>
                      handleStatusChange(ev.id, e.target.value as "planning" | "finalized" | "completed" | "cancelled")
                    }
                    className="text-xs font-semibold px-2.5 py-1 rounded-radius-md border border-border bg-bg text-ink focus:ring-1 focus:ring-accent"
                  >
                    <option value="planning">Planning</option>
                    <option value="finalized">Finalized</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQrEvent(ev)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border border-border text-ink hover:text-accent hover:border-accent rounded-radius-md transition-colors min-h-[36px]"
                    title="View QR Code"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>QR</span>
                  </button>
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold bg-accent text-accent-ink hover:bg-accent-hover rounded-radius-md transition-colors min-h-[36px]"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Stacked Cards (Visible only below 768px) */}
      <div className="md:hidden space-y-4">
        {filteredEvents.map((ev) => {
          const statusColors = {
            planning: "bg-warning-light text-warning border-warning/30",
            finalized: "bg-success-light text-success border-success/30",
            completed: "bg-bg text-ink-muted border-border",
            cancelled: "bg-danger-light text-danger border-danger/30",
          }[ev.status];

          return (
            <div
              key={ev.id}
              className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase font-bold text-accent tracking-wider">
                    {ev.type}
                  </span>
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="font-heading font-bold text-lg text-ink block mt-0.5"
                  >
                    {ev.name}
                  </Link>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-radius-full border shrink-0 ${statusColors}`}
                >
                  {ev.status}
                </span>
              </div>

              <div className="text-xs text-ink-muted space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Date:</strong> {ev.date}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span><strong>Venue:</strong> {ev.venue}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span><strong>Client:</strong> {ev.customer_name || "Unassigned"}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <select
                  value={ev.status}
                  onChange={(e) =>
                    handleStatusChange(ev.id, e.target.value as "planning" | "finalized" | "completed" | "cancelled")
                  }
                  className="text-xs font-semibold px-2 py-1.5 rounded-radius-md border border-border bg-bg text-ink"
                >
                  <option value="planning">Planning</option>
                  <option value="finalized">Finalized</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQrEvent(ev)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-border text-ink hover:text-accent rounded-radius-md text-xs font-semibold min-h-[44px]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>QR</span>
                  </button>
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-ink font-semibold text-xs rounded-radius-md min-h-[44px]"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <CreateEventModal
          customers={customers}
          onClose={() => setModalOpen(false)}
          onSuccess={(newEventId) => {
            setModalOpen(false);
            router.push(`/admin/events/${newEventId}`);
          }}
        />
      )}

      {selectedQrEvent && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setSelectedQrEvent(null)}
          eventId={selectedQrEvent.id}
          eventName={selectedQrEvent.name}
          eventStatus={selectedQrEvent.status}
        />
      )}
    </div>
  );
}
