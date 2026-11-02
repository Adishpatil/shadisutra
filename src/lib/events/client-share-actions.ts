"use server";

import "server-only";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { hashClientPin } from "@/lib/events/client-link-access";
import { createClient } from "@/lib/supabase/server";

const eventIdSchema = z.string().uuid();
const expirationSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => new Date(value).getTime() > Date.now());
const pinSchema = z.union([z.literal(""), z.string().regex(/^\d{4,6}$/)]);

export interface AdminEventClientShareLink {
  token: string | null;
  expiresAt: string;
  revokedAt: string | null;
  hasPin: boolean;
}

export async function getAdminEventClientShareLink(
  eventId: string
): Promise<AdminEventClientShareLink | null> {
  const parsedId = eventIdSchema.safeParse(eventId);
  if (!parsedId.success) throw new Error("Invalid event.");
  await verifyAdminCaller();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_client_links")
    .select("token,pin_hash,expires_at,revoked_at")
    .eq("event_id", parsedId.data)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not load client link.");
  if (!data) return null;
  const active = data.revoked_at === null && new Date(data.expires_at).getTime() > Date.now();
  return {
    token: active ? data.token : null,
    expiresAt: data.expires_at,
    revokedAt: data.revoked_at,
    hasPin: Boolean(data.pin_hash),
  };
}

export async function generateEventClientLink(
  eventId: string,
  expiresAt: string,
  pin: string
): Promise<
  | { success: true; token: string; expiresAt: string; hasPin: boolean }
  | { success: false; error: string }
> {
  await verifyAdminCaller();
  const parsed = z
    .object({ eventId: eventIdSchema, expiresAt: expirationSchema, pin: pinSchema })
    .safeParse({ eventId, expiresAt, pin });
  if (!parsed.success) {
    return { success: false, error: "Choose a future expiry and a 4-6 digit PIN, or leave it blank." };
  }
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("event_client_links")
    .select("pin_hash")
    .eq("event_id", parsed.data.eventId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (currentError) return { success: false, error: "Could not load the current client link." };
  const { error: revokeError } = await supabase
    .from("event_client_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("event_id", parsed.data.eventId)
    .is("revoked_at", null);
  if (revokeError) return { success: false, error: "Could not replace the client link." };

  const token = randomBytes(24).toString("base64url");
  const pinHash = parsed.data.pin
    ? await hashClientPin(parsed.data.pin)
    : current?.pin_hash ?? null;
  const { error } = await supabase.from("event_client_links").insert({
    event_id: parsed.data.eventId,
    token,
    pin_hash: pinHash,
    expires_at: parsed.data.expiresAt,
  });
  if (error) return { success: false, error: "Could not create the client link." };

  revalidatePath(`/admin/events/${parsed.data.eventId}`);
  return {
    success: true,
    token,
    expiresAt: parsed.data.expiresAt,
    hasPin: Boolean(pinHash),
  };
}

export async function revokeEventClientLink(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  await verifyAdminCaller();
  const parsedId = eventIdSchema.safeParse(eventId);
  if (!parsedId.success) return { success: false, error: "Invalid event." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_client_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("event_id", parsedId.data)
    .is("revoked_at", null);
  if (error) return { success: false, error: "Could not revoke the client link." };
  revalidatePath(`/admin/events/${parsedId.data}`);
  return { success: true };
}

export async function setEventClientPin(
  eventId: string,
  pin: string
): Promise<{ success: boolean; hasPin?: boolean; error?: string }> {
  await verifyAdminCaller();
  const parsed = z
    .object({ eventId: eventIdSchema, pin: pinSchema })
    .safeParse({ eventId, pin });
  if (!parsed.success) {
    return { success: false, error: "Enter a PIN with 4-6 digits, or leave it blank to remove it." };
  }
  const supabase = await createClient();
  const pinHash = parsed.data.pin ? await hashClientPin(parsed.data.pin) : null;
  const { data, error } = await supabase
    .from("event_client_links")
    .update({ pin_hash: pinHash })
    .eq("event_id", parsed.data.eventId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error || !data) return { success: false, error: "Could not update the active client link PIN." };
  revalidatePath(`/admin/events/${parsed.data.eventId}`);
  return { success: true, hasPin: Boolean(pinHash) };
}

export async function setEventPaymentsVisibility(
  eventId: string,
  visible: boolean
): Promise<{ success: boolean; error?: string }> {
  await verifyAdminCaller();
  const parsed = z
    .object({ eventId: eventIdSchema, visible: z.boolean() })
    .safeParse({ eventId, visible });
  if (!parsed.success) return { success: false, error: "Invalid event payment visibility setting." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update({ show_payments_to_customer: parsed.data.visible })
    .eq("id", parsed.data.eventId)
    .select("id")
    .maybeSingle();
  if (error || !data) return { success: false, error: "Could not update client payment visibility." };
  revalidatePath(`/admin/events/${parsed.data.eventId}`);
  revalidatePath(`/c`);
  return { success: true };
}
