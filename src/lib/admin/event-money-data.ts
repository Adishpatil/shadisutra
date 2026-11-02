import "server-only";

import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { createClient } from "@/lib/supabase/server";

export interface AdminExpenseRecord {
  id: string;
  event_id: string;
  function_id: string | null;
  item_id: string | null;
  category: "lighting" | "flowers" | "decor" | "instruments" | "venue" | "food" | "staff" | "travel" | "other";
  expense_date: string;
  vendor: string;
  description: string;
  quantity: number;
  unit_cost: number;
  amount: number;
  tax_amount: number;
  status: "unpaid" | "part_paid" | "paid";
  amount_paid: number;
  payment_mode: string | null;
  notes: string | null;
  receipt_url: string | null;
}

export async function getEventMoneyRecords(eventId: string): Promise<AdminExpenseRecord[]> {
  await verifyAdminCaller();
  const supabase = await createClient();
  const { data, error } = await supabase.from("event_expenses")
    .select("id,event_id,function_id,item_id,category,expense_date,vendor,description,quantity,unit_cost,amount,tax_amount,status,amount_paid,payment_mode,notes,receipt_path")
    .eq("event_id", eventId)
    .order("expense_date", { ascending: false });
  if (error) throw new Error("Could not load event expenses.");
  return Promise.all(data.map(async (row) => {
    let receiptUrl: string | null = null;
    if (row.receipt_path) {
      if (!row.receipt_path.startsWith(`${eventId}/${row.id}/`)) {
        throw new Error("Invalid expense receipt path.");
      }
      const { data: signed, error: signingError } = await supabase.storage
        .from("event-files")
        .createSignedUrl(row.receipt_path, 300);
      if (signingError) throw new Error("Could not create receipt preview link.");
      receiptUrl = signed.signedUrl;
    }
    return {
      id: row.id,
      event_id: row.event_id,
      function_id: row.function_id,
      item_id: row.item_id,
      category: row.category,
      expense_date: row.expense_date,
      vendor: row.vendor,
      description: row.description,
      quantity: Number(row.quantity),
      unit_cost: Number(row.unit_cost),
      amount: Number(row.amount),
      tax_amount: Number(row.tax_amount),
      status: row.status,
      amount_paid: Number(row.amount_paid),
      payment_mode: row.payment_mode,
      notes: row.notes,
      receipt_url: receiptUrl,
    };
  }));
}

export interface AdminMoneyOverviewRow {
  eventId: string;
  eventName: string;
  eventDate: string;
  agreedTotal: number;
  received: number;
  expenses: number;
  profit: number;
}

export async function getAdminMoneyOverview(): Promise<AdminMoneyOverviewRow[]> {
  await verifyAdminCaller();
  const supabase = await createClient();
  const [eventsResult, budgetsResult, paymentsResult, expensesResult] = await Promise.all([
    supabase.from("events").select("id,name,date").order("date", { ascending: true }),
    supabase.from("budgets").select("event_id,agreed_total"),
    supabase.from("payments").select("event_id,amount"),
    supabase.from("event_expenses").select("event_id,amount,tax_amount"),
  ]);
  if (eventsResult.error || budgetsResult.error || paymentsResult.error || expensesResult.error) {
    throw new Error("Could not load money overview.");
  }
  const budgets = new Map((budgetsResult.data ?? []).map((row) => [row.event_id, Math.round(Number(row.agreed_total) * 100)]));
  const received = new Map<string, number>();
  const expenses = new Map<string, number>();
  for (const payment of paymentsResult.data ?? []) {
    received.set(payment.event_id, (received.get(payment.event_id) ?? 0) + Math.round(Number(payment.amount) * 100));
  }
  for (const expense of expensesResult.data ?? []) {
    expenses.set(expense.event_id, (expenses.get(expense.event_id) ?? 0) + Number(expense.amount) + Number(expense.tax_amount));
  }
  return (eventsResult.data ?? []).map((event) => {
    const agreedTotal = budgets.get(event.id) ?? 0;
    const totalExpenses = expenses.get(event.id) ?? 0;
    return {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      agreedTotal,
      received: received.get(event.id) ?? 0,
      expenses: totalExpenses,
      profit: agreedTotal - totalExpenses,
    };
  });
}
