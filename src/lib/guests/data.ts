import { createClient } from "@/lib/supabase/server";
import type { GuestRow } from "@/lib/guests/guest-engine";

export interface GuestRecord extends GuestRow {
  id: string;
  event_id: string;
}

export async function getEventGuests(eventId: string): Promise<GuestRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guests")
    .select("id,event_id,name,party_size,phone,rsvp,table_no,notes")
    .eq("event_id", eventId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
