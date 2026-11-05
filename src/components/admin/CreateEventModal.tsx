"use client";

import { useState } from "react";
import { createEventAction } from "@/lib/admin/event-actions";
import { Sheet } from "@/components/ui/AdminPrimitives";

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: (eventId: string) => void;
}

export function CreateEventModal({
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
    <Sheet open title="Create new event" onClose={onClose} className="sm:max-w-2xl">
        <p className="mb-5 text-base text-ink-muted">
          Add a wedding, birthday, or function.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-radius-md bg-danger-light border border-danger text-danger text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Event Name */}
          <div>
            <label
              htmlFor="event-name"
              className="mb-1 block text-sm font-semibold text-ink"
            >
              Event Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="event-name"
              name="name"
              required
              placeholder="e.g. Verma Wedding Celebrations"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
            />
          </div>

          {/* Type & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-type"
                className="mb-1 block text-sm font-semibold text-ink"
              >
                Event Type <span className="text-danger">*</span>
              </label>
              <select
                id="event-type"
                name="type"
                defaultValue="wedding"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="function">Function / Corporate</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="event-date"
                className="mb-1 block text-sm font-semibold text-ink"
              >
                Target Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                id="event-date"
                name="date"
                required
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label
              htmlFor="event-venue"
              className="mb-1 block text-sm font-semibold text-ink"
            >
              Venue / Location <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="event-venue"
              name="venue"
              required
              placeholder="e.g. Taj Jai Mahal Palace, Jaipur"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-client-name"
                className="mb-1 block text-sm font-semibold text-ink"
              >
                Client Name
              </label>
              <input
                type="text"
                id="event-client-name"
                name="client_name"
                autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
              />
            </div>
            <div>
              <label
                htmlFor="event-client-phone"
                className="mb-1 block text-sm font-semibold text-ink"
              >
                Client Phone
              </label>
              <input
                type="tel"
                id="event-client-phone"
                name="client_phone"
                autoComplete="tel"
                inputMode="tel"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="event-budget"
              className="mb-1 block text-sm font-semibold text-ink"
            >
              Estimated Agreed Budget (₹)
            </label>
            <input
              type="number"
              id="event-budget"
              name="budgetTotal"
              min="0"
              max="9999999999.99"
              step="0.01"
              placeholder="e.g. 1000000.00"
              className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-base focus:outline-none focus:ring-[3px] focus:ring-ink min-h-[44px]"
            />
          </div>

          <div className="sticky bottom-0 -mx-5 -mb-5 mt-4 border-t border-border bg-surface px-5 py-3 flex items-center justify-end gap-3 sm:-mx-7 sm:-mb-7 sm:px-7">
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
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-strong text-bg rounded-radius-full font-semibold text-sm hover:bg-brand hover:text-ink transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 min-h-[44px]"
            >
              {loading ? "Creating..." : "Save Event"}
            </button>
          </div>
        </form>
    </Sheet>
  );
}
