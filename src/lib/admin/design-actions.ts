"use server";

import "server-only";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { createClient } from "@/lib/supabase/server";
import { consumeRateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import {
  DESIGN_MIME_EXTENSIONS,
  designSignatureMatches,
  isDesignMimeType,
} from "@/lib/admin/design-validation";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function revalidateDesigns(eventId: string) {
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin");
  revalidatePath("/e/[token]", "page");
}

export async function uploadDesignAction(formData: FormData) {
  let uploadedPath: string | null = null;
  try {
    await verifyAdminCaller();
    const allowed = await consumeRateLimit(
      rateLimitKey(await headers(), "design-upload"),
      5,
      900
    );
    if (!allowed) {
      return {
        success: false as const,
        error: "Too many uploads. Please try again later.",
      };
    }
    const file = formData.get("file");
    const parsed = z
      .object({
        eventId: z.string().uuid(),
        title: z.string().trim().min(1).max(120),
        file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File),
      })
      .safeParse({
        eventId: String(formData.get("eventId") ?? ""),
        title: String(formData.get("title") ?? ""),
        file,
      });
    if (!parsed.success || parsed.data.file.size < 1 || parsed.data.file.size > MAX_FILE_SIZE) {
      return { success: false as const, error: "The file could not be uploaded. Check its type and size." };
    }

    const mimeType = parsed.data.file.type.toLowerCase();
    if (!isDesignMimeType(mimeType)) {
      return { success: false as const, error: "The file could not be uploaded. Check its type and size." };
    }
    const bytes = new Uint8Array(await parsed.data.file.arrayBuffer());
    if (!designSignatureMatches(bytes, mimeType)) {
      return { success: false as const, error: "The file could not be uploaded. Check its type and size." };
    }

    const supabase = await createClient();
    const { data: latest, error: latestError } = await supabase
      .from("designs")
      .select("version")
      .eq("event_id", parsed.data.eventId)
      .eq("title", parsed.data.title)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError) throw latestError;

    const designId = randomUUID();
    const safeFilename = `${randomUUID()}.${DESIGN_MIME_EXTENSIONS[mimeType]}`;
    uploadedPath = `${parsed.data.eventId}/${designId}/${safeFilename}`;
    const { error: uploadError } = await supabase.storage
      .from("event-files")
      .upload(uploadedPath, bytes, { contentType: mimeType, upsert: false });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("designs").insert({
      id: designId,
      event_id: parsed.data.eventId,
      title: parsed.data.title,
      file_path: uploadedPath,
      version: (latest?.version ?? 0) + 1,
      is_finalized: false,
    });
    if (insertError) {
      const { error: cleanupError } = await supabase.storage
        .from("event-files")
        .remove([uploadedPath]);
      if (cleanupError) throw cleanupError;
      throw insertError;
    }

    revalidateDesigns(parsed.data.eventId);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "The file could not be uploaded. Check your access and try again." };
  }
}

export async function setDesignFinalizedAction(
  designId: string,
  eventId: string,
  isFinalized: boolean
) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({
        designId: z.string().uuid(),
        eventId: z.string().uuid(),
        isFinalized: z.boolean(),
      })
      .safeParse({ designId, eventId, isFinalized });
    if (!parsed.success) {
      return { success: false as const, error: "Invalid design update." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("designs")
      .update({ is_finalized: parsed.data.isFinalized })
      .eq("id", parsed.data.designId)
      .eq("event_id", parsed.data.eventId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false as const, error: "Design was not found." };

    revalidateDesigns(eventId);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "The design could not be updated." };
  }
}

export async function deleteDesignAction(designId: string, eventId: string) {
  try {
    await verifyAdminCaller();
    const parsed = z
      .object({ designId: z.string().uuid(), eventId: z.string().uuid() })
      .safeParse({ designId, eventId });
    if (!parsed.success) {
      return { success: false as const, error: "Invalid design request." };
    }

    const supabase = await createClient();
    const { data: design, error: readError } = await supabase
      .from("designs")
      .select("file_path")
      .eq("id", parsed.data.designId)
      .eq("event_id", parsed.data.eventId)
      .maybeSingle();
    if (readError) throw readError;
    if (!design || !design.file_path.startsWith(`${eventId}/${designId}/`)) {
      return { success: false as const, error: "Design was not found." };
    }

    const { error: storageError } = await supabase.storage
      .from("event-files")
      .remove([design.file_path]);
    if (storageError) throw storageError;
    const { error: deleteError } = await supabase
      .from("designs")
      .delete()
      .eq("id", designId)
      .eq("event_id", eventId);
    if (deleteError) throw deleteError;

    revalidateDesigns(eventId);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "The design could not be deleted." };
  }
}
