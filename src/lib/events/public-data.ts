import { createClient } from "../supabase/server";
import type { AdminFunction } from "../admin/data";

export interface PublicEventShowcase {
  id: string;
  name: string;
  type: "wedding" | "birthday" | "function";
  date: string;
  venue: string;
  status: "planning" | "finalized" | "completed" | "cancelled";
  customer_name?: string;
  functions: AdminFunction[];
}

export async function getPublicEventShowcase(
  id: string
): Promise<PublicEventShowcase | null> {
  const supabase = await createClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,name,type,date,venue,status")
    .eq("id", id)
    .maybeSingle();
  if (eventError) throw new Error(eventError.message);
  if (!event || (event.status !== "finalized" && event.status !== "completed")) {
    return null;
  }

  const { data: functions, error: functionsError } = await supabase
    .from("event_functions")
    .select("id,event_id,name,date,start_time,notes")
    .eq("event_id", id)
    .order("date", { ascending: true });
  if (functionsError) throw new Error(functionsError.message);

  return {
    id: event.id,
    name: event.name,
    type: event.type,
    date: event.date,
    venue: event.venue,
    status: event.status,
    customer_name: "Special Host",
    functions,
  };
}
