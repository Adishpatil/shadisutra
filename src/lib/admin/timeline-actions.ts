"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { createClient } from "@/lib/supabase/server";

const uuidSchema = z.string().uuid();
const timelineInputSchema = z.object({
  eventId: uuidSchema,
  functionId: uuidSchema.nullable(),
  startsAt: z.string().datetime({ offset: true }),
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(5000),
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

async function verifyFunctionForEvent(
  eventId: string,
  functionId: string | null
): Promise<boolean> {
  if (!functionId) return true;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_functions")
    .select("id")
    .eq("id", functionId)
    .eq("event_id", eventId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function createTimelineEntryAction(input: {
  eventId: string;
  functionId: string | null;
  startsAt: string;
  title: string;
  notes: string;
}) {
  try {
    await verifyAdminCaller();
    const parsed = timelineInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid timeline entry." };
    }
    if (!(await verifyFunctionForEvent(parsed.data.eventId, parsed.data.functionId))) {
      return { success: false, error: "Choose a function from this event." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("timeline_entries")
      .insert({
        event_id: parsed.data.eventId,
        function_id: parsed.data.functionId,
        starts_at: parsed.data.startsAt,
        title: parsed.data.title,
        notes: parsed.data.notes || null,
      })
      .select("id,event_id,function_id,starts_at,title,notes")
      .single();
    if (error) throw error;
    if (!data) return { success: false, error: "Could not create timeline entry." };
    revalidatePath(`/admin/events/${parsed.data.eventId}`);
    return { success: true, entry: data };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateTimelineEntryAction(input: {
  entryId: string;
  eventId: string;
  functionId: string | null;
  startsAt: string;
  title: string;
  notes: string;
}) {
  try {
    await verifyAdminCaller();
    const parsed = timelineInputSchema
      .extend({ entryId: uuidSchema })
      .safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid timeline entry." };
    }
    if (!(await verifyFunctionForEvent(parsed.data.eventId, parsed.data.functionId))) {
      return { success: false, error: "Choose a function from this event." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("timeline_entries")
      .update({
        function_id: parsed.data.functionId,
        starts_at: parsed.data.startsAt,
        title: parsed.data.title,
        notes: parsed.data.notes || null,
      })
      .eq("id", parsed.data.entryId)
      .eq("event_id", parsed.data.eventId)
      .select("id,event_id,function_id,starts_at,title,notes")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Timeline entry not found." };
    revalidatePath(`/admin/events/${parsed.data.eventId}`);
    return { success: true, entry: data };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteTimelineEntryAction(entryId: string, eventId: string) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({ entryId: uuidSchema, eventId: uuidSchema })
      .safeParse({ entryId, eventId });
    if (!parsed.success) return { success: false, error: "Invalid timeline deletion request." };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("timeline_entries")
      .delete()
      .eq("id", parsed.data.entryId)
      .eq("event_id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Timeline entry not found." };
    revalidatePath(`/admin/events/${parsed.data.eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}
