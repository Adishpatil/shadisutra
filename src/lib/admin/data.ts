import { createClient } from "@/lib/supabase/server";
import type { PaymentRecord } from "./budget-calculations";

export interface AdminEventSummary {
  id: string;
  name: string;
  type: "wedding" | "birthday" | "function";
  date: string;
  venue: string;
  client_name: string | null;
  client_phone: string | null;
  status: "planning" | "finalized" | "completed" | "cancelled";
  total_functions?: number;
  total_items?: number;
  pending_items?: number;
  budget_total?: number;
  total_paid?: number;
}

export interface AdminFunction {
  id: string;
  event_id: string;
  name: string;
  date: string;
  start_time: string | null;
  notes: string | null;
}

export interface AdminItem {
  id: string;
  function_id: string;
  category: "lighting" | "flowers" | "decor" | "instruments" | "other";
  title: string;
  vendor: string | null;
  status: "not_started" | "in_progress" | "done";
  cost: number;
  notes: string | null;
}

export interface AdminEnquiry {
  id: string;
  name: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  message: string;
  created_at: string;
}

function throwOnError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function requireData<T>(data: T | null, message: string): T {
  if (data === null) throw new Error(message);
  return data;
}

export async function getAdminEvents(): Promise<AdminEventSummary[]> {
  const supabase = await createClient();
  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  throwOnError(eventError);
  const eventRows = requireData(events, "Could not load events.");

  if (!eventRows.length) return [];

  const eventIds = eventRows.map((event) => event.id);
  const [functionsResult, budgetsResult, paymentsResult] = await Promise.all([
      supabase.from("event_functions").select("id,event_id").in("event_id", eventIds),
      supabase.from("budgets").select("event_id,agreed_total").in("event_id", eventIds),
      supabase.from("payments").select("event_id,amount").in("event_id", eventIds),
    ]);
  throwOnError(functionsResult.error);
  throwOnError(budgetsResult.error);
  throwOnError(paymentsResult.error);

  const eventFunctions = requireData(
    functionsResult.data,
    "Could not load event functions."
  );
  const functionIds = eventFunctions.map((eventFunction) => eventFunction.id);
  const { data: items, error: itemsError } = functionIds.length
    ? await supabase
        .from("event_items")
        .select("function_id,status")
        .in("function_id", functionIds)
    : { data: [], error: null };
  throwOnError(itemsError);

  const functionCounts = new Map<string, number>();
  const budgetsByEventPaise = new Map<string, number>();
  const paidByEventPaise = new Map<string, number>();
  const itemsByFunction = new Map<string, number>();
  const pendingItemsByFunction = new Map<string, number>();

  for (const eventFunction of functionsResult.data ?? []) {
    functionCounts.set(
      eventFunction.event_id,
      (functionCounts.get(eventFunction.event_id) ?? 0) + 1
    );
  }
  for (const budget of budgetsResult.data ?? []) {
    budgetsByEventPaise.set(
      budget.event_id,
      Math.round(Number(budget.agreed_total) * 100)
    );
  }
  for (const payment of paymentsResult.data ?? []) {
    paidByEventPaise.set(
      payment.event_id,
      (paidByEventPaise.get(payment.event_id) ?? 0) +
        Math.round(Number(payment.amount) * 100)
    );
  }
  for (const item of items ?? []) {
    itemsByFunction.set(
      item.function_id,
      (itemsByFunction.get(item.function_id) ?? 0) + 1
    );
    if (item.status !== "done") {
      pendingItemsByFunction.set(
        item.function_id,
        (pendingItemsByFunction.get(item.function_id) ?? 0) + 1
      );
    }
  }

  const eventIdByFunction = new Map(
    eventFunctions.map((eventFunction) => [
      eventFunction.id,
      eventFunction.event_id,
    ])
  );
  const itemTotalsByEvent = new Map<string, { total: number; pending: number }>();
  for (const [functionId, count] of itemsByFunction) {
    const eventId = eventIdByFunction.get(functionId);
    if (!eventId) continue;
    const totals = itemTotalsByEvent.get(eventId) ?? { total: 0, pending: 0 };
    totals.total += count;
    totals.pending += pendingItemsByFunction.get(functionId) ?? 0;
    itemTotalsByEvent.set(eventId, totals);
  }

  return eventRows.map((event) => {
    const itemTotals = itemTotalsByEvent.get(event.id);
    return {
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      venue: event.venue,
      client_name: event.client_name,
      client_phone: event.client_phone,
      status: event.status,
      total_functions: functionCounts.get(event.id) ?? 0,
      total_items: itemTotals?.total ?? 0,
      pending_items: itemTotals?.pending ?? 0,
      budget_total: (budgetsByEventPaise.get(event.id) ?? 0) / 100,
      total_paid: (paidByEventPaise.get(event.id) ?? 0) / 100,
    };
  });
}

