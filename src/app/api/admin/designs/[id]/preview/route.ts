import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { getDesignFileKind } from "@/lib/admin/design-storage";

export const dynamic = "force-dynamic";

function privateResponse(body: BodyInit | null, status: number, contentType = "text/plain") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminCaller();
  } catch {
    return privateResponse("Not found", 404);
  }

  const { id } = await params;
  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) {
    return privateResponse("Not found", 404);
  }

  try {
    const sessionClient = await createClient();
    const { data: design, error: designError } = await sessionClient
      .from("designs")
      .select("id,event_id,file_path")
      .eq("id", idResult.data)
      .maybeSingle();
    if (designError) return privateResponse("Preview unavailable", 500);
    if (!design) return privateResponse("Not found", 404);

    const fileKind = getDesignFileKind(design.file_path, design.event_id, design.id);
    if (!fileKind) return privateResponse("Not found", 404);
    const extension = design.file_path.split(".").pop()?.toLowerCase();
    const contentType = fileKind === "pdf"
      ? "application/pdf"
      : extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    const storage = createAdminClient();
    const { data: signed, error: signError } = await storage.storage
      .from("event-files")
      .createSignedUrl(design.file_path, 60);
    if (signError) return privateResponse("Preview unavailable", 502);

    const upstream = await fetch(signed.signedUrl, {
      cache: "no-store",
      signal: request.signal,
    });
    if (!upstream.ok || !upstream.body) {
      return privateResponse("Preview unavailable", 502);
    }
    return privateResponse(upstream.body, 200, contentType);
  } catch {
    return privateResponse("Preview unavailable", 500);
  }
}
