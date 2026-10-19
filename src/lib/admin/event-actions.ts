"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { createClient } from "@/lib/supabase/server";
import { parseMoneyToPaise } from "@/lib/admin/budget-calculations";

const idSchema = z.string().uuid();
const eventTypeSchema = z.enum(["wedding", "birthday", "function"]);
const eventStatusSchema = z.enum([
  "planning",
  "finalized",
  "completed",
  "cancelled",
]);
const functionDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((date) => {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date
    );
  });
const functionTimeSchema = z.string().refine((time) => {
  if (!time) return true;
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  return Boolean(
    match &&
      Number(match[1]) <= 23 &&
      Number(match[2]) <= 59 &&
      Number(match[3] ?? 0) <= 59
  );
});
const itemCategorySchema = z.enum([
  "lighting",
  "flowers",
  "decor",
  "instruments",
  "other",
]);
const itemStatusSchema = z.enum(["not_started", "in_progress", "done"]);

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export async function createEventAction(formData: FormData) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(200),
        type: eventTypeSchema,
        date: functionDateSchema,
        venue: z.string().trim().min(1).max(500),
        clientName: z.string().trim().max(200),
        clientPhone: z.string().trim().max(40),
        budgetTotalPaise: z.number().int().nonnegative().max(999_999_999_999),
      })
      .safeParse({
        name: text(formData, "name"),
        type: text(formData, "type") || "wedding",
        date: text(formData, "date"),
        venue: text(formData, "venue"),
        clientName: text(formData, "client_name"),
        clientPhone: text(formData, "client_phone"),
        budgetTotalPaise: parseMoneyToPaise(text(formData, "budgetTotal") || "0"),
      });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid event details." };
    }

    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        name: parsed.data.name,
        type: parsed.data.type,
        date: parsed.data.date,
        venue: parsed.data.venue,
        client_name: parsed.data.clientName || null,
        client_phone: parsed.data.clientPhone || null,
      })
      .select("id")
      .single();
    if (eventError) throw eventError;

    const { error: budgetError } = await supabase.from("budgets").insert({
      event_id: event.id,
      agreed_total: parsed.data.budgetTotalPaise / 100,
    });
    if (budgetError) {
      const { error: cleanupError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);
      if (cleanupError) {
        throw new Error(`${budgetError.message}; event cleanup failed: ${cleanupError.message}`);
      }
      throw budgetError;
    }

    revalidatePath("/admin/events");
    revalidatePath("/admin");
    return { success: true, eventId: event.id };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateEventStatusAction(
  eventId: string,
  status: "planning" | "finalized" | "completed" | "cancelled"
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({ eventId: idSchema, status: eventStatusSchema })
      .safeParse({ eventId, status });
    if (!parsed.success) {
      return { success: false, error: "Invalid event status request." };
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Event not found." };
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function addFunctionAction(eventId: string, formData: FormData) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        eventId: idSchema,
        name: z.string().trim().min(1).max(200),
        date: functionDateSchema,
        startTime: functionTimeSchema,
        notes: z.string().max(5000),
      })
      .safeParse({
        eventId,
        name: text(formData, "name"),
        date: text(formData, "date"),
        startTime: text(formData, "startTime"),
        notes: text(formData, "notes"),
      });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid function details." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_functions")
      .insert({
        event_id: parsed.data.eventId,
        name: parsed.data.name,
        date: parsed.data.date,
        start_time: parsed.data.startTime || null,
        notes: parsed.data.notes || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Could not create event function.");
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, functionId: data.id };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function addItemAction(
  functionId: string,
  eventId: string,
  formData: FormData
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        functionId: idSchema,
        eventId: idSchema,
        category: itemCategorySchema,
        title: z.string().trim().min(1).max(200),
        vendor: z.string().max(200),
        costPaise: z.number().int().nonnegative().max(999_999_999_999),
        status: itemStatusSchema,
        notes: z.string().max(5000),
      })
      .safeParse({
        functionId,
        eventId,
        category: text(formData, "category") || "decor",
        title: text(formData, "title"),
        vendor: text(formData, "vendor"),
        costPaise: parseMoneyToPaise(text(formData, "cost") || "0"),
        status: text(formData, "status") || "not_started",
        notes: text(formData, "notes"),
      });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid item details." };
    }

    const supabase = await createClient();
    const { data: eventFunction, error: functionError } = await supabase
      .from("event_functions")
      .select("id")
      .eq("id", parsed.data.functionId)
      .eq("event_id", parsed.data.eventId)
      .maybeSingle();
    if (functionError) throw functionError;
    if (!eventFunction) return { success: false, error: "Function not found for this event." };
    const { data, error } = await supabase
      .from("event_items")
      .insert({
        function_id: parsed.data.functionId,
        category: parsed.data.category,
        title: parsed.data.title,
        vendor: parsed.data.vendor || null,
        cost: parsed.data.costPaise / 100,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Could not create event item.");
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, itemId: data.id };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateItemStatusAction(
  itemId: string,
  eventId: string,
  newStatus: "not_started" | "in_progress" | "done"
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({ itemId: idSchema, eventId: idSchema, status: itemStatusSchema })
      .safeParse({ itemId, eventId, status: newStatus });
    if (!parsed.success) return { success: false, error: "Invalid item status request." };
    const supabase = await createClient();
    const { data: functions, error: functionsError } = await supabase
      .from("event_functions")
      .select("id")
      .eq("event_id", parsed.data.eventId);
    if (functionsError) throw functionsError;
    const functionIds = (functions ?? []).map((eventFunction) => eventFunction.id);
    if (!functionIds.length) return { success: false, error: "Item not found for this event." };
    const { data, error } = await supabase
      .from("event_items")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.itemId)
      .in("function_id", functionIds)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Item not found for this event." };
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateItemAction(
  itemId: string,
  eventId: string,
  formData: FormData
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        itemId: idSchema,
        eventId: idSchema,
        category: itemCategorySchema,
        title: z.string().trim().min(1).max(200),
        vendor: z.string().max(200),
        costPaise: z.number().int().nonnegative().max(999_999_999_999),
        notes: z.string().max(5000),
        status: itemStatusSchema,
      })
      .safeParse({
        itemId,
        eventId,
        category: text(formData, "category") || "decor",
        title: text(formData, "title"),
        vendor: text(formData, "vendor"),
        costPaise: parseMoneyToPaise(text(formData, "cost") || "0"),
        notes: text(formData, "notes"),
        status: text(formData, "status") || "not_started",
      });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid item details." };
    }

    const supabase = await createClient();
    const { data: functions, error: functionsError } = await supabase
      .from("event_functions")
      .select("id")
      .eq("event_id", parsed.data.eventId);
    if (functionsError) throw functionsError;
    const functionIds = (functions ?? []).map((eventFunction) => eventFunction.id);
    if (!functionIds.length) return { success: false, error: "Item not found for this event." };
    const { data, error } = await supabase
      .from("event_items")
      .update({
        category: parsed.data.category,
        title: parsed.data.title,
        vendor: parsed.data.vendor || null,
        cost: parsed.data.costPaise / 100,
        notes: parsed.data.notes || null,
        status: parsed.data.status,
      })
      .eq("id", parsed.data.itemId)
      .in("function_id", functionIds)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Item not found for this event." };
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteItemAction(itemId: string, eventId: string) {
  try {
    await verifyAdminCaller();
    const parsed = z.object({ itemId: idSchema, eventId: idSchema }).safeParse({ itemId, eventId });
    if (!parsed.success) return { success: false, error: "Invalid item deletion request." };
    const supabase = await createClient();
    const { data: functions, error: functionsError } = await supabase
      .from("event_functions")
      .select("id")
      .eq("event_id", parsed.data.eventId);
    if (functionsError) throw functionsError;
    const functionIds = (functions ?? []).map((eventFunction) => eventFunction.id);
    if (!functionIds.length) return { success: false, error: "Item not found for this event." };
    const { data, error } = await supabase
      .from("event_items")
      .delete()
      .eq("id", parsed.data.itemId)
      .in("function_id", functionIds)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Item not found for this event." };
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateFunctionAction(
  functionId: string,
  eventId: string,
  formData: FormData
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        functionId: idSchema,
        eventId: idSchema,
        name: z.string().trim().min(1).max(200),
        date: functionDateSchema,
        startTime: functionTimeSchema,
        notes: z.string().max(5000),
      })
      .safeParse({
        functionId,
        eventId,
        name: text(formData, "name"),
        date: text(formData, "date"),
        startTime: text(formData, "startTime"),
        notes: text(formData, "notes"),
      });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid function details." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_functions")
      .update({
        name: parsed.data.name,
        date: parsed.data.date,
        start_time: parsed.data.startTime || null,
        notes: parsed.data.notes || null,
      })
      .eq("id", parsed.data.functionId)
      .eq("event_id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Function not found for this event." };
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteFunctionAction(functionId: string, eventId: string) {
  try {
    await verifyAdminCaller();
    const parsed = z.object({ functionId: idSchema, eventId: idSchema }).safeParse({ functionId, eventId });
    if (!parsed.success) return { success: false, error: "Invalid function deletion request." };
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_functions")
      .delete()
      .eq("id", parsed.data.functionId)
      .eq("event_id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Function not found for this event." };
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateEventDetailsAction(
  eventId: string,
  formData: FormData
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        eventId: idSchema,
        name: z.string().trim().min(1).max(200),
        type: eventTypeSchema,
        date: functionDateSchema,
        venue: z.string().trim().min(1).max(500),
        clientName: z.string().trim().max(200),
        clientPhone: z.string().trim().max(40),
      })
      .safeParse({
        eventId,
        name: text(formData, "name"),
        type: text(formData, "type") || "wedding",
        date: text(formData, "date"),
        venue: text(formData, "venue"),
        clientName: text(formData, "client_name"),
        clientPhone: text(formData, "client_phone"),
      });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid event details." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .update({
        name: parsed.data.name,
        type: parsed.data.type,
        date: parsed.data.date,
        venue: parsed.data.venue,
        client_name: parsed.data.clientName || null,
        client_phone: parsed.data.clientPhone || null,
      })
      .eq("id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Event not found." };
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }

}

export async function deleteEventAction(eventId: string) {
  try {
    await verifyAdminCaller();
    const parsed = idSchema.safeParse(eventId);
    if (!parsed.success) return { success: false, error: "Invalid event ID." };
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", parsed.data)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: "Event not found." };
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
  }
}
