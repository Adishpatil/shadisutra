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
          className="inline-flex items-center justify-center px-5 py-2.5 bg-accent text-accent-ink rounded-radius-md font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[44px]"
        >
          + Create Event
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
                    className="hover:text-accent transition-colors"
                  >
                    {ev.name}
                  </Link>
                </td>
                <td className="py-4 px-4 uppercase text-xs font-bold text-accent">
                  {ev.type}
                </td>
                <td className="py-4 px-4 text-xs font-mono text-ink-muted">
                  {ev.date}
                </td>
                <td className="py-4 px-4 text-xs text-ink-muted truncate max-w-xs">
                  {ev.venue}
                </td>
                <td className="py-4 px-4 text-xs text-ink">
                  {ev.customer_name || "Unassigned"}
                </td>
                <td className="py-4 px-4">
                  <select
                    value={ev.status}
                    onChange={(e) =>
                      handleStatusChange(ev.id, e.target.value as "planning" | "finalized" | "completed" | "cancelled")
                    }
                    className="text-xs font-semibold px-2 py-1 rounded-radius-md border border-border bg-bg text-ink focus:ring-1 focus:ring-accent"
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
                    className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold border border-border text-ink hover:text-accent hover:border-accent rounded-radius-md transition-colors min-h-[36px]"
                    title="View QR Code"
                  >
                    📱 QR
                  </button>
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent-light rounded-radius-md transition-colors min-h-[36px]"
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
              className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-bold text-accent tracking-wider">
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

              <div className="text-xs text-ink-muted space-y-1">
                <p>📅 <strong>Date:</strong> {ev.date}</p>
                <p>📍 <strong>Venue:</strong> {ev.venue}</p>
                <p>👤 <strong>Client:</strong> {ev.customer_name || "Unassigned"}</p>
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
                    className="inline-flex items-center justify-center px-3 py-2 border border-border text-ink hover:text-accent rounded-radius-md text-xs font-semibold min-h-[44px]"
                  >
                    📱 QR
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
