"use client";

import { useState } from "react";
import { createEventAction } from "@/lib/admin/event-actions";

interface CreateEventModalProps {
  customers: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: (eventId: string) => void;
}

export function CreateEventModal({
  customers,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createEventAction(formData);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to create event.");
    } else if (res.eventId) {
      onSuccess(res.eventId);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create New Event"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface rounded-radius-lg border border-border shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-heading font-bold text-ink">
              Create New Event
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Add a new wedding, birthday, or corporate celebration.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-radius-sm text-ink-muted hover:text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-radius-md bg-danger-light border border-danger/30 text-danger text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {/* Event Name */}
          <div>
            <label
              htmlFor="event-name"
              className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
            >
              Event Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="event-name"
              name="name"
              required
              placeholder="e.g. Verma Wedding Celebrations"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Type & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-type"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
              >
                Event Type <span className="text-danger">*</span>
              </label>
              <select
                id="event-type"
                name="type"
                defaultValue="wedding"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="function">Function / Corporate</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="event-date"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
              >
                Target Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                id="event-date"
                name="date"
                required
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label
              htmlFor="event-venue"
              className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
            >
              Venue / Location <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="event-venue"
              name="venue"
              required
              placeholder="e.g. Taj Jai Mahal Palace, Jaipur"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Customer Assignment */}
          <div>
            <label
              htmlFor="event-customer"
              className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
            >
              Assign to Customer Account (Optional)
            </label>
            <select
              id="event-customer"
              name="customerId"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">-- Assign later --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="event-budget"
              className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
            >
              Estimated Agreed Budget (₹)
            </label>
            <input
              type="number"
              id="event-budget"
              name="budgetTotal"
              placeholder="e.g. 1000000"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Reveal payments to customer toggle */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="show-payments"
              name="showPayments"
              value="true"
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="show-payments" className="text-xs text-ink">
              Allow customer to view read-only budget summary in portal
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-ink min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-accent text-accent-ink rounded-radius-full font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 min-h-[44px]"
            >
              {loading ? "Creating..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
