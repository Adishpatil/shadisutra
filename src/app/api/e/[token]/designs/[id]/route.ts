import { z } from "zod";
import { getDesignFileKind } from "@/lib/admin/design-storage";
import { consumeRateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventShareTokenSchema } from "@/lib/events/public-share";

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
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  const { token: rawToken, id: rawId } = await params;
  const tokenResult = eventShareTokenSchema.safeParse(rawToken);
  const idResult = z.string().uuid().safeParse(rawId);
  if (!tokenResult.success || !idResult.success) {
    return privateResponse("Not found", 404);
  }

  try {
    const allowed = await consumeRateLimit(
      rateLimitKey(request.headers, "event-share-design"),
      120,
      60
    );
    if (!allowed) return privateResponse("Not found", 404);

    const supabase = createAdminClient();
    const { data: share, error: shareError } = await supabase
      .from("event_share_links")
      .select("event_id")
      .eq("token", tokenResult.data)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (shareError) return privateResponse("Unavailable", 503);
    if (!share) return privateResponse("Not found", 404);

    const { data: design, error: designError } = await supabase
      .from("designs")
      .select("id,event_id,file_path")
      .eq("id", idResult.data)
      .eq("event_id", share.event_id)
      .eq("is_finalized", true)
      .maybeSingle();
    if (designError) return privateResponse("Unavailable", 503);
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

    const { data: signed, error: signError } = await supabase.storage
      .from("event-files")
      .createSignedUrl(design.file_path, 600);
    if (signError) return privateResponse("Unavailable", 502);

    const upstream = await fetch(signed.signedUrl, {
      cache: "no-store",
      signal: request.signal,
    });
    if (!upstream.ok || !upstream.body) {
      return privateResponse("Unavailable", 502);
    }
    return privateResponse(upstream.body, 200, contentType);
  } catch {
    return privateResponse("Unavailable", 503);
  }
}
