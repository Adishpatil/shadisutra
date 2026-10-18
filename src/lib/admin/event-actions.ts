"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Helper to verify caller is admin
 */
async function verifyAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, access_enabled")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.access_enabled) {
    throw new Error("Forbidden: Admin privileges required.");
  }

  return user;
}

/**
 * Create a new Event
 */
export async function createEventAction(formData: FormData) {
  try {
    await verifyAdminCaller();

    const name = formData.get("name")?.toString() || "";
    const type = (formData.get("type")?.toString() || "wedding") as "wedding" | "birthday" | "function";
    const date = formData.get("date")?.toString() || "";
    const venue = formData.get("venue")?.toString() || "";
    const customerId = formData.get("customerId")?.toString() || null;
    const showPayments = formData.get("showPayments") === "true";
    const budgetTotal = parseFloat(formData.get("budgetTotal")?.toString() || "0") || 0;

    if (!name || !date || !venue) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const adminSupabase = createAdminClient();

    const { data: newEvent, error: eventErr } = await adminSupabase
      .from("events")
      .insert({
        name,
        type,
        date,
        venue,
        customer_id: customerId || null,
        show_payments_to_customer: showPayments,
        status: "planning",
      })
      .select()
      .single();

    if (eventErr || !newEvent) {
      return { success: false, error: eventErr?.message || "Failed to create event." };
    }

    // Initialize budget record
    await adminSupabase.from("budgets").insert({
      event_id: newEvent.id,
      agreed_total: budgetTotal,
    });

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { success: true, eventId: newEvent.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create event." };
  }
}

/**
 * Update Event Status
 */
export async function updateEventStatusAction(
  eventId: string,
  status: "planning" | "finalized" | "completed" | "cancelled"
) {
  try {
    await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("events")
      .update({ status })
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Add a Function (sub-event)
 */
export async function addFunctionAction(eventId: string, formData: FormData) {
  try {
    await verifyAdminCaller();

    const name = formData.get("name")?.toString() || "";
    const date = formData.get("date")?.toString() || "";
    const startTime = formData.get("startTime")?.toString() || null;
    const notes = formData.get("notes")?.toString() || null;

    if (!name || !date) {
      return { success: false, error: "Function name and date are required." };
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("event_functions")
      .insert({
        event_id: eventId,
        name,
        date,
        start_time: startTime,
        notes,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, functionId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Add an Item under a Function (Tracking View)
 */
export async function addItemAction(functionId: string, eventId: string, formData: FormData) {
  try {
    await verifyAdminCaller();

    const category = (formData.get("category")?.toString() || "decor") as
      | "lighting"
      | "flowers"
      | "decor"
      | "instruments"
      | "other";
    const title = formData.get("title")?.toString() || "";
    const vendor = formData.get("vendor")?.toString() || null;
    const cost = parseFloat(formData.get("cost")?.toString() || "0") || 0;
    const notes = formData.get("notes")?.toString() || null;
    const status = (formData.get("status")?.toString() || "not_started") as
      | "not_started"
      | "in_progress"
      | "done";

    if (!title) {
      return { success: false, error: "Item title is required." };
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("event_items")
      .insert({
        function_id: functionId,
        category,
        title,
        vendor,
        cost,
        status,
        notes,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, itemId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Quick Item Status Toggle (Quick Action in Tracking View)
 */
export async function updateItemStatusAction(
  itemId: string,
  eventId: string,
  newStatus: "not_started" | "in_progress" | "done"
) {
  try {
    await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("event_items")
      .update({ status: newStatus })
      .eq("id", itemId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
