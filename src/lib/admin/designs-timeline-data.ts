import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDesignFileKind } from "@/lib/admin/design-storage";

export interface EventDesignRecord {
  id: string;
  event_id: string;
  title: string;
  preview_url: string;
  file_kind: "image" | "pdf";
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
    .select("id,event_id,title,file_path,version,is_finalized,created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  if (!data.length) return [];

  return data.map((design) => {
    const fileKind = getDesignFileKind(design.file_path, design.event_id, design.id);
    if (!fileKind) throw new Error("Design file path is invalid.");
    return {
        id: design.id,
        event_id: design.event_id,
        title: design.title,
        preview_url: `/api/admin/designs/${design.id}/preview`,
        file_kind: fileKind,
        version: design.version,
        is_finalized: design.is_finalized,
        created_at: design.created_at,
    };
  });
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
