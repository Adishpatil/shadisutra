"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateEventBudget,
  type PaymentRecord,
  type ItemCostSummary,
} from "@/lib/admin/budget-calculations";
import type { AuditLogItem } from "@/lib/admin/data";
import {
  addPaymentAction,
  updateAgreedTotalAction,
  deletePaymentAction,
} from "@/lib/admin/payment-actions";

interface BudgetPaymentsTabProps {
  eventId: string;
  initialAgreedTotal: number;
  initialPayments: PaymentRecord[];
  items: ItemCostSummary[];
  auditLogs: AuditLogItem[];
}

export function BudgetPaymentsTab({
  eventId,
  initialAgreedTotal,
  initialPayments,
  items,
  auditLogs,
}: BudgetPaymentsTabProps) {
  const router = useRouter();
  const [agreedTotal, setAgreedTotal] = useState(initialAgreedTotal);
  const [payments, setPayments] = useState(initialPayments);

  // Modals state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showEditAgreedModal, setShowEditAgreedModal] = useState(false);
  const [editAgreedInput, setEditAgreedInput] = useState(String(agreedTotal));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate metrics on state change
  const budget = calculateEventBudget(agreedTotal, items, payments);

  // Handle Quick Add Payment
  const handleAddPaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await addPaymentAction(eventId, formData);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to record payment.");
    } else {
      setShowAddPaymentModal(false);
      router.refresh();
    }
  };

  // Handle Edit Agreed Budget
  const handleEditAgreedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(editAgreedInput) || 0;
    setAgreedTotal(val);
    setShowEditAgreedModal(false);
    await updateAgreedTotalAction(eventId, val);
    router.refresh();
  };

  // Handle Delete Payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    await deletePaymentAction(paymentId, eventId);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------- */}
      {/* 1. Calculated KPI Summary Cards                               */}
      {/* Paid, remaining, % are calculated and NEVER typed             */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Agreed Total */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Agreed Contract Total
            </span>
            <button
              type="button"
              onClick={() => {
                setEditAgreedInput(String(agreedTotal));
                setShowEditAgreedModal(true);
              }}
              className="text-xs text-accent font-semibold hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              ₹{budget.agreedTotal.toLocaleString()}
            </span>
            <span className="text-xs text-ink-muted block mt-1">
              Contracted client price
            </span>
          </div>
        </div>

        {/* Total Paid (Calculated) */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Total Payments Received
            </span>
            <span className="text-xs font-bold text-success bg-success-light px-2 py-0.5 rounded-radius-full">
              Calculated
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-success">
              ₹{budget.totalPaid.toLocaleString()}
            </span>
            <span className="text-xs text-ink-muted block mt-1">
              Across {payments.length} transactions
            </span>
          </div>
        </div>

        {/* Remaining Due (Calculated) */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Remaining Balance Due
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-radius-full ${
                budget.remainingDue === 0
                  ? "bg-success-light text-success"
                  : "bg-warning-light text-warning"
              }`}
            >
              {budget.remainingDue === 0 ? "Paid in Full" : "Pending"}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              ₹{budget.remainingDue.toLocaleString()}
            </span>
            <span className="text-xs text-ink-muted block mt-1">
              {budget.remainingDue === 0 ? "Zero outstanding balance" : "Awaiting final settlement"}
            </span>
          </div>
        </div>

        {/* % Paid (Calculated Progress) */}
        <div className="bg-surface p-5 sm:p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Payment Realization
            </span>
            <span className="text-xs font-bold text-accent font-mono">
              {budget.percentagePaid}%
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="w-full h-3 rounded-radius-full bg-bg border border-border overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budget.percentagePaid >= 100
                    ? "bg-success"
                    : budget.percentagePaid >= 50
                    ? "bg-accent"
                    : "bg-warning"
                }`}
                style={{ width: `${Math.min(100, budget.percentagePaid)}%` }}
              />
            </div>
            <span className="text-[11px] text-ink-muted block">
              {budget.percentagePaid >= 100
                ? "100% of agreed budget received"
                : `${budget.percentagePaid}% realized to date`}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Vendor Cost vs Margin Comparison                           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Category Cost Distribution */}
        <div className="lg:col-span-8 bg-surface p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-ink">
              Vendor Category Costs (From Tracking Items)
            </h3>
            <span className="text-xs font-bold font-mono text-ink">
              Total Expenses: ₹{budget.totalItemCosts.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {Object.entries(budget.categoryBreakdown).map(([cat, cost]) => (
              <div key={cat} className="p-3 bg-bg rounded-radius-md border border-border">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block capitalize">
                  {cat}
                </span>
                <span className="text-sm font-bold font-mono text-ink mt-1 block">
                  ₹{cost.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-ink-muted flex items-center justify-between">
            <span>
              Estimated Profit Margin (Agreed Total - Vendor Costs):
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                budget.estimatedMargin >= 0 ? "text-success" : "text-danger"
              }`}
            >
              ₹{budget.estimatedMargin.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Banner */}
        <div className="lg:col-span-4 bg-accent-light/40 p-6 rounded-radius-lg border border-accent/30 flex flex-col justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-accent tracking-wider block">
              Quick Action
            </span>
            <h3 className="font-heading font-bold text-lg text-ink mt-1">
              Record Client Payment
            </h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Log bank transfers, cheques, or UPI advances. Automatically updates calculations and creates an immutable audit trail.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddPaymentModal(true)}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-accent text-accent-ink rounded-radius-md font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[44px]"
          >
            + Quick Add Payment
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Payments Received History Table & Mobile Cards             */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-ink">
            Payment Receipts History ({payments.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowAddPaymentModal(true)}
            className="text-xs font-semibold text-accent hover:underline"
          >
            + Add Payment
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-4">Date Paid</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Mode / Channel</th>
                <th className="py-3 px-4">Note / Tranche</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-bg/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-ink">
                    {p.paid_on}
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-sm text-success">
                    ₹{p.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-radius-sm bg-bg border border-border text-ink font-medium">
                      {p.mode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-ink-muted">
                    {p.note || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeletePayment(p.id)}
                      className="text-xs text-danger hover:underline font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-mono text-success">
                  ₹{p.amount.toLocaleString()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-radius-sm bg-bg border border-border text-ink font-medium">
                  {p.mode}
                </span>
              </div>
              <div className="text-xs text-ink-muted flex items-center justify-between">
                <span>📅 {p.paid_on}</span>
                <button
                  type="button"
                  onClick={() => handleDeletePayment(p.id)}
                  className="text-danger font-semibold min-h-[36px] flex items-center"
                >
                  Delete
                </button>
              </div>
              {p.note && (
                <p className="text-xs text-ink-muted pt-1 border-t border-border">
                  📝 {p.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="p-8 text-center text-ink-muted bg-surface rounded-radius-lg border border-border text-sm">
            No payments recorded yet. Click <strong>+ Quick Add Payment</strong> to record the initial deposit.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Financial Audit Trail                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-surface p-6 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-4">
        <h3 className="font-heading font-bold text-lg text-ink flex items-center gap-2">
          <span>Security Audit Trail</span>
          <span className="text-xs text-ink-muted font-normal">
            (Immutable event ledger)
          </span>
        </h3>

        <div className="divide-y divide-border text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-accent font-semibold uppercase">
                  {log.action}
                </span>
                <span className="text-ink-muted">on table {log.table_name}</span>
                {log.payload && (
                  <span className="text-ink-muted font-mono truncate max-w-xs">
                    {JSON.stringify(log.payload)}
                  </span>
                )}
              </div>
              <span className="text-ink-muted font-mono shrink-0">
                {new Date(log.at).toLocaleString()}
              </span>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <div className="py-4 text-center text-ink-muted text-xs">
              No audit log entries found for this event.
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Quick Add Payment                                      */}
      {/* ------------------------------------------------------------- */}
      {showAddPaymentModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowAddPaymentModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-ink">
                Record Client Payment
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                className="text-ink-muted hover:text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-danger-light text-danger text-xs font-medium rounded-radius-md border border-danger/30">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Amount Received (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm font-mono focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Date Received <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="paidOn"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Payment Mode
                  </label>
                  <select
                    name="mode"
                    defaultValue="RTGS Bank Transfer"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  >
                    <option value="RTGS Bank Transfer">RTGS Transfer</option>
                    <option value="NEFT Bank Transfer">NEFT Transfer</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Cash">Cash Receipt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Note / Tranche Description
                </label>
                <input
                  type="text"
                  name="note"
                  placeholder="e.g. Milestone 2: Mandap structure advance"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[44px] disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Edit Contracted Agreed Budget                          */}
      {/* ------------------------------------------------------------- */}
      {showEditAgreedModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowEditAgreedModal(false)}
        >
          <div
            className="w-full max-w-sm bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-ink">
              Edit Contracted Budget
            </h3>
            <p className="text-xs text-ink-muted">
              Update the agreed overall total price for this event.
            </p>
            <form onSubmit={handleEditAgreedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Agreed Total Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={editAgreedInput}
                  onChange={(e) => setEditAgreedInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm font-mono focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAgreedModal(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold min-h-[44px]"
                >
                  Update Total
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
