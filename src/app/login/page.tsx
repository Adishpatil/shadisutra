"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { loginAction, verifyMfaAction, type LoginActionResult } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginActionResult | null, FormData>(
    loginAction,
    null
  );

  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state?.factorId || mfaCode.length !== 6) return;

    setMfaPending(true);
    setMfaError(null);

    const res = await verifyMfaAction(state.factorId, mfaCode);
    if (res?.error) {
      setMfaError(res.error);
      setMfaPending(false);
    }
  };

  return (
    <div className="min-h-[90dvh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-radius-lg border border-border shadow-[var(--shadow-md)]">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-heading text-3xl font-bold text-accent tracking-tight"
          >
            {site.name}
          </Link>
          <h1 className="mt-3 text-xl sm:text-2xl font-heading font-semibold text-ink">
            {state?.requiresEnrollment
              ? "Set up authenticator"
              : state?.requiresMfa
                ? "Two-factor authentication"
                : "Admin Login"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
            {state?.requiresEnrollment
              ? "Scan this QR code with an authenticator app, then enter its 6-digit code to finish securing your account."
              : state?.requiresMfa
                ? "Enter the 6-digit code from your authenticator app to continue."
                : "Sign in with your administrator username and password."}
          </p>
        </div>

        {/* Generic or MFA Error Alert */}
        {(state?.error || mfaError) && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-radius-md bg-danger-light border border-danger/30 text-danger text-sm font-medium"
          >
            {mfaError || state?.error}
          </div>
        )}

        {/* Conditional View: TOTP MFA Code Entry */}
        {state?.requiresEnrollment && state.qrCode && (
          <div className="mb-5 flex justify-center rounded-radius-md border border-border bg-white p-4">
            <Image
              src={state.qrCode}
              alt="QR code to enroll this admin account in an authenticator app"
              width={220}
              height={220}
              unoptimized
            />
          </div>
        )}

        {state?.requiresMfa || state?.requiresEnrollment ? (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="mfa-code"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                6-Digit Authenticator Code
              </label>
              <input
                type="text"
                id="mfa-code"
                name="code"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-widest text-xl font-mono px-4 py-3 rounded-radius-md border border-border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={mfaPending || mfaCode.length !== 6}
              className="w-full mt-2 inline-flex items-center justify-center px-6 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 min-h-[44px]"
            >
              {mfaPending
                ? "Verifying..."
                : state.requiresEnrollment
                  ? "Enable MFA & Sign In"
                  : "Verify & Sign In"}
            </button>
          </form>
        ) : (
          /* Standard Login Form */
          <form action={formAction} className="space-y-5" noValidate>
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                placeholder="Administrator username"
                className="w-full px-4 py-3 text-base rounded-radius-md border border-border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Password with Show/Hide toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 text-base rounded-radius-md border border-border bg-bg text-ink pr-14 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink px-2 py-1 rounded-radius-sm text-xs font-semibold"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 inline-flex items-center justify-center px-6 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* Security notice / no self-registration */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-ink-muted leading-relaxed">
            Admin access only. Account registration is disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
