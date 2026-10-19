import { createClient } from "../supabase/server";
import type { AdminFunction } from "../admin/data";

export interface PublicEventShowcase {
  id: string;
  name: string;
  type: "wedding" | "birthday" | "function";
  date: string;
  venue: string;
  status: "planning" | "finalized" | "completed" | "cancelled";
  customer_name?: string;
  functions: AdminFunction[];
}

// Fallback demo events for immediate preview when running locally without DB
const fallbackShowcaseEvents: Record<string, PublicEventShowcase> = {
  "e1-sharma-wedding": {
    id: "e1-sharma-wedding",
    name: "Sharma Royal Wedding Celebrations",
    type: "wedding",
    date: "2026-11-20",
    venue: "The Oberoi Rajvilas, Jaipur",
    status: "finalized",
    customer_name: "Priyanshu & Ananya Sharma",
    functions: [
      {
        id: "f1-haldi",
        event_id: "e1-sharma-wedding",
        name: "Vibrant Haldi & Phoolon Ki Holi",
        date: "2026-11-19",
        start_time: "10:30:00",
        notes: "Yellow marigold decor, poolside lawn. Dress code: Sunshine Yellow.",
      },
      {
        id: "f2-sangeet",
        event_id: "e1-sharma-wedding",
        name: "Grand Sangeet & Musical Night",
        date: "2026-11-19",
        start_time: "19:30:00",
        notes: "Main ballroom, dinner & performances followed by DJ night. Dress code: Indo-Western Glam.",
      },
      {
        id: "f3-wedding",
        event_id: "e1-sharma-wedding",
        name: "Baraat, Varmala & Sacred Phere",
        date: "2026-11-20",
        start_time: "17:30:00",
        notes: "Central palace courtyard mandap over lotus pond. Royal dinner follows.",
      },
    ],
  },
  "e2-mehta-birthday": {
    id: "e2-mehta-birthday",
    name: "Aarav's 1st Royal Safari Birthday Jubilee",
    type: "birthday",
    date: "2026-12-12",
    venue: "Palm Grove Banquet, Mumbai",
    status: "finalized",
    customer_name: "Rajesh & Priya Mehta",
    functions: [
      {
        id: "f4-safari-party",
        event_id: "e2-mehta-birthday",
        name: "Safari Party, Magic Games & Cake Cutting",
        date: "2026-12-12",
        start_time: "16:30:00",
        notes: "Jungle theme photo-booth, puppet theater & interactive kids activities.",
      },
    ],
  },
};

/**
 * Fetch finalized event details for the public QR showcase page.
 * Returns null if event is not found or not finalized.
 */
export async function getPublicEventShowcase(id: string): Promise<PublicEventShowcase | null> {
  try {
    const supabase = await createClient();
    const { data: ev, error } = await supabase
      .from("events")
      .select("id, name, type, date, venue, status, profiles:customer_id(full_name)")
      .eq("id", id)
      .maybeSingle();

    if (error || !ev) {
      const fallback = fallbackShowcaseEvents[id];
      if (fallback && (fallback.status === "finalized" || fallback.status === "completed")) {
        return fallback;
      }
      return null;
    }

    // Only finalized or completed events can be viewed by guests via QR
    if (ev.status !== "finalized" && ev.status !== "completed") {
      return null;
    }

    const { data: funcs } = await supabase
      .from("event_functions")
      .select("id, event_id, name, date, start_time, notes")
      .eq("event_id", id)
      .order("date", { ascending: true });

    return {
      id: ev.id,
      name: ev.name,
      type: ev.type,
      date: ev.date,
      venue: ev.venue,
      status: ev.status,
      customer_name: (ev as any).profiles?.full_name || "Special Host",
      functions: (funcs as AdminFunction[]) || [],
    };
  } catch {
    const fallback = fallbackShowcaseEvents[id];
    if (fallback && (fallback.status === "finalized" || fallback.status === "completed")) {
      return fallback;
    }
    return null;
  }
}
