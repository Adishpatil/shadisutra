"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GuestRow, guestRowSchema } from "@/lib/guests/guest-engine";
import { z } from "zod";

/**
 * Server action to add a single guest
 */
export async function addGuestAction(
  eventId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validEventId = z.string().uuid().safeParse(eventId);
    if (!validEventId.success) return { success: false, error: "Invalid event ID." };
    const rawData = {
      name: formData.get("name"),
      party_size: formData.get("party_size"),
      phone: formData.get("phone") || null,
      rsvp: formData.get("rsvp") || "pending",
      table_no: formData.get("table_no") || null,
      notes: formData.get("notes") || null,
    };

    const parsed = guestRowSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("guests").insert({
      event_id: validEventId.data,
      name: parsed.data.name,
      party_size: parsed.data.party_size,
      phone: parsed.data.phone,
      rsvp: parsed.data.rsvp,
      table_no: parsed.data.table_no,
      notes: parsed.data.notes,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add guest." };
  }
}

/**
 * Server action to batch insert validated guests from CSV or Excel import
 */
export async function importGuestsAction(
  eventId: string,
  guests: GuestRow[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const validEventId = z.string().uuid().safeParse(eventId);
    if (!validEventId.success) {
      return { success: false, count: 0, error: "Invalid event ID." };
    }
    const parsedGuests = z.array(guestRowSchema).max(2000).safeParse(guests);
    if (!parsedGuests.success) {
      return {
        success: false,
        count: 0,
        error: parsedGuests.error.issues[0]?.message ?? "Invalid guest rows.",
      };
    }
    if (parsedGuests.data.length === 0) {
      return { success: false, count: 0, error: "No guest rows to import" };
    }

    const supabase = await createClient();
    const rowsToInsert = parsedGuests.data.map((g) => ({
      event_id: validEventId.data,
      name: g.name,
      party_size: g.party_size,
      phone: g.phone || null,
      rsvp: g.rsvp || "pending",
      table_no: g.table_no || null,
      notes: g.notes || null,
    }));

    const { error } = await supabase.from("guests").insert(rowsToInsert);

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, count: rowsToInsert.length };
  } catch (err: unknown) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : "Batch import failed." };
  }
}

/**
 * Server action to delete a guest
 */
export async function deleteGuestAction(
  eventId: string,
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const input = z
      .object({ eventId: z.string().uuid(), guestId: z.string().uuid() })
      .safeParse({ eventId, guestId });
    if (!input.success) return { success: false, error: "Invalid guest deletion request." };
    const supabase = await createClient();
    const { error } = await supabase
      .from("guests")
      .delete()
      .eq("id", input.data.guestId)
      .eq("event_id", input.data.eventId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete guest." };
  }
}
