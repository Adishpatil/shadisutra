"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitEnquiryAction, type SubmitEnquiryResult } from "@/app/contact/actions";
import { Select, type SelectOption } from "@/components/ui/Select";

const eventTypeOptions: readonly SelectOption[] = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "function", label: "Function" },
];

interface ContactFormProps {
  initialService?: string;
}

export function ContactForm({ initialService = "wedding" }: ContactFormProps) {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState<SubmitEnquiryResult | null, FormData>(
    submitEnquiryAction,
    null
  );
  const [eventType, setEventType] = useState(initialService);
  const requestedDate = searchParams.get("date") ?? "";
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
    ? requestedDate
    : undefined;
  const initialVenue = searchParams.get("venue")?.trim().slice(0, 120);

  return (
    <form
      action={formAction}
      noValidate
      data-contact-form
      className="space-y-6 rounded-[28px] border border-border bg-surface p-5 sm:p-8"
    >
      {/* Honeypot field (hidden from view and assistive tech) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_hp">Leave this field blank</label>
        <input
          type="text"
          id="website_hp"
          name="website_hp"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Status banner */}
      {state && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-radius-md text-sm font-medium ${
            state.success
              ? "bg-success-light text-success border border-success/30"
              : "bg-danger-light text-danger border border-danger/30"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-semibold text-ink mb-1.5"
        >
          Your Full Name <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          aria-describedby={state?.errors?.name ? "name-error" : undefined}
          aria-invalid={Boolean(state?.errors?.name)}
          className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-ink ${
            state?.errors?.name ? "border-danger" : "border-border"
          }`}
        />
        {state?.errors?.name && (
          <p id="name-error" className="mt-1 text-xs text-danger font-medium">
            {state.errors.name}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="contact-phone"
          className="block text-sm font-semibold text-ink mb-1.5"
        >
          Phone / WhatsApp Number <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          type="tel"
          id="contact-phone"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Your phone number"
          aria-describedby={state?.errors?.phone ? "phone-error" : undefined}
          aria-invalid={Boolean(state?.errors?.phone)}
          className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-ink ${
            state?.errors?.phone ? "border-danger" : "border-border"
          }`}
        />
        {state?.errors?.phone && (
          <p id="phone-error" className="mt-1 text-xs text-danger font-medium">
            {state.errors.phone}
          </p>
        )}
      </div>

      {/* Event Type & Event Date grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="contact-event-type"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Event Type <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <Select
            id="contact-event-type"
            name="eventType"
            ariaLabel="Event Type"
            ariaDescribedBy={
              state?.errors?.eventType ? "event-type-error" : undefined
            }
            invalid={Boolean(state?.errors?.eventType)}
            value={eventType}
            options={eventTypeOptions}
            onChange={setEventType}
          />
          {state?.errors?.eventType && (
            <p id="event-type-error" className="mt-1 text-xs text-danger font-medium">
              {state.errors.eventType}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-event-date"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Target Date (Optional)
          </label>
          <input
            type="date"
            id="contact-event-date"
            name="eventDate"
            defaultValue={initialDate}
            aria-describedby="date-help"
            className="w-full px-4 py-3 rounded-radius-md border border-border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <span id="date-help" className="sr-only">
            Tentative or confirmed date for the event
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-ink mb-1.5"
        >
          Tell Us About Your Celebration <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          defaultValue={initialVenue ? `Venue or city: ${initialVenue}` : undefined}
          placeholder="Share your date, venue and ideas"
          aria-describedby={state?.errors?.message ? "message-error" : undefined}
          aria-invalid={Boolean(state?.errors?.message)}
          className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-ink ${
            state?.errors?.message ? "border-danger" : "border-border"
          }`}
        />
        {state?.errors?.message && (
          <p id="message-error" className="mt-1 text-xs text-danger font-medium">
            {state.errors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-8 py-3.5 text-base font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending Your Enquiry..." : "Send Event Enquiry"}
      </button>
    </form>
  );
}
