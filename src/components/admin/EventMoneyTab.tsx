"use client";

import ExcelJS from "exceljs";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BudgetPaymentsTab } from "@/components/admin/BudgetPaymentsTab";
import { Button, Sheet } from "@/components/ui/AdminPrimitives";
import { calculateEventMoney, type ExpenseCategory } from "@/lib/admin/money-calculations";
import { deleteEventExpenseAction, saveEventExpenseAction } from "@/lib/admin/event-expense-actions";
import type { AdminExpenseRecord } from "@/lib/admin/event-money-data";
import type { AdminFunction, AdminItem } from "@/lib/admin/data";
import type { PaymentRecord, ItemCostSummary } from "@/lib/admin/budget-calculations";
import type { AuditLogItem } from "@/lib/admin/data";
import { formatDate } from "@/lib/date-time";
import { formatINRDecimal } from "@/lib/format";

const categories: ExpenseCategory[] = ["lighting", "flowers", "decor", "instruments", "venue", "food", "staff", "travel", "other"];
const statuses = ["unpaid", "part_paid", "paid"] as const;
const paymentModes = ["cash", "upi", "bank", "cheque", "card", "other"] as const;

interface EventMoneyTabProps {
  eventId: string;
  eventDate: string;
  agreedTotal: number;
  payments: PaymentRecord[];
  itemCosts: ItemCostSummary[];
  auditLogs: AuditLogItem[];
  expenses: AdminExpenseRecord[];
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
  quickAction?: "payment" | "expense" | null;
}

function money(paise: number): string {
  return formatINRDecimal(paise / 100);
}

