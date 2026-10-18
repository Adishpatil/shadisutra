import { createClient } from "@/lib/supabase/server";

export interface AdminEventSummary {
  id: string;
  name: string;
  type: "wedding" | "birthday" | "function";
  date: string;
  venue: string;
  status: "planning" | "finalized" | "completed" | "cancelled";
  customer_id: string | null;
  customer_name?: string;
  customer_username?: string;
  show_payments_to_customer: boolean;
  total_functions?: number;
  total_items?: number;
  pending_items?: number;
  budget_total?: number;
  total_paid?: number;
}

export interface AdminCustomerSummary {
  id: string;
  username: string;
  full_name: string;
  role: "admin" | "customer";
  access_enabled: boolean;
  must_change_password: boolean;
  created_at: string;
  linked_event_id?: string | null;
  linked_event_name?: string | null;
}

export interface AdminFunction {
  id: string;
  event_id: string;
  name: string;
  date: string;
  start_time: string | null;
  notes: string | null;
}

export interface AdminItem {
  id: string;
  function_id: string;
  category: "lighting" | "flowers" | "decor" | "instruments" | "other";
  title: string;
  vendor: string | null;
  status: "not_started" | "in_progress" | "done";
  cost: number;
  notes: string | null;
}

export interface AdminEnquiry {
  id: string;
  name: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  message: string;
  created_at: string;
}

// Fallback demo data for immediate local development preview
const fallbackEvents: AdminEventSummary[] = [
  {
    id: "e1-sharma-wedding",
    name: "Sharma Royal Wedding Celebrations",
    type: "wedding",
    date: "2026-11-20",
    venue: "The Oberoi Rajvilas, Jaipur",
    status: "finalized",
    customer_id: "c1-sharma",
    customer_name: "Priyanshu & Ananya Sharma",
    customer_username: "sharma_wedding",
    show_payments_to_customer: true,
    total_functions: 3,
    total_items: 8,
    pending_items: 3,
    budget_total: 1250000,
    total_paid: 850000,
  },
  {
    id: "e2-mehta-birthday",
    name: "Aarav's 1st Royal Safari Birthday Jubilee",
    type: "birthday",
    date: "2026-12-12",
    venue: "Palm Grove Banquet, Mumbai",
    status: "planning",
    customer_id: "c2-mehta",
    customer_name: "Rajesh & Priya Mehta",
    customer_username: "mehta_birthday",
    show_payments_to_customer: false,
    total_functions: 1,
    total_items: 4,
    pending_items: 2,
    budget_total: 180000,
    total_paid: 60000,
  },
  {
    id: "e3-apex-corp",
    name: "Apex Global Annual Awards & Gala",
    type: "function",
    date: "2027-01-15",
    venue: "ITC Grand Chola, Chennai",
    status: "planning",
    customer_id: null,
    customer_name: "Corporate Client",
    customer_username: "apex_corp",
    show_payments_to_customer: false,
    total_functions: 1,
    total_items: 5,
    pending_items: 5,
    budget_total: 450000,
    total_paid: 0,
  },
];

const fallbackCustomers: AdminCustomerSummary[] = [
  {
    id: "c1-sharma",
    username: "sharma_wedding",
    full_name: "Priyanshu & Ananya Sharma",
    role: "customer",
    access_enabled: true,
    must_change_password: false,
    created_at: "2026-08-15T10:00:00Z",
    linked_event_id: "e1-sharma-wedding",
    linked_event_name: "Sharma Royal Wedding Celebrations",
  },
  {
    id: "c2-mehta",
    username: "mehta_birthday",
    full_name: "Rajesh & Priya Mehta",
    role: "customer",
    access_enabled: false,
    must_change_password: true,
    created_at: "2026-09-01T14:30:00Z",
    linked_event_id: "e2-mehta-birthday",
    linked_event_name: "Aarav's 1st Royal Safari Birthday Jubilee",
  },
];

