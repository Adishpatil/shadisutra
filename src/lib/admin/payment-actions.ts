"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";

const idSchema = z.string().uuid();
const amountSchema = z.number().finite().positive();
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((date) => {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date
    );
  });

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export async function addPaymentAction(eventId: string, formData: FormData) {
  try {
    const adminUser = await verifyAdminCaller();
    const parsed = z
      .object({
        eventId: idSchema,
        amount: amountSchema,
        paidOn: dateSchema,
        mode: z.string().trim().min(1).max(100),
        note: z.string().max(2000),
      })
      .safeParse({
        eventId,
        amount: Number(formData.get("amount")),
        paidOn: String(formData.get("paidOn") ?? ""),
        mode: String(formData.get("mode") ?? "Bank Transfer").trim(),
        note: String(formData.get("note") ?? "").trim(),
      });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid payment details.",
      };
    }

    const supabase = createAdminClient();
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        event_id: parsed.data.eventId,
        amount: parsed.data.amount,
        paid_on: parsed.data.paidOn,
        mode: parsed.data.mode,
        note: parsed.data.note || null,
      })
      .select("id")
      .single();
    if (paymentError) throw paymentError;

    const { error: auditError } = await supabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "INSERT_PAYMENT",
      table_name: "payments",
      row_id: payment.id,
      payload: {
        event_id: parsed.data.eventId,
        amount: parsed.data.amount,
        paid_on: parsed.data.paidOn,
        mode: parsed.data.mode,
      },
    });
    if (auditError) throw auditError;
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin");
    return { success: true, paymentId: payment.id };
  } catch (error: unknown) {
    return { success: false, error: messageFrom(error) };
  }
}

export async function updateAgreedTotalAction(
  eventId: string,
  agreedTotal: number
) {
  try {
    const adminUser = await verifyAdminCaller();
    const parsed = z
      .object({ eventId: idSchema, agreedTotal: z.number().finite().min(0) })
      .safeParse({ eventId, agreedTotal });
    if (!parsed.success) {
      return { success: false, error: "Budget must be a valid non-negative amount." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("budgets").upsert({
      event_id: parsed.data.eventId,
      agreed_total: parsed.data.agreedTotal,
    });
    if (error) throw error;

    const { error: auditError } = await supabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "UPDATE_AGREED_BUDGET",
      table_name: "budgets",
      row_id: parsed.data.eventId,
      payload: { event_id: parsed.data.eventId, agreed_total: parsed.data.agreedTotal },
    });
    if (auditError) throw auditError;
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: messageFrom(error) };
  }
}

export async function deletePaymentAction(paymentId: string, eventId: string) {
  try {
    const adminUser = await verifyAdminCaller();
    const parsed = z
      .object({ paymentId: idSchema, eventId: idSchema })
      .safeParse({ paymentId, eventId });
    if (!parsed.success) return { success: false, error: "Invalid payment request." };

    const supabase = createAdminClient();
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .delete()
      .eq("id", parsed.data.paymentId)
      .eq("event_id", parsed.data.eventId)
      .select("id,amount,paid_on,mode")
      .maybeSingle();
    if (paymentError) throw paymentError;
    if (!payment) return { success: false, error: "Payment was not found." };

    const { error: auditError } = await supabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "DELETE_PAYMENT",
      table_name: "payments",
      row_id: payment.id,
      payload: {
        event_id: parsed.data.eventId,
        amount: payment.amount,
        paid_on: payment.paid_on,
        mode: payment.mode,
      },
    });
    if (auditError) throw auditError;
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: messageFrom(error) };
  }
}
