"use client";

import { useState } from "react";
import type {
  AdminEventSummary,
  AdminFunction,
  AdminItem,
} from "@/lib/admin/data";
import type { PaymentRecord } from "@/lib/admin/budget-calculations";

interface PortalDashboardClientProps {
  customerName: string;
  event: AdminEventSummary;
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
  payments: PaymentRecord[];
  agreedTotal: number;
}

type TabId = "overview" | "functions" | "payments";

const statusLabel: Record<string, { text: string; color: string }> = {
  planning: {
    text: "Planning",
    color: "bg-warning-light text-warning border-warning/30",
  },
  finalized: {
    text: "Finalized",
    color: "bg-success-light text-success border-success/30",
  },
  completed: {
    text: "Completed",
    color: "bg-bg text-ink-muted border-border",
  },
  cancelled: {
    text: "Cancelled",
    color: "bg-danger-light text-danger border-danger/30",
  },
};

const itemStatusIcon: Record<string, { emoji: string; label: string }> = {
  done: { emoji: "✅", label: "Done" },
  in_progress: { emoji: "🔄", label: "In Progress" },
  not_started: { emoji: "⏳", label: "Not Started" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function PortalDashboardClient({
  customerName,
  event,
  functions,
  itemsByFunction,
  payments,
  agreedTotal,
}: PortalDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remaining = Math.max(0, agreedTotal - totalPaid);
  const percentPaid = agreedTotal > 0 ? Math.round((totalPaid / agreedTotal) * 100) : 0;

  const allItems = Object.values(itemsByFunction).flat();
  const doneItems = allItems.filter((i) => i.status === "done").length;
  const totalItems = allItems.length;
  const daysLeft = daysUntil(event.date);
  const eventStatus = statusLabel[event.status] || statusLabel.planning;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "functions", label: "Functions & Items", icon: "🎪" },
  ];

  if (event.show_payments_to_customer) {
    tabs.push({ id: "payments", label: "Payments", icon: "💳" });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Welcome Header ──────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">
          Welcome back
        </p>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
          {customerName}
        </h1>
        <p className="text-sm text-ink-muted">
          Here&apos;s the latest on your event.
        </p>
      </div>

      {/* ─── Event Header Card ────────────────────────────────── */}
      <div className="bg-surface p-6 sm:p-8 rounded-radius-lg border border-border shadow-[var(--shadow-md)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-semibold text-accent tracking-wider">
                {event.type}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-radius-full border ${eventStatus.color}`}
              >
                {eventStatus.text}
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink">
              {event.name}
            </h2>
          </div>
          {daysLeft > 0 && (
            <div className="text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-heading font-bold text-accent block">
                {daysLeft}
              </span>
              <span className="text-xs text-ink-muted font-medium uppercase tracking-wider">
                Days to Go
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            📅 {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">📍 {event.venue}</span>
          <span className="flex items-center gap-1.5">
            🎪 {functions.length} function{functions.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            ✅ {doneItems}/{totalItems} items ready
          </span>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────── */}
      <div className="flex gap-1 bg-surface p-1 rounded-radius-md border border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-radius-md text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === tab.id
                ? "bg-accent text-accent-ink shadow-[var(--shadow-sm)]"
                : "text-ink-muted hover:text-ink hover:bg-bg"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─────────────────────────────────────── */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <OverviewTab
            event={event}
            functions={functions}
            allItems={allItems}
            doneItems={doneItems}
            totalItems={totalItems}
            totalPaid={totalPaid}
            agreedTotal={agreedTotal}
            remaining={remaining}
            percentPaid={percentPaid}
          />
        )}
        {activeTab === "functions" && (
          <FunctionsTab
            functions={functions}
            itemsByFunction={itemsByFunction}
          />
        )}
        {activeTab === "payments" && event.show_payments_to_customer && (
          <PaymentsTab
            payments={payments}
            agreedTotal={agreedTotal}
            totalPaid={totalPaid}
            remaining={remaining}
            percentPaid={percentPaid}
          />
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* OVERVIEW TAB                                                          */
/* ════════════════════════════════════════════════════════════════════════ */

function OverviewTab({
  event,
  functions,
  allItems,
  doneItems,
  totalItems,
  totalPaid,
  agreedTotal,
  remaining,
  percentPaid,
}: {
  event: AdminEventSummary;
  functions: AdminFunction[];
  allItems: AdminItem[];
  doneItems: number;
  totalItems: number;
  totalPaid: number;
  agreedTotal: number;
  remaining: number;
  percentPaid: number;
}) {
  const progressPercent =
    totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metric cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Item progress */}
        <div className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Item Readiness
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-ink">
              {doneItems}/{totalItems}
            </span>
            <span className="text-xs font-medium text-success">
              {progressPercent}% Ready
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-bg rounded-radius-full overflow-hidden">
            <div
              className="h-full bg-success rounded-radius-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Functions count */}
        <div className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Functions Planned
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-ink">
              {functions.length}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {functions.length > 0
              ? `Next: ${functions[0].name}`
              : "No functions yet"}
          </p>
        </div>

        {/* Payment summary (only if payments are visible) */}
        {event.show_payments_to_customer && (
          <div className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
              Payment Progress
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-accent">
                {percentPaid}%
              </span>
              <span className="text-xs font-medium text-ink-muted">
                of {formatCurrency(agreedTotal)}
              </span>
            </div>
            <div className="mt-3 h-2 bg-bg rounded-radius-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-radius-full transition-all duration-500"
                style={{ width: `${Math.min(percentPaid, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {formatCurrency(remaining)} remaining
            </p>
          </div>
        )}
      </div>

      {/* Upcoming functions list */}
      <div className="space-y-3">
        <h3 className="text-lg font-heading font-bold text-ink">
          Upcoming Functions
        </h3>
        {functions.length === 0 ? (
          <div className="bg-surface p-6 rounded-radius-lg border border-border text-center">
            <p className="text-sm text-ink-muted">
              No functions have been scheduled yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {functions.map((fn) => {
              const fnDays = daysUntil(fn.date);
              return (
                <div
                  key={fn.id}
                  className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] hover:border-accent/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading font-bold text-base text-ink leading-snug">
                      {fn.name}
                    </h4>
                    {fnDays > 0 && (
                      <span className="text-xs font-bold text-accent bg-accent-light px-2 py-0.5 rounded-radius-full shrink-0">
                        {fnDays}d
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span>📅 {formatDate(fn.date)}</span>
                    {fn.start_time && (
                      <span>🕐 {formatTime(fn.start_time)}</span>
                    )}
                  </div>
                  {fn.notes && (
                    <p className="text-xs text-ink-muted line-clamp-2">
                      {fn.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* FUNCTIONS & ITEMS TAB                                                 */
/* ════════════════════════════════════════════════════════════════════════ */

function FunctionsTab({
  functions,
  itemsByFunction,
}: {
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
}) {
  const [expandedFn, setExpandedFn] = useState<string | null>(
    functions[0]?.id || null
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-bold text-ink">
        All Functions & Items
      </h3>

      {functions.length === 0 ? (
        <div className="bg-surface p-8 rounded-radius-lg border border-border text-center">
          <p className="text-sm text-ink-muted">
            No functions have been added to your event yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {functions.map((fn) => {
            const items = itemsByFunction[fn.id] || [];
            const isExpanded = expandedFn === fn.id;
            const doneCount = items.filter(
              (i) => i.status === "done"
            ).length;

            return (
              <div
                key={fn.id}
                className="bg-surface rounded-radius-lg border border-border shadow-[var(--shadow-sm)] overflow-hidden"
              >
                {/* Accordion header */}
                <button
                  onClick={() =>
                    setExpandedFn(isExpanded ? null : fn.id)
                  }
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-bg/50 transition-colors min-h-[56px]"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-heading font-bold text-base text-ink truncate">
                      {fn.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-ink-muted">
                      <span>📅 {formatDate(fn.date)}</span>
                      {fn.start_time && (
                        <span>🕐 {formatTime(fn.start_time)}</span>
                      )}
                      <span>
                        {doneCount}/{items.length} items done
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-ink-muted shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Accordion content: items table */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {items.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-ink-muted">
                        No items added yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-xs text-ink-muted uppercase tracking-wider">
                              <th className="text-left px-5 py-3 font-semibold">
                                Item
                              </th>
                              <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">
                                Category
                              </th>
                              <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">
                                Vendor
                              </th>
                              <th className="text-center px-3 py-3 font-semibold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => {
                              const status =
                                itemStatusIcon[item.status] ||
                                itemStatusIcon.not_started;
                              return (
                                <tr
                                  key={item.id}
                                  className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors"
                                >
                                  <td className="px-5 py-3 font-medium text-ink">
                                    {item.title}
                                  </td>
                                  <td className="px-3 py-3 text-ink-muted capitalize hidden sm:table-cell">
                                    {item.category}
                                  </td>
                                  <td className="px-3 py-3 text-ink-muted hidden md:table-cell">
                                    {item.vendor || "—"}
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <span
                                      title={status.label}
                                      className="text-base"
                                    >
                                      {status.emoji}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* PAYMENTS TAB                                                          */
/* ════════════════════════════════════════════════════════════════════════ */

function PaymentsTab({
  payments,
  agreedTotal,
  totalPaid,
  remaining,
  percentPaid,
}: {
  payments: PaymentRecord[];
  agreedTotal: number;
  totalPaid: number;
  remaining: number;
  percentPaid: number;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-bold text-ink">
        Payment Summary
      </h3>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Agreed Total
          </span>
          <span className="mt-2 text-2xl font-heading font-bold text-ink block">
            {formatCurrency(agreedTotal)}
          </span>
        </div>
        <div className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Total Paid
          </span>
          <span className="mt-2 text-2xl font-heading font-bold text-success block">
            {formatCurrency(totalPaid)}
          </span>
          <div className="mt-2 h-1.5 bg-bg rounded-radius-full overflow-hidden">
            <div
              className="h-full bg-success rounded-radius-full transition-all duration-500"
              style={{ width: `${Math.min(percentPaid, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
            Remaining Due
          </span>
          <span className="mt-2 text-2xl font-heading font-bold text-warning block">
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-surface rounded-radius-lg border border-border shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h4 className="font-heading font-bold text-base text-ink">
            Payment History
          </h4>
        </div>
        {payments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-muted text-center">
            No payments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">
                    Date
                  </th>
                  <th className="text-left px-3 py-3 font-semibold">
                    Mode
                  </th>
                  <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">
                    Note
                  </th>
                  <th className="text-right px-5 py-3 font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-ink font-medium whitespace-nowrap">
                      {formatDate(p.paid_on)}
                    </td>
                    <td className="px-3 py-3 text-ink-muted whitespace-nowrap">
                      {p.mode}
                    </td>
                    <td className="px-3 py-3 text-ink-muted hidden sm:table-cell">
                      {p.note || "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-success whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bg/50 font-bold">
                  <td
                    colSpan={3}
                    className="px-5 py-3 text-ink text-right hidden sm:table-cell"
                  >
                    Total Paid
                  </td>
                  <td
                    colSpan={2}
                    className="px-5 py-3 text-ink text-right sm:hidden"
                  >
                    Total Paid
                  </td>
                  <td className="px-5 py-3 text-right text-success">
                    {formatCurrency(totalPaid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Friendly notice */}
      <div className="bg-accent-light border border-accent/20 rounded-radius-lg p-4 text-sm text-ink-muted">
        <strong className="text-ink">💡 Note:</strong> All payment information is
        for your reference. If you have any queries, please contact your event
        coordinator directly.
      </div>
    </div>
  );
}
