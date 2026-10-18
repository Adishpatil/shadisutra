"use client";

import { useState } from "react";
import { createCustomerAccountAction, type CreatedCustomerResult } from "@/lib/auth/admin-actions";

interface CreateCustomerModalProps {
  events: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCustomerModal({
  events,
  onClose,
  onSuccess,
}: CreateCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<CreatedCustomerResult["credentials"] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCustomerAccountAction(formData);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to create customer account.");
    } else if (res.credentials) {
      setCreatedData(res.credentials);
      onSuccess();
    }
  };

  const handleCopy = () => {
    if (!createdData) return;
    const text = `Shadi Sutra Portal Credentials\nURL: ${window.location.origin}/login\nUsername: ${createdData.username}\nPassword: ${createdData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Provision New Customer Account"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface rounded-radius-lg border border-border shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-heading font-bold text-ink">
              {createdData ? "Customer Account Created" : "Provision Customer Account"}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {createdData
                ? "Copy the credentials below. The password is only displayed once."
                : "Creates a Supabase Auth user and linked customer profile."}
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

        {createdData ? (
          /* One-time credentials display */
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-radius-md bg-accent-light/50 border border-accent/30 space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-accent block">
                Account Details for {createdData.fullName}
              </span>
              <div className="space-y-1 font-mono text-sm text-ink">
                <p>
                  <strong>Portal URL:</strong> {window.location.origin}/login
                </p>
                <p>
                  <strong>Username:</strong> {createdData.username}
                </p>
                <p>
                  <strong>Temporary Password:</strong> {createdData.password}
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              ⚠️ <strong>Security Note:</strong> Account starts with <code>access_enabled = false</code> and{" "}
              <code>must_change_password = true</code>. The customer will be prompted to set their own password on first login once you grant portal access.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-accent text-accent-ink rounded-radius-full font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[44px]"
              >
                {copied ? "✓ Copied to Clipboard!" : "Copy Credentials"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-border text-ink rounded-radius-full font-medium text-sm hover:bg-bg transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Creation Form */
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="cust-full-name"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
              >
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="cust-full-name"
                name="fullName"
                required
                placeholder="e.g. Priyanshu & Ananya Sharma"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="cust-username"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
              >
                Username <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="cust-username"
                name="username"
                required
                autoCapitalize="none"
                placeholder="e.g. sharma_wedding"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-[11px] text-ink-muted mt-1 block">
                Lowercase letters, numbers, hyphens, and underscores only.
              </span>
            </div>

            <div>
              <label
                htmlFor="cust-password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
              >
                Initial Password (Optional)
              </label>
              <input
                type="text"
                id="cust-password"
                name="password"
                placeholder="Leave blank to securely auto-generate"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="cust-event-id"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1"
              >
                Link to Finalized Event (Optional)
              </label>
              <select
                id="cust-event-id"
                name="eventId"
                className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">-- No event linked yet --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
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
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
