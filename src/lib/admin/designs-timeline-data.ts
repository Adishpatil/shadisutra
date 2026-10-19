import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface EventDesignRecord {
  id: string;
  event_id: string;
  title: string;
  file_path: string;
  signed_url: string | null;
  version: number;
  is_finalized: boolean;
  created_at: string;
}

export interface EventTimelineEntry {
  id: string;
  event_id: string;
  function_id: string | null;
  starts_at: string;
  title: string;
  notes: string | null;
}

export async function getEventDesigns(
  eventId: string
): Promise<EventDesignRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  if (!data.length) return [];

  const storageAdmin = createAdminClient();
  return Promise.all(
    data.map(async (design) => {
      if (!design.file_path.startsWith(`${design.event_id}/`)) {
        throw new Error("Design file path must be inside its event folder.");
      }
      const { data: signedUrl, error: storageError } = await storageAdmin.storage
        .from("event-files")
        .createSignedUrl(design.file_path, 300);
      if (storageError) throw new Error(storageError.message);
      return {
        id: design.id,
        event_id: design.event_id,
        title: design.title,
        file_path: design.file_path,
        signed_url: signedUrl.signedUrl,
        version: design.version,
        is_finalized: design.is_finalized,
        created_at: design.created_at,
      };
    })
  );
}

export async function getEventTimelineEntries(
  eventId: string
): Promise<EventTimelineEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timeline_entries")
    .select("id,event_id,function_id,starts_at,title,notes")
    .eq("event_id", eventId)
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
