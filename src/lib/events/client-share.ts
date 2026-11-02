import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesignFileKind } from "@/lib/admin/design-storage";
import { eventShareTokenSchema } from "@/lib/events/public-share";

const activeTokenSchema = eventShareTokenSchema;

export interface ClientShareRecord {
  id: string;
  event_id: string;
  token: string;
  pin_hash: string | null;
  expires_at: string;
}

export async function getActiveClientLink(rawToken: string): Promise<ClientShareRecord | null> {
  const parsed = activeTokenSchema.safeParse(rawToken);
  if (!parsed.success) return null;
  const { data, error } = await createAdminClient()
    .from("event_client_links")
    .select("id,event_id,token,pin_hash,expires_at")
    .eq("token", parsed.data)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error("Could not validate client link.");
  return data;
}

export interface ClientShareView {
  event: { name: string; date: string; venue: string };
  functions: Array<{ id: string; name: string; date: string; start_time: string | null }>;
  timeline: Array<{ starts_at: string; title: string }>;
  items: Array<{ id: string; function_id: string; title: string; status: string }>;
  designs: Array<{ id: string; title: string; version: number; url: string }>;
  guests: Array<{ name: string; party_size: number; rsvp: string; table_no: string | null }>;
  payments: null | {
    agreed_total: number;
    total_received: number;
    history: Array<{ amount: number; paid_on: string; mode: string }>;
  };
}

export async function getClientShareView(
  link: ClientShareRecord
): Promise<ClientShareView | null> {
  const supabase = createAdminClient();
  const [eventResult, functionResult, timelineResult, guestResult] = await Promise.all([
    supabase
      .from("events")
      .select("name,date,venue,show_payments_to_customer")
      .eq("id", link.event_id)
      .maybeSingle(),
    supabase
      .from("event_functions")
      .select("id,name,date,start_time")
      .eq("event_id", link.event_id)
      .order("date", { ascending: true }),
    supabase
      .from("timeline_entries")
      .select("starts_at,title")
      .eq("event_id", link.event_id)
      .order("starts_at", { ascending: true }),
    supabase
      .from("guests")
      .select("name,party_size,rsvp,table_no")
      .eq("event_id", link.event_id)
      .order("name", { ascending: true }),
  ]);
  if (eventResult.error || functionResult.error || timelineResult.error || guestResult.error) {
    throw new Error("Could not load client event details.");
  }
  if (!eventResult.data) return null;

  const functionIds = functionResult.data.map((item) => item.id);
  const [itemsResult, designsResult] = await Promise.all([
    functionIds.length
      ? supabase
          .from("event_items")
          .select("id,function_id,title,status")
          .in("function_id", functionIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("designs")
      .select("id,title,file_path,version,event_id")
      .eq("event_id", link.event_id)
      .eq("is_finalized", true)
      .order("created_at", { ascending: false }),
  ]);
  if (itemsResult.error || designsResult.error) {
    throw new Error("Could not load client event details.");
  }

  const designs = await Promise.all(designsResult.data.map(async (design) => {
    if (!getDesignFileKind(design.file_path, link.event_id, design.id)) {
      throw new Error("Invalid finalized design path.");
    }
    const { data, error } = await supabase.storage
      .from("event-files")
      .createSignedUrl(design.file_path, 300);
    if (error) throw new Error("Could not sign finalized design.");
    return { id: design.id, title: design.title, version: design.version, url: data.signedUrl };
  }));

  let payments: ClientShareView["payments"] = null;
  if (eventResult.data.show_payments_to_customer) {
    const [budgetResult, paymentResult] = await Promise.all([
      supabase.from("budgets").select("agreed_total").eq("event_id", link.event_id).maybeSingle(),
      supabase
        .from("payments")
        .select("amount,paid_on,mode")
        .eq("event_id", link.event_id)
        .order("paid_on", { ascending: false }),
    ]);
    if (budgetResult.error || paymentResult.error) {
      throw new Error("Could not load client payment summary.");
    }
    const history = paymentResult.data.map((payment) => ({
      amount: Math.round(Number(payment.amount) * 100),
      paid_on: payment.paid_on,
      mode: payment.mode,
    }));
    payments = {
      agreed_total: Math.round(Number(budgetResult.data?.agreed_total ?? 0) * 100),
      total_received: history.reduce((sum, item) => sum + item.amount, 0),
      history,
    };
  }

  return {
    event: {
      name: eventResult.data.name,
      date: eventResult.data.date,
      venue: eventResult.data.venue,
    },
    functions: functionResult.data,
    timeline: timelineResult.data,
    items: itemsResult.data,
    designs,
    guests: guestResult.data,
    payments,
  };
}

export function validClientShareToken(token: string): boolean {
  return z.string().regex(/^[A-Za-z0-9_-]{32}$/).safeParse(token).success;
}
