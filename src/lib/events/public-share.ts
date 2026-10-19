import "server-only";

import { z } from "zod";
import { consumeRateLimit, rateLimitKey } from "../security/rate-limit";
import { createAdminClient } from "../supabase/admin";
import { getDesignFileKind } from "../admin/design-storage";

export const eventShareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);

export interface PublicSharedEvent {
  name: string;
  date: string;
  venue: string;
  functions: Array<{
    name: string;
    date: string;
    start_time: string | null;
  }>;
  timeline: Array<{
    starts_at: string;
    title: string;
  }>;
  designs: Array<{
    id: string;
    title: string;
    version: number;
    url: string;
  }>;
}

export async function getPublicSharedEvent(
  rawToken: string,
  requestHeaders: Headers
): Promise<PublicSharedEvent | null> {
  const allowed = await consumeRateLimit(
    rateLimitKey(requestHeaders, "event-share-lookup"),
    30,
    60
  );
  if (!allowed) return null;

  const tokenResult = eventShareTokenSchema.safeParse(rawToken);
  if (!tokenResult.success) return null;

  const supabase = createAdminClient();
  const { data: shareLink, error: shareError } = await supabase
    .from("event_share_links")
    .select("event_id")
    .eq("token", tokenResult.data)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (shareError) throw new Error("Could not validate event share link.");
  if (!shareLink) return null;

  const [eventResult, functionsResult, timelineResult, designsResult] =
    await Promise.all([
      supabase
        .from("events")
        .select("name,date,venue")
        .eq("id", shareLink.event_id)
        .maybeSingle(),
      supabase
        .from("event_functions")
        .select("name,date,start_time")
        .eq("event_id", shareLink.event_id)
        .order("date", { ascending: true }),
      supabase
        .from("timeline_entries")
        .select("starts_at,title")
        .eq("event_id", shareLink.event_id)
        .order("starts_at", { ascending: true }),
      supabase
        .from("designs")
        .select("id,title,file_path,version,event_id")
        .eq("event_id", shareLink.event_id)
        .eq("is_finalized", true)
        .order("created_at", { ascending: false }),
    ]);
  if (
    eventResult.error ||
    functionsResult.error ||
    timelineResult.error ||
    designsResult.error
  ) {
    throw new Error("Could not load event share details.");
  }
  if (!eventResult.data) return null;

  const designs = designsResult.data.map((design) => {
      if (!getDesignFileKind(design.file_path, shareLink.event_id, design.id)) {
        throw new Error("Invalid finalized design path.");
      }
      return {
        id: design.id,
        title: design.title,
        version: design.version,
        url: `/api/e/${tokenResult.data}/designs/${design.id}`,
      };
    });

  return {
    name: eventResult.data.name,
    date: eventResult.data.date,
    venue: eventResult.data.venue,
    functions: functionsResult.data,
    timeline: timelineResult.data,
    designs,
  };
}