const fallbackFunctions: Record<string, AdminFunction[]> = {
  "e1-sharma-wedding": [
    {
      id: "f1-haldi",
      event_id: "e1-sharma-wedding",
      name: "Vibrant Haldi & Phoolon Ki Holi",
      date: "2026-11-19",
      start_time: "10:30:00",
      notes: "Yellow marigold decor, poolside lawn",
    },
    {
      id: "f2-sangeet",
      event_id: "e1-sharma-wedding",
      name: "Grand Sangeet & Musical Night",
      date: "2026-11-19",
      start_time: "19:30:00",
      notes: "Main ballroom, moving lighting trusses, sound check at 4 PM",
    },
    {
      id: "f3-wedding",
      event_id: "e1-sharma-wedding",
      name: "Varmala & Sacred Phere",
      date: "2026-11-20",
      start_time: "18:00:00",
      notes: "Central palace courtyard mandap over lotus pond",
    },
  ],
  "e2-mehta-birthday": [
    {
      id: "f4-safari-party",
      event_id: "e2-mehta-birthday",
      name: "Safari Party & Magic Games",
      date: "2026-12-12",
      start_time: "16:30:00",
      notes: "Jungle theme cake cutting & puppet show",
    },
  ],
};

const fallbackItems: Record<string, AdminItem[]> = {
  "f1-haldi": [
    {
      id: "i1-haldi-flowers",
      function_id: "f1-haldi",
      category: "flowers",
      title: "Marigold floral fountain, photobooth & loose petals for holi",
      vendor: "Jaipur Flora Co.",
      status: "done",
      cost: 65000,
      notes: "Confirmed delivery by 8:00 AM on 19th",
    },
    {
      id: "i2-haldi-dhol",
      function_id: "f1-haldi",
      category: "instruments",
      title: "Live Punjabi Dhol & Tasha troupe (4 artists)",
      vendor: "Sur Sangeet Ensemble",
      status: "done",
      cost: 25000,
      notes: "To lead groom & bride entry",
    },
  ],
  "f2-sangeet": [
    {
      id: "i3-sangeet-light",
      function_id: "f2-sangeet",
      category: "lighting",
      title: "Intelligent Sharpy moving heads, cold-pyros & haze machine",
      vendor: "Lumina FX",
      status: "in_progress",
      cost: 95000,
      notes: "Generator backup required on site",
    },
    {
      id: "i4-sangeet-decor",
      function_id: "f2-sangeet",
      category: "decor",
      title: "Glossy acrylic stage flooring & customized neon signage",
      vendor: "Artisan Stages",
      status: "in_progress",
      cost: 140000,
      notes: "Setup starts 10 AM on 19th",
    },
    {
      id: "i5-sangeet-sound",
      function_id: "f2-sangeet",
      category: "instruments",
      title: "Line array sound setup & digital mixing console",
      vendor: "ProAudio Sound",
      status: "not_started",
      cost: 80000,
      notes: "DJ console included",
    },
  ],
  "f3-wedding": [
    {
      id: "i6-wedding-mandap",
      function_id: "f3-wedding",
      category: "decor",
      title: "Royal 4-pillar carved heritage Mandap with mirror work",
      vendor: "Royal Rajputana Sets",
      status: "done",
      cost: 280000,
      notes: "Sign-off received from client",
    },
    {
      id: "i7-wedding-flowers",
      function_id: "f3-wedding",
      category: "flowers",
      title: "Fresh Rajnigandha & Red Rose Mandap dome with hanging mogra",
      vendor: "Jaipur Flora Co.",
      status: "in_progress",
      cost: 150000,
      notes: "Fresh procurement on 20th morning",
    },
    {
      id: "i8-wedding-shehnai",
      function_id: "f3-wedding",
      category: "instruments",
      title: "Traditional Shehnai & Nagada ensemble for Phere ceremony",
      vendor: "Vedic Troupe",
      status: "not_started",
      cost: 35000,
      notes: "4 traditional musicians",
    },
  ],
};