function spreadsheetText(value: string | null): string {
  if (!value) return "";
  return /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function ExpenseForm({
  eventId,
  eventDate,
  functions,
  itemsByFunction,
  expense,
  onSaved,
}: {
  eventId: string;
  eventDate: string;
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
  expense: AdminExpenseRecord | null;
  onSaved: () => void;
}) {
  const [selectedFunction, setSelectedFunction] = useState(expense?.function_id ?? "");
  const [selectedItem, setSelectedItem] = useState(expense?.item_id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await saveEventExpenseAction(eventId, expense?.id ?? null, formData);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Could not save expense.");
      return;
    }
    onSaved();
  };

  const fields = "min-h-11 w-full rounded-radius-md border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-radius-md bg-danger-light p-3 text-base text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Category
          <select name="category" required defaultValue={expense?.category ?? "other"} className={`${fields} mt-1`}>
            {categories.map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Expense date
          <input name="expenseDate" type="date" required defaultValue={expense?.expense_date ?? eventDate} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Description
          <input name="description" required maxLength={500} defaultValue={expense?.description ?? ""} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Vendor
          <input name="vendor" maxLength={200} defaultValue={expense?.vendor ?? ""} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Quantity
          <input name="quantity" type="number" min="0.001" max="9999999" step="0.001" required defaultValue={expense?.quantity ?? 1} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Unit cost (INR)
          <input name="unitCost" type="number" min="0" max="9999999999.99" step="0.01" required defaultValue={expense ? (expense.unit_cost / 100).toFixed(2) : ""} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Tax (INR)
          <input name="taxAmount" type="number" min="0" max="9999999999.99" step="0.01" required defaultValue={expense ? (expense.tax_amount / 100).toFixed(2) : "0.00"} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Paid to vendor (INR)
          <input name="amountPaid" type="number" min="0" max="9999999999.99" step="0.01" required defaultValue={expense ? (expense.amount_paid / 100).toFixed(2) : "0.00"} className={`${fields} mt-1`} />
        </label>
        <label className="block text-sm font-semibold">Payment mode
          <select name="paymentMode" defaultValue={expense?.payment_mode ?? ""} className={`${fields} mt-1`}>
            <option value="">Not recorded</option>
            {paymentModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Function
          <select name="functionId" value={selectedFunction} onChange={(event) => { setSelectedFunction(event.target.value); setSelectedItem(""); }} className={`${fields} mt-1`}>
            <option value="">Event-wide</option>
            {functions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Related item
          <select name="itemId" value={selectedItem} onChange={(event) => setSelectedItem(event.target.value)} className={`${fields} mt-1`}>
            <option value="">No item</option>
            {(itemsByFunction[selectedFunction] ?? []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm font-semibold">Notes
        <textarea name="notes" rows={3} maxLength={5000} defaultValue={expense?.notes ?? ""} className="mt-1 w-full rounded-radius-md border border-border-strong bg-surface p-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
      </label>
      {expense?.receipt_url && <a className="inline-flex min-h-11 items-center text-base font-semibold text-brand-strong underline" href={expense.receipt_url} target="_blank" rel="noreferrer noopener">View current receipt</a>}
      <label className="block text-sm font-semibold">Receipt (PNG, JPEG, WebP or PDF; max 10 MB)
        <input name="receipt" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="mt-1 block min-h-11 w-full text-base file:mr-3 file:min-h-11 file:rounded-radius-md file:border-0 file:bg-brand-soft file:px-3 file:font-semibold file:text-ink" />
      </label>
      <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving..." : expense ? "Save expense" : "Add expense"}</Button>
    </form>
  );
}

export function EventMoneyTab({
  eventId,
  eventDate,
  agreedTotal,
  payments,
  itemCosts,
  auditLogs,
  expenses,
  functions,
  itemsByFunction,
  quickAction = null,
}: EventMoneyTabProps) {
  const router = useRouter();
  const [localExpenses, setLocalExpenses] = useState<{
    source: AdminExpenseRecord[];
    rows: AdminExpenseRecord[];
  } | null>(null);
  const expenseRows = localExpenses?.source === expenses ? localExpenses.rows : expenses;
  const [editing, setEditing] = useState<AdminExpenseRecord | null>(null);
  const [showForm, setShowForm] = useState(quickAction === "expense");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const summary = calculateEventMoney(
    Math.round(agreedTotal * 100),
    payments.reduce((sum, payment) => sum + Math.round(Number(payment.amount) * 100), 0),
    expenseRows
  );
  const filteredExpenses = useMemo(() => expenseRows.filter((expense) => {
    const matchesText = `${expense.vendor} ${expense.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (category === "all" || expense.category === category) && (status === "all" || expense.status === status);
  }), [expenseRows, search, category, status]);

  const refreshAfterSave = () => {
    setShowForm(false);
    setEditing(null);
    router.refresh();
  };

  const removeExpense = async (expense: AdminExpenseRecord) => {
    if (!confirm(`Delete "${expense.description}" and its receipt?`)) return;
    setError(null);
    const result = await deleteEventExpenseAction(eventId, expense.id);
    if (!result.success) {
      setError(result.error ?? "Could not delete the expense.");
      return;
    }
    setLocalExpenses({
      source: expenses,
      rows: expenseRows.filter((item) => item.id !== expense.id),
    });
    router.refresh();
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Money out");
    sheet.columns = [
      { header: "Date", key: "date", width: 16 },
      { header: "Category", key: "category", width: 18 },
      { header: "Description", key: "description", width: 36 },
      { header: "Vendor", key: "vendor", width: 28 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Unit cost (paise)", key: "unitCost", width: 20 },
      { header: "Amount (paise)", key: "amount", width: 18 },
      { header: "Tax (paise)", key: "tax", width: 16 },
      { header: "Paid (paise)", key: "paid", width: 16 },
      { header: "Status", key: "status", width: 16 },
      { header: "Payment mode", key: "mode", width: 18 },
      { header: "Notes", key: "notes", width: 40 },
    ];
    for (const item of filteredExpenses) {
      sheet.addRow({
        date: item.expense_date,
        category: spreadsheetText(item.category),
        description: spreadsheetText(item.description),
        vendor: spreadsheetText(item.vendor),
        quantity: item.quantity,
        unitCost: item.unit_cost,
        amount: item.amount,
        tax: item.tax_amount,
        paid: item.amount_paid,
        status: spreadsheetText(item.status),
        mode: spreadsheetText(item.payment_mode),
        notes: spreadsheetText(item.notes),
      });
    }
    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `event-${eventId}-expenses.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    ["Agreed total", summary.agreedTotal],
    ["Payments recorded", summary.received],
    ["Total expenses", summary.totalExpenses],
    ["Paid to vendors", summary.paidToVendors],
    ["Owed to vendors", summary.owedToVendors],
    ["Profit", summary.profit],
  ] as const;

  return (
    <div className="event-money space-y-8 pb-16 md:pb-0">
      {error && <p role="alert" className="rounded-radius-md bg-danger-light p-3 text-base text-danger">{error}</p>}
      <section aria-label="Calculated event money summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, amount]) => (
          <article key={label} className="rounded-radius-lg border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5">
            <h2 className="text-sm font-semibold text-ink-muted">{label}</h2>
            <p className="mt-2 text-2xl font-bold text-ink">{money(amount)}</p>
            <p className="mt-1 text-xs text-ink-muted">Calculated from recorded amounts</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="expense-breakdown-title" className="rounded-radius-lg border border-border bg-surface p-4 sm:p-5">
        <h2 id="expense-breakdown-title" className="font-heading text-xl font-bold">Expenses by category</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((item) => (
            <div key={item} className="rounded-radius-md bg-bg p-3">
              <dt className="text-sm capitalize text-ink-muted">{item}</dt>
              <dd className="mt-1 font-semibold">{money(summary.byCategory[item])}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="money-in-title">
        <h2 id="money-in-title" className="mb-3 font-heading text-2xl font-bold">Money in · Payments from client</h2>
        <BudgetPaymentsTab
          eventId={eventId}
          initialAgreedTotal={agreedTotal}
          initialPayments={payments}
          items={itemCosts}
          auditLogs={auditLogs}
          showSummary={false}
          openAddOnMount={quickAction === "payment"}
        />
      </section>

      <section aria-labelledby="money-out-title" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="money-out-title" className="font-heading text-2xl font-bold">Money out · Vendor expenses</h2>
            <p className="mt-1 text-sm text-ink-muted">Amounts are stored as integer paise. Status is calculated from amount paid.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void exportExcel()}>Export to Excel</Button>
            <Button type="button" variant="primary" onClick={() => { setEditing(null); setShowForm(true); }} className="expense-add-fixed">Add expense</Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="block text-sm font-semibold">Search
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vendor or description" className="mt-1 min-h-11 w-full rounded-radius-md border border-border bg-surface px-3 text-base" />
          </label>
          <label className="block text-sm font-semibold">Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 min-h-11 w-full rounded-radius-md border border-border bg-surface px-3 text-base">
              <option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 min-h-11 w-full rounded-radius-md border border-border bg-surface px-3 text-base">
              <option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
            </select>
          </label>
        </div>

        {filteredExpenses.length ? (
          <ul className="space-y-3">
            {filteredExpenses.map((expense) => (
              <li key={expense.id} className="rounded-radius-lg border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-semibold">{expense.description}</h3>
                      <span className="rounded-radius-full bg-brand-soft px-3 py-1 text-sm font-semibold capitalize">{expense.status.replace("_", " ")}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{formatDate(expense.expense_date)} · {expense.category} · {expense.vendor || "No vendor"}</p>
                    <p className="mt-2 text-base">Total {money(expense.amount + expense.tax_amount)} / Paid {money(expense.amount_paid)} / Owed {money(expense.amount + expense.tax_amount - expense.amount_paid)}</p>
                    {expense.payment_mode && <p className="mt-1 text-sm text-ink-muted">Mode: {expense.payment_mode}</p>}
                    {expense.notes && <p className="mt-2 break-words text-sm text-ink-muted">{expense.notes}</p>}
                    {expense.receipt_url && <a href={expense.receipt_url} target="_blank" rel="noreferrer noopener" className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand-strong underline">View receipt</a>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" onClick={() => { setEditing(expense); setShowForm(true); }}>Edit</Button>
                    <Button type="button" variant="danger" onClick={() => void removeExpense(expense)}>Delete</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-radius-lg border border-border bg-surface p-6 text-base text-ink-muted">No expenses match these filters.</p>}
      </section>

      <Sheet open={showForm} title={editing ? "Edit expense" : "Add expense"} onClose={() => setShowForm(false)}>
        <ExpenseForm key={editing?.id ?? "new-expense"} eventId={eventId} eventDate={eventDate} functions={functions} itemsByFunction={itemsByFunction} expense={editing} onSaved={refreshAfterSave} />
      </Sheet>
    </div>
  );
}
