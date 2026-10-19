"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { createClient } from "@/lib/supabase/server";
import { parseMoneyToPaise } from "@/lib/admin/budget-calculations";

const idSchema = z.string().uuid();
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((date) => {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  });
const paymentModeSchema = z.enum(["cash", "upi", "bank", "cheque", "card"]);

function paymentInput(eventId: string, formData: FormData) {
  const rawAmount = String(formData.get("amount") ?? "");
  const amountPaise = parseMoneyToPaise(rawAmount);
  return z
    .object({
      eventId: idSchema,
      amountPaise: z.number().int().positive().max(999_999_999_999),
      paidOn: dateSchema,
      mode: paymentModeSchema,
      note: z.string().trim().max(2000),
    })
    .safeParse({
      eventId,
      amountPaise,
      paidOn: String(formData.get("paidOn") ?? ""),
      mode: String(formData.get("mode") ?? ""),
      note: String(formData.get("note") ?? ""),
    });
}

function failed() {
  return { success: false as const, error: "The financial change could not be saved." };
}

function revalidateFinancialViews(eventId: string) {
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin");
}

export async function addPaymentAction(eventId: string, formData: FormData) {
  try {
    await verifyAdminCaller();
    const parsed = paymentInput(eventId, formData);
    if (!parsed.success) {
      return { success: false as const, error: "Enter a valid positive payment amount and payment details." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("payments").insert({
      event_id: parsed.data.eventId,
      amount: parsed.data.amountPaise / 100,
      paid_on: parsed.data.paidOn,
      mode: parsed.data.mode,
      note: parsed.data.note || null,
    });
    if (error) throw error;

    revalidateFinancialViews(eventId);
    return { success: true as const };
  } catch {
    return failed();
  }
}

export async function updatePaymentAction(
  paymentId: string,
  eventId: string,
  formData: FormData
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({ paymentId: idSchema, eventId: idSchema })
      .safeParse({ paymentId, eventId });
    const payment = paymentInput(eventId, formData);
    if (!parsed.success || !payment.success) {
      return { success: false as const, error: "Enter valid payment details." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .update({
        amount: payment.data.amountPaise / 100,
        paid_on: payment.data.paidOn,
        mode: payment.data.mode,
        note: payment.data.note || null,
      })
      .eq("id", parsed.data.paymentId)
      .eq("event_id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { success: false as const, error: "Payment was not found." };
    }

    revalidateFinancialViews(eventId);
    return { success: true as const };
  } catch {
    return failed();
  }
}

export async function updateAgreedTotalAction(
  eventId: string,
  agreedTotal: string
) {
  try {
    await verifyAdminCaller();
    const agreedTotalPaise = parseMoneyToPaise(agreedTotal);
    const parsed = z
      .object({
        eventId: idSchema,
        agreedTotalPaise: z.number().int().nonnegative().max(999_999_999_999),
      })
      .safeParse({ eventId, agreedTotalPaise });
    if (!parsed.success) {
      return { success: false as const, error: "Enter a valid non-negative budget amount." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("budgets").upsert({
      event_id: parsed.data.eventId,
      agreed_total: parsed.data.agreedTotalPaise / 100,
    });
    if (error) throw error;

    revalidateFinancialViews(eventId);
    return { success: true as const };
  } catch {
    return failed();
  }
}

export async function deletePaymentAction(paymentId: string, eventId: string) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({ paymentId: idSchema, eventId: idSchema })
      .safeParse({ paymentId, eventId });
    if (!parsed.success) {
      return { success: false as const, error: "Invalid payment request." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .delete()
      .eq("id", parsed.data.paymentId)
      .eq("event_id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { success: false as const, error: "Payment was not found." };
    }

    revalidateFinancialViews(eventId);
    return { success: true as const };
  } catch {
    return failed();
  }
}
