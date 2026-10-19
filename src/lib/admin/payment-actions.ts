"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Verify caller is an administrator
 */
async function verifyAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized: Authentication required.");

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
 * Quick-add a payment for an event
 */
export async function addPaymentAction(eventId: string, formData: FormData) {
  try {
    const adminUser = await verifyAdminCaller();

    const amount = parseFloat(formData.get("amount")?.toString() || "0");
    const paidOn = formData.get("paidOn")?.toString() || "";
    const mode = formData.get("mode")?.toString() || "Bank Transfer";
    const note = formData.get("note")?.toString() || null;

    if (!amount || amount <= 0) {
      return { success: false, error: "Please enter a valid positive payment amount." };
    }

    if (!paidOn) {
      return { success: false, error: "Payment date is required." };
    }

    const adminSupabase = createAdminClient();

    // 1. Insert payment record
    const { data: newPayment, error: paymentError } = await adminSupabase
      .from("payments")
      .insert({
        event_id: eventId,
        amount,
        paid_on: paidOn,
        mode,
        note,
      })
      .select()
      .single();

    if (paymentError || !newPayment) {
      return { success: false, error: paymentError?.message || "Failed to record payment." };
    }

    // 2. Insert audit log entry
    await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "INSERT_PAYMENT",
      table_name: "payments",
      row_id: newPayment.id,
      payload: {
        event_id: eventId,
        amount,
        paid_on: paidOn,
        mode,
        note,
      },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin");

    return { success: true, paymentId: newPayment.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record payment.";
    return { success: false, error: message };
  }
}

/**
 * Update the agreed total budget contracted with client
 */
export async function updateAgreedTotalAction(eventId: string, agreedTotal: number) {
  try {
    const adminUser = await verifyAdminCaller();

    if (agreedTotal < 0) {
      return { success: false, error: "Budget amount cannot be negative." };
    }

    const adminSupabase = createAdminClient();

    // Upsert budget record
    const { error } = await adminSupabase.from("budgets").upsert({
      event_id: eventId,
      agreed_total: agreedTotal,
    });

    if (error) return { success: false, error: error.message };

    // Record audit log
    await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "UPDATE_AGREED_BUDGET",
      table_name: "budgets",
      row_id: eventId,
      payload: { agreed_total: agreedTotal },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update budget.";
    return { success: false, error: message };
  }
}

/**
 * Delete a payment record
 */
export async function deletePaymentAction(paymentId: string, eventId: string) {
  try {
    const adminUser = await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) return { success: false, error: error.message };

    await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "DELETE_PAYMENT",
      table_name: "payments",
      row_id: paymentId,
      payload: { event_id: eventId },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete payment.";
    return { success: false, error: message };
  }
}
