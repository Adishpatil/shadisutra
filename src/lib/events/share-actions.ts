"use server";

import "server-only";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { createClient } from "@/lib/supabase/server";

const eventIdSchema = z.string().uuid();
const expirationSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => new Date(value).getTime() > Date.now());

export interface AdminEventShareLink {
  token: string | null;
  expiresAt: string;
  revokedAt: string | null;
}

export async function getAdminEventShareLink(
  eventId: string
): Promise<AdminEventShareLink | null> {
  const parsedId = eventIdSchema.safeParse(eventId);
  if (!parsedId.success) throw new Error("Invalid event.");
  await verifyAdminCaller();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_share_links")
    .select("token,expires_at,revoked_at")
    .eq("event_id", parsedId.data)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not load event share link.");
  if (!data) return null;

  const isActive =
    data.revoked_at === null && new Date(data.expires_at).getTime() > Date.now();
  return {
    token: isActive ? data.token : null,
    expiresAt: data.expires_at,
    revokedAt: data.revoked_at,
  };
}

export async function generateEventShareLink(
  eventId: string,
  expiresAt: string
): Promise<
  | { success: true; token: string; expiresAt: string }
  | { success: false; error: string }
> {
  const parsed = z
    .object({ eventId: eventIdSchema, expiresAt: expirationSchema })
    .safeParse({ eventId, expiresAt });
  if (!parsed.success) {
    return { success: false, error: "Choose a valid future expiration date." };
  }

  await verifyAdminCaller();
  const supabase = await createClient();
  const { error: revokeError } = await supabase
    .from("event_share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("event_id", parsed.data.eventId)
    .is("revoked_at", null);
  if (revokeError) {
    return { success: false, error: "Could not replace the current share link." };
  }

  const token = randomBytes(24).toString("base64url");
  const { error: insertError } = await supabase.from("event_share_links").insert({
    event_id: parsed.data.eventId,
    token,
    expires_at: parsed.data.expiresAt,
  });
  if (insertError) {
    return { success: false, error: "Could not create the event share link." };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}`);
  return {
    success: true,
    token,
    expiresAt: parsed.data.expiresAt,
  };
}

export async function revokeEventShareLink(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const parsedId = eventIdSchema.safeParse(eventId);
  if (!parsedId.success) {
    return { success: false, error: "Invalid event." };
  }

  await verifyAdminCaller();
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("event_id", parsedId.data)
    .is("revoked_at", null);
  if (error) {
    return { success: false, error: "Could not revoke the event share link." };
  }

  revalidatePath(`/admin/events/${parsedId.data}`);
  return { success: true };
}
