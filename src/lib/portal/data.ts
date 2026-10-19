import { createClient } from "@/lib/supabase/server";
import type {
  AdminEventSummary,
  AdminFunction,
  AdminItem,
} from "@/lib/admin/data";
import type { PaymentRecord } from "@/lib/admin/budget-calculations";

export interface PortalData {
  event: AdminEventSummary | null;
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
  payments: PaymentRecord[];
  agreedTotal: number;
  totalPaid: number;
}

export async function getPortalDataForCustomer(
  userId: string
): Promise<PortalData> {
  const supabase = await createClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id,name,type,date,venue,status,customer_id,show_payments_to_customer"
    )
    .eq("customer_id", userId)
    .maybeSingle();
  if (eventError) throw new Error(eventError.message);

  if (!event) {
    return {
      event: null,
      functions: [],
      itemsByFunction: {},
      payments: [],
      agreedTotal: 0,
      totalPaid: 0,
    };
  }

  const { data: functions, error: functionsError } = await supabase
    .from("event_functions")
    .select("id,event_id,name,date,start_time,notes")
    .eq("event_id", event.id)
    .order("date", { ascending: true });
  if (functionsError) throw new Error(functionsError.message);

  let agreedTotal = 0;
  let totalPaid = 0;
  if (event.show_payments_to_customer) {
    const { data: summary, error: summaryError } = await supabase
      .from("customer_event_financial_summary")
      .select("agreed_total,total_paid")
      .eq("event_id", event.id)
      .maybeSingle();
    if (summaryError) throw new Error(summaryError.message);
    agreedTotal = Number(summary?.agreed_total ?? 0);
    totalPaid = Number(summary?.total_paid ?? 0);
  }

  return {
    event: {
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      venue: event.venue,
      status: event.status,
      customer_id: event.customer_id,
      show_payments_to_customer: event.show_payments_to_customer,
    },
    functions,
    itemsByFunction: {},
    payments: [],
    agreedTotal,
    totalPaid,
  };
}