export async function getAdminEventById(id: string): Promise<{
  event: AdminEventSummary | null;
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
}> {
  const supabase = await createClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwOnError(eventError);
  if (!event) return { event: null, functions: [], itemsByFunction: {} };

  const functionsResult = await supabase
      .from("event_functions")
      .select("*")
      .eq("event_id", id)
      .order("date", { ascending: true });
  throwOnError(functionsResult.error);
  const functionRows = requireData(
    functionsResult.data,
    "Could not load event functions."
  );

  const functions: AdminFunction[] = functionRows.map((eventFunction) => ({
    id: eventFunction.id,
    event_id: eventFunction.event_id,
    name: eventFunction.name,
    date: eventFunction.date,
    start_time: eventFunction.start_time,
    notes: eventFunction.notes,
  }));
  const functionIds = functions.map((eventFunction) => eventFunction.id);
  const { data: items, error: itemsError } = functionIds.length
    ? await supabase
        .from("event_items")
        .select("*")
        .in("function_id", functionIds)
    : { data: [], error: null };
  throwOnError(itemsError);

  const itemsByFunction: Record<string, AdminItem[]> = {};
  for (const item of items ?? []) {
    const functionItems = itemsByFunction[item.function_id] ?? [];
    functionItems.push({
      id: item.id,
      function_id: item.function_id,
      category: item.category,
      title: item.title,
      vendor: item.vendor,
      status: item.status,
      cost: Number(item.cost),
      notes: item.notes,
    });
    itemsByFunction[item.function_id] = functionItems;
  }

  return {
    event: {
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      venue: event.venue,
      client_name: event.client_name,
      client_phone: event.client_phone,
      status: event.status,
    },
    functions,
    itemsByFunction,
  };
}

export async function getAdminEnquiries(): Promise<AdminEnquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("id,name,phone,event_type,event_date,message,created_at")
    .order("created_at", { ascending: false });
  throwOnError(error);
  return requireData(data, "Could not load enquiries.");
}

export interface AuditLogItem {
  id: string;
  action: string;
  table_name: string;
  at: string;
  payload: Record<string, unknown> | null;
}

export async function getEventBudgetAndPayments(eventId: string): Promise<{
  agreedTotal: number;
  payments: PaymentRecord[];
  auditLogs: AuditLogItem[];
}> {
  const supabase = await createClient();
  const [budgetResult, paymentsResult, auditResult] = await Promise.all([
    supabase
      .from("budgets")
      .select("agreed_total")
      .eq("event_id", eventId)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id,amount,paid_on,mode,note")
      .eq("event_id", eventId)
      .order("paid_on", { ascending: false }),
    supabase
      .from("audit_log")
      .select("id,action,table_name,at,payload")
      .contains("payload", { event_id: eventId })
      .order("at", { ascending: false })
      .limit(20),
  ]);
  throwOnError(budgetResult.error);
  throwOnError(paymentsResult.error);
  throwOnError(auditResult.error);
  const paymentRows = requireData(paymentsResult.data, "Could not load payments.");
  const auditRows = requireData(auditResult.data, "Could not load audit logs.");

  return {
    agreedTotal: Number(budgetResult.data?.agreed_total ?? 0),
    payments: paymentRows.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      paid_on: payment.paid_on,
      mode: payment.mode,
      note: payment.note,
    })),
    auditLogs: auditRows.map((audit) => ({
      id: audit.id,
      action: audit.action,
      table_name: audit.table_name,
      at: audit.at,
      payload:
        audit.payload && typeof audit.payload === "object" && !Array.isArray(audit.payload)
          ? audit.payload
          : null,
    })),
  };
}
