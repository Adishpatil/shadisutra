"use server";

import "server-only";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { DESIGN_MIME_EXTENSIONS, designSignatureMatches, isDesignMimeType } from "@/lib/admin/design-validation";
import { parseMoneyToPaise } from "@/lib/admin/budget-calculations";
import { createClient } from "@/lib/supabase/server";

const categories = ["lighting", "flowers", "decor", "instruments", "venue", "food", "staff", "travel", "other"] as const;
const paymentModes = ["cash", "upi", "bank", "cheque", "card", "other"] as const;
const maxReceiptSize = 10 * 1024 * 1024;
const fileSchema = z.custom<File>((value) => typeof File !== "undefined" && value instanceof File);

function revalidateMoney(eventId: string) {
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/money");
}

function validReceiptPath(path: string, eventId: string, expenseId: string): boolean {
  const prefix = `${eventId}/${expenseId}/`;
  return path.startsWith(prefix) && /^[A-Za-z0-9_-]+\.(png|jpg|webp|pdf)$/.test(path.slice(prefix.length));
}

export async function saveEventExpenseAction(
  eventId: string,
  expenseId: string | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await verifyAdminCaller();
  const parsed = z.object({
    eventId: z.string().uuid(),
    expenseId: z.string().uuid().nullable(),
    category: z.enum(categories),
    expenseDate: z.string().date(),
    vendor: z.string().trim().max(200),
    description: z.string().trim().min(1).max(500),
    quantity: z.string().regex(/^\d{1,7}(?:\.\d{1,3})?$/).transform(Number).refine((value) => Number.isFinite(value) && value > 0),
    unitCost: z.string().max(13),
    taxAmount: z.string().max(13),
    amountPaid: z.string().max(13),
    paymentMode: z.union([z.literal(""), z.enum(paymentModes)]),
    notes: z.string().max(5000),
    functionId: z.union([z.literal(""), z.string().uuid()]),
    itemId: z.union([z.literal(""), z.string().uuid()]),
    receipt: fileSchema.nullable(),
  }).safeParse({
    eventId,
    expenseId,
    category: String(formData.get("category") ?? ""),
    expenseDate: String(formData.get("expenseDate") ?? ""),
    vendor: String(formData.get("vendor") ?? ""),
    description: String(formData.get("description") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    unitCost: String(formData.get("unitCost") ?? ""),
    taxAmount: String(formData.get("taxAmount") ?? ""),
    amountPaid: String(formData.get("amountPaid") ?? ""),
    paymentMode: String(formData.get("paymentMode") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    functionId: String(formData.get("functionId") ?? ""),
    itemId: String(formData.get("itemId") ?? ""),
    receipt: (() => {
      const file = formData.get("receipt");
      return typeof File !== "undefined" && file instanceof File && file.size === 0 ? null : file;
    })(),
  });
  if (!parsed.success) return { success: false, error: "Check the expense details and try again." };
  const unitCost = parseMoneyToPaise(parsed.data.unitCost);
  const taxAmount = parseMoneyToPaise(parsed.data.taxAmount);
  const amountPaid = parseMoneyToPaise(parsed.data.amountPaid);
  if (unitCost === null || taxAmount === null || amountPaid === null) {
    return { success: false, error: "Enter valid non-negative INR amounts with up to two decimal places." };
  }
  const amount = Math.round(parsed.data.quantity * unitCost);
  if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(amount + taxAmount) || amountPaid > amount + taxAmount) {
    return { success: false, error: "Paid amount cannot exceed the expense total including tax." };
  }
  const file = parsed.data.receipt;
  const mimeType = file?.type.toLowerCase();
  if (file && (file.size < 1 || file.size > maxReceiptSize || !mimeType || !isDesignMimeType(mimeType))) {
    return { success: false, error: "Receipt must be a supported image or PDF under 10 MB." };
  }

  const supabase = await createClient();
  const current = parsed.data.expenseId
    ? await supabase.from("event_expenses").select("receipt_path").eq("id", parsed.data.expenseId).eq("event_id", parsed.data.eventId).maybeSingle()
    : { data: null, error: null };
  if (current.error) return { success: false, error: "Could not load the existing expense." };
  if (parsed.data.expenseId && !current.data) return { success: false, error: "Expense was not found." };
  const id = parsed.data.expenseId ?? randomUUID();
  let uploadedPath: string | null = null;
  if (file) {
    if (!mimeType || !isDesignMimeType(mimeType)) {
      return { success: false, error: "Receipt must be a supported image or PDF under 10 MB." };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!designSignatureMatches(bytes, mimeType)) {
      return { success: false, error: "Receipt file content does not match its file type." };
    }
    const filename = `${randomUUID()}.${DESIGN_MIME_EXTENSIONS[mimeType]}`;
    uploadedPath = `${parsed.data.eventId}/${id}/${filename}`;
    const { error } = await supabase.storage.from("event-files").upload(uploadedPath, bytes, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) return { success: false, error: "Receipt upload failed." };
  }

  const values = {
    event_id: parsed.data.eventId,
    function_id: parsed.data.functionId || null,
    item_id: parsed.data.itemId || null,
    category: parsed.data.category,
    expense_date: parsed.data.expenseDate,
    vendor: parsed.data.vendor,
    description: parsed.data.description,
    quantity: parsed.data.quantity,
    unit_cost: unitCost,
    tax_amount: taxAmount,
    amount_paid: amountPaid,
    payment_mode: parsed.data.paymentMode || null,
    notes: parsed.data.notes || null,
    ...(uploadedPath ? { receipt_path: uploadedPath } : {}),
  };
  const saved = parsed.data.expenseId
    ? await supabase.from("event_expenses").update(values).eq("id", id).eq("event_id", parsed.data.eventId).select("id").maybeSingle()
    : await supabase.from("event_expenses").insert({ id, ...values }).select("id").maybeSingle();
  if (saved.error || !saved.data) {
    if (uploadedPath) {
      const { error: cleanupError } = await supabase.storage.from("event-files").remove([uploadedPath]);
      if (cleanupError) return { success: false, error: "Expense save failed and the uploaded receipt could not be cleaned up." };
    }
    return { success: false, error: "Could not save the expense." };
  }
  revalidateMoney(parsed.data.eventId);
  if (uploadedPath && current.data?.receipt_path) {
    if (!validReceiptPath(current.data.receipt_path, parsed.data.eventId, id)) {
      return { success: false, error: "Expense saved, but the replaced receipt path was invalid." };
    }
    const { error } = await supabase.storage.from("event-files").remove([current.data.receipt_path]);
    if (error) return { success: false, error: "Expense saved, but the replaced receipt could not be removed." };
  }
  return { success: true };
}

export async function deleteEventExpenseAction(
  eventId: string,
  expenseId: string
): Promise<{ success: boolean; error?: string }> {
  await verifyAdminCaller();
  const parsed = z.object({ eventId: z.string().uuid(), expenseId: z.string().uuid() }).safeParse({ eventId, expenseId });
  if (!parsed.success) return { success: false, error: "Invalid expense." };
  const supabase = await createClient();
  const { data: expense, error: readError } = await supabase.from("event_expenses")
    .select("receipt_path")
    .eq("event_id", parsed.data.eventId)
    .eq("id", parsed.data.expenseId)
    .maybeSingle();
  if (readError) return { success: false, error: "Could not load the expense." };
  if (!expense) return { success: false, error: "Expense was not found." };
  if (expense.receipt_path && !validReceiptPath(expense.receipt_path, parsed.data.eventId, parsed.data.expenseId)) {
    return { success: false, error: "Expense receipt path is invalid." };
  }
  const { error } = await supabase.from("event_expenses")
    .delete()
    .eq("event_id", parsed.data.eventId)
    .eq("id", parsed.data.expenseId);
  if (error) return { success: false, error: "Could not delete the expense." };
  revalidateMoney(parsed.data.eventId);
  if (expense.receipt_path) {
    const { error: storageError } = await supabase.storage.from("event-files").remove([expense.receipt_path]);
    if (storageError) return { success: false, error: "Expense deleted, but its receipt could not be removed." };
  }
  return { success: true };
}
