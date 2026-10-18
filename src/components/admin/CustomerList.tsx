"use client";

import { useState } from "react";
import type { AdminCustomerSummary } from "@/lib/admin/data";
import {
  toggleCustomerAccessAction,
  resetCustomerPasswordAction,
} from "@/lib/auth/admin-actions";

interface CustomerListProps {
  initialCustomers: AdminCustomerSummary[];
}

export function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [resetModalData, setResetModalData] = useState<{
    username: string;
    newPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Toggle Access
  const handleToggleAccess = async (customerId: string, currentStatus: boolean) => {
    setLoadingId(customerId);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, access_enabled: newStatus } : c
      )
    );

    const res = await toggleCustomerAccessAction(customerId, newStatus);
    setLoadingId(null);

    if (!res.success) {
      // Revert on failure
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, access_enabled: currentStatus } : c
        )
      );
      alert(`Failed to update access: ${res.error}`);
    }
  };

  // Reset Password
  const handleResetPassword = async (customerId: string, username: string) => {
    if (!confirm(`Are you sure you want to reset password for "${username}"?`)) {
      return;
    }

    setLoadingId(customerId);
    const res = await resetCustomerPasswordAction(customerId);
    setLoadingId(null);

    if (res.success && res.newPassword) {
      setResetModalData({
        username,
        newPassword: res.newPassword,
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, must_change_password: true } : c
        )
      );
    } else {
      alert(`Failed to reset password: ${res.error}`);
    }
  };

  const handleCopyReset = () => {
    if (!resetModalData) return;
    const text = `Temporary Password: ${resetModalData.newPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* ------------------------------------------------------------- */}
      {/* 1. Desktop & Tablet Table (Hidden below 768px)                */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block overflow-x-auto bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/50 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Username</th>
              <th className="py-3.5 px-4">Linked Event</th>
              <th className="py-3.5 px-4">Portal Access</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-bg/40 transition-colors">
                <td className="py-4 px-4 font-semibold text-ink">
                  {c.full_name}
                </td>
                <td className="py-4 px-4 font-mono text-xs text-ink-muted">
                  {c.username}
                </td>
                <td className="py-4 px-4 text-ink-muted">
                  {c.linked_event_name ? (
                    <span className="text-accent font-medium">
                      {c.linked_event_name}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted italic">
                      No event linked
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button
                    type="button"
                    disabled={loadingId === c.id}
                    onClick={() => handleToggleAccess(c.id, c.access_enabled)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-radius-full text-xs font-semibold transition-colors min-h-[36px] ${
                      c.access_enabled
                        ? "bg-success-light text-success hover:bg-success-light/80"
                        : "bg-danger-light text-danger hover:bg-danger-light/80"
                    }`}
                    title={
                      c.access_enabled
                        ? "Portal access is ACTIVE. Click to revoke."
                        : "Portal access is DISABLED. Click to grant access."
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.access_enabled ? "bg-success" : "bg-danger"
                      }`}
                    />
                    {c.access_enabled ? "Enabled" : "Disabled"}
                  </button>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    type="button"
                    disabled={loadingId === c.id}
                    onClick={() => handleResetPassword(c.id, c.username)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-ink hover:text-accent border border-border hover:border-accent rounded-radius-md transition-colors min-h-[36px]"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Mobile Stacked Cards (Visible only below 768px)            */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden space-y-4">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-ink">
                  {c.full_name}
                </h3>
                <span className="font-mono text-xs text-ink-muted block mt-0.5">
                  @{c.username}
                </span>
              </div>

              {/* Mobile Access Toggle */}
              <button
                type="button"
                disabled={loadingId === c.id}
                onClick={() => handleToggleAccess(c.id, c.access_enabled)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-radius-full text-xs font-semibold min-h-[44px] ${
                  c.access_enabled
                    ? "bg-success-light text-success"
                    : "bg-danger-light text-danger"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    c.access_enabled ? "bg-success" : "bg-danger"
                  }`}
                />
                {c.access_enabled ? "Access Enabled" : "Access Disabled"}
              </button>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-ink-muted">
                {c.linked_event_name || "No event linked"}
              </span>

              <button
                type="button"
                disabled={loadingId === c.id}
                onClick={() => handleResetPassword(c.id, c.username)}
                className="font-semibold text-accent hover:underline min-h-[44px] flex items-center"
              >
                Reset Password
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Password Reset Success Dialog                              */}
      {/* ------------------------------------------------------------- */}
      {resetModalData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4">
            <h3 className="font-heading font-bold text-lg text-ink">
              Password Reset
            </h3>
            <p className="text-xs text-ink-muted">
              New temporary password generated for <strong>{resetModalData.username}</strong>:
            </p>
            <div className="p-3 bg-bg border border-border rounded-radius-md font-mono text-center text-base font-bold text-ink select-all">
              {resetModalData.newPassword}
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCopyReset}
                className="flex-1 py-2.5 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover transition-colors min-h-[44px]"
              >
                {copied ? "✓ Copied" : "Copy Password"}
              </button>
              <button
                type="button"
                onClick={() => setResetModalData(null)}
                className="px-4 py-2.5 border border-border text-ink rounded-radius-md text-xs font-medium hover:bg-bg transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
