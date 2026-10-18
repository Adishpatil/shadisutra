"use client";

import { useActionState, useTransition } from "react";
import { submitEnquiryAction, type SubmitEnquiryResult } from "@/app/contact/actions";

interface ContactFormProps {
  initialService?: string;
}

export function ContactForm({ initialService = "wedding" }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState<SubmitEnquiryResult | null, FormData>(
    submitEnquiryAction,
    null
  );

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-6 bg-surface p-6 sm:p-10 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]"
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
          placeholder="e.g. Priyanshu Sharma"
          aria-describedby={state?.errors?.name ? "name-error" : undefined}
          aria-invalid={Boolean(state?.errors?.name)}
          className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent ${
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
          placeholder="e.g. 9876543210"
          aria-describedby={state?.errors?.phone ? "phone-error" : undefined}
          aria-invalid={Boolean(state?.errors?.phone)}
          className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent ${
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
          <select
            id="contact-event-type"
            name="eventType"
            defaultValue={initialService}
            required
            aria-describedby={state?.errors?.eventType ? "event-type-error" : undefined}
            className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent ${
              state?.errors?.eventType ? "border-danger" : "border-border"
            }`}
          >
            <option value="wedding">Wedding / Pre-Wedding</option>
            <option value="birthday">Birthday Celebration</option>
            <option value="function">Corporate Gala / Social Function</option>
            <option value="other">Other Event</option>
          </select>
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
            aria-describedby="date-help"
            className="w-full px-4 py-3 rounded-radius-md border border-border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent"
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
          placeholder="Share your expected guest count, venue preferences, ideas or questions..."
          aria-describedby={state?.errors?.message ? "message-error" : undefined}
          aria-invalid={Boolean(state?.errors?.message)}
          className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent ${
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
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed text-base min-h-[44px]"
      >
        {isPending ? "Sending Your Enquiry..." : "Send Event Enquiry"}
      </button>
    </form>
  );
}