const fallbackEnquiries: AdminEnquiry[] = [
  {
    id: "enq-1",
    name: "Simran Kapoor",
    phone: "9820123456",
    event_type: "wedding",
    event_date: "2027-02-14",
    message: "Planning a destination wedding in Udaipur for 250 guests. Need complete decor, lighting and coordination.",
    created_at: "2026-10-17T11:20:00Z",
  },
  {
    id: "enq-2",
    name: "Vikram Singhania",
    phone: "9988776655",
    event_type: "function",
    event_date: "2026-12-28",
    message: "25th Silver Anniversary gala dinner with live acoustic band and vintage lighting.",
    created_at: "2026-10-18T08:45:00Z",
  },
];

/**
 * Fetch all events for Admin
 */
export async function getAdminEvents(): Promise<AdminEventSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*, profiles:customer_id(full_name, username)")
      .order("date", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackEvents;
    }

    return data.map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      type: ev.type,
      date: ev.date,
      venue: ev.venue,
      status: ev.status,
      customer_id: ev.customer_id,
      customer_name: ev.profiles?.full_name || "Unassigned",
      customer_username: ev.profiles?.username || "unassigned",
      show_payments_to_customer: ev.show_payments_to_customer,
      total_functions: 0,
      total_items: 0,
      pending_items: 0,
      budget_total: 0,
      total_paid: 0,
    }));
  } catch {
    return fallbackEvents;
  }
}

/**
 * Fetch single event details for Admin
 */
export async function getAdminEventById(id: string): Promise<{
  event: AdminEventSummary | null;
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
}> {
  try {
    const supabase = await createClient();
    const { data: ev, error } = await supabase
      .from("events")
      .select("*, profiles:customer_id(full_name, username)")
      .eq("id", id)
      .maybeSingle();

    if (error || !ev) {
      // Check fallback
      const fallback = fallbackEvents.find((e) => e.id === id);
      if (fallback) {
        const funcs = fallbackFunctions[id] || [];
        return {
          event: fallback,
          functions: funcs,
          itemsByFunction: fallbackItems,
        };
      }
      return { event: null, functions: [], itemsByFunction: {} };
    }

    const { data: funcs } = await supabase
      .from("event_functions")
      .select("*")
      .eq("event_id", id)
      .order("date", { ascending: true });

    const functionsList: AdminFunction[] = funcs || [];
    const itemsMap: Record<string, AdminItem[]> = {};

    if (functionsList.length > 0) {
      const funcIds = functionsList.map((f) => f.id);
      const { data: items } = await supabase
        .from("event_items")
        .select("*")
        .in("function_id", funcIds);

      (items || []).forEach((it: any) => {
        if (!itemsMap[it.function_id]) {
          itemsMap[it.function_id] = [];
        }
        itemsMap[it.function_id].push(it);
      });
    }

    return {
      event: {
        id: ev.id,
        name: ev.name,
        type: ev.type,
        date: ev.date,
        venue: ev.venue,
        status: ev.status,
        customer_id: ev.customer_id,
        customer_name: (ev as any).profiles?.full_name || "Unassigned",
        customer_username: (ev as any).profiles?.username || "unassigned",
        show_payments_to_customer: ev.show_payments_to_customer,
      },
      functions: functionsList,
      itemsByFunction: itemsMap,
    };
  } catch {
    const fallback = fallbackEvents.find((e) => e.id === id);
    return {
      event: fallback || null,
      functions: fallback ? fallbackFunctions[id] || [] : [],
      itemsByFunction: fallbackItems,
    };
  }
}

/**
 * Fetch all customers for Admin
 */
export async function getAdminCustomers(): Promise<AdminCustomerSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*, events(id, name)")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackCustomers;
    }

    return data.map((c: any) => ({
      id: c.id,
      username: c.username,
      full_name: c.full_name,
      role: c.role,
      access_enabled: c.access_enabled,
      must_change_password: c.must_change_password,
      created_at: c.created_at,
      linked_event_id: c.events?.[0]?.id || null,
      linked_event_name: c.events?.[0]?.name || null,
    }));
  } catch {
    return fallbackCustomers;
  }
}

/**
 * Fetch contact form enquiries for Admin
 */
export async function getAdminEnquiries(): Promise<AdminEnquiry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackEnquiries;
    }

    return data;
  } catch {
    return fallbackEnquiries;
  }
}
