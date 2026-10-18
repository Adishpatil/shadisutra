"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { changePasswordAction, type ChangePasswordResult } from "./actions";

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState<ChangePasswordResult | null, FormData>(
    changePasswordAction,
    null
  );

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-[85dvh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-radius-lg border border-border shadow-[var(--shadow-md)]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-heading text-3xl font-bold text-accent tracking-tight"
          >
            {site.name}
          </Link>
          <h1 className="mt-3 text-xl sm:text-2xl font-heading font-semibold text-ink">
            Set Your New Password
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Welcome to {site.name}! For your account security, you are required to set a new password on your first login.
          </p>
        </div>

        {/* Global Error Banner */}
        {state?.error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-radius-md bg-danger-light border border-danger/30 text-danger text-sm font-medium"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5" noValidate>
          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-semibold text-ink mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                id="new-password"
                name="newPassword"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters (letters & numbers)"
                aria-describedby={state?.fieldErrors?.newPassword ? "new-password-error" : "password-hint"}
                aria-invalid={Boolean(state?.fieldErrors?.newPassword)}
                className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink pr-14 focus:outline-none focus:ring-2 focus:ring-accent ${
                  state?.fieldErrors?.newPassword ? "border-danger" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink px-2 py-1 rounded-radius-sm text-xs font-semibold"
                aria-label={showNew ? "Hide new password" : "Show new password"}
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
            {state?.fieldErrors?.newPassword ? (
              <p id="new-password-error" className="mt-1 text-xs text-danger font-medium">
                {state.fieldErrors.newPassword}
              </p>
            ) : (
              <p id="password-hint" className="mt-1 text-xs text-ink-muted">
                Must be at least 8 characters with at least one letter and one number.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-semibold text-ink mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                id="confirm-password"
                name="confirmPassword"
                required
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                aria-describedby={state?.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined}
                aria-invalid={Boolean(state?.fieldErrors?.confirmPassword)}
                className={`w-full px-4 py-3 rounded-radius-md border bg-bg text-ink pr-14 focus:outline-none focus:ring-2 focus:ring-accent ${
                  state?.fieldErrors?.confirmPassword ? "border-danger" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink px-2 py-1 rounded-radius-sm text-xs font-semibold"
                aria-label={showConfirm ? "Hide confirmed password" : "Show confirmed password"}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {state?.fieldErrors?.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-xs text-danger font-medium">
                {state.fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-3 inline-flex items-center justify-center px-6 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 min-h-[44px]"
          >
            {isPending ? "Updating Password..." : "Set Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
