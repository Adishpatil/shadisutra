"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { guestRowSchema } from "@/lib/guests/guest-engine";
import { createClient } from "@/lib/supabase/server";

const uuidSchema = z.string().uuid();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function guestFormSchema(formData: FormData) {
  return guestRowSchema.safeParse({
    name: formData.get("name"),
    party_size: formData.get("party_size"),
    phone: formData.get("phone") || null,
    rsvp: formData.get("rsvp") || "pending",
    table_no: formData.get("table_no") || null,
    notes: formData.get("notes") || null,
  });
}

export async function addGuestAction(
  eventId: string,
  formData: FormData
): Promise<{ success: true; guest: { id: string; event_id: string } } | { success: false; error: string }> {
  try {
    await verifyAdminCaller();
    const parsedEventId = uuidSchema.safeParse(eventId);
    if (!parsedEventId.success) return { success: false, error: "Invalid event ID." };
    const parsedGuest = guestFormSchema(formData);
    if (!parsedGuest.success) {
      return { success: false, error: parsedGuest.error.issues[0]?.message ?? "Invalid guest details." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guests")
      .insert({
        event_id: parsedEventId.data,
        ...parsedGuest.data,
      })
      .select("id,event_id")
      .single();
    if (error) throw error;

    revalidatePath(`/admin/events/${parsedEventId.data}`);
    return { success: true, guest: data };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateGuestAction(
  eventId: string,
  guestId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdminCaller();
    const ids = z
      .object({ eventId: uuidSchema, guestId: uuidSchema })
      .safeParse({ eventId, guestId });
    if (!ids.success) return { success: false, error: "Invalid guest update request." };
    const parsedGuest = guestFormSchema(formData);
    if (!parsedGuest.success) {
      return { success: false, error: parsedGuest.error.issues[0]?.message ?? "Invalid guest details." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guests")
      .update(parsedGuest.data)
      .eq("id", ids.data.guestId)
      .eq("event_id", ids.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Guest not found." };

    revalidatePath(`/admin/events/${ids.data.eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function importGuestsAction(
  eventId: string,
  guests: unknown
): Promise<
  | { success: true; guests: Array<{ id: string; event_id: string; name: string; party_size: number; phone: string | null; rsvp: "pending" | "yes" | "no"; table_no: string | null; notes: string | null }> }
  | { success: false; count: 0; error: string }
> {
  try {
    await verifyAdminCaller();
    const parsedEventId = uuidSchema.safeParse(eventId);
    if (!parsedEventId.success) {
      return { success: false, count: 0, error: "Invalid event ID." };
    }
    const parsedGuests = z.array(guestRowSchema).min(1).max(2000).safeParse(guests);
    if (!parsedGuests.success) {
      return {
        success: false,
        count: 0,
        error: parsedGuests.error.issues[0]?.message ?? "Invalid guest rows.",
      };
    }

    const supabase = await createClient();
    const rowsToInsert = parsedGuests.data.map((guest) => ({
      event_id: parsedEventId.data,
      name: guest.name,
      party_size: guest.party_size,
      phone: guest.phone || null,
      rsvp: guest.rsvp,
      table_no: guest.table_no || null,
      notes: guest.notes || null,
    }));
    const { data, error } = await supabase
      .from("guests")
      .insert(rowsToInsert)
      .select("id,event_id,name,party_size,phone,rsvp,table_no,notes");
    if (error) throw error;

    revalidatePath(`/admin/events/${parsedEventId.data}`);
    return { success: true, guests: data };
  } catch (error: unknown) {
    return { success: false, count: 0, error: errorMessage(error) };
  }
}

export async function deleteGuestAction(
  eventId: string,
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdminCaller();
    const ids = z
      .object({ eventId: uuidSchema, guestId: uuidSchema })
      .safeParse({ eventId, guestId });
    if (!ids.success) return { success: false, error: "Invalid guest deletion request." };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guests")
      .delete()
      .eq("id", ids.data.guestId)
      .eq("event_id", ids.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Guest not found." };

    revalidatePath(`/admin/events/${ids.data.eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}
