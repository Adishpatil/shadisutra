import { createClient } from "@/lib/supabase/server";
import type {
  AdminEventSummary,
  AdminFunction,
  AdminItem,
} from "@/lib/admin/data";
import type { PaymentRecord } from "@/lib/admin/budget-calculations";

// ─── Fallback demo data for immediate local preview ────────────────────────────

const demoPortalEvent: AdminEventSummary = {
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
};

const demoPortalFunctions: AdminFunction[] = [
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
    notes: "Main ballroom, moving lighting trusses",
  },
  {
    id: "f3-wedding",
    event_id: "e1-sharma-wedding",
    name: "Varmala & Sacred Phere",
    date: "2026-11-20",
    start_time: "18:00:00",
    notes: "Central palace courtyard mandap over lotus pond",
  },
];

const demoPortalItems: Record<string, AdminItem[]> = {
  "f1-haldi": [
    {
      id: "i1-haldi-flowers",
      function_id: "f1-haldi",
      category: "flowers",
      title: "Marigold floral fountain, photobooth & loose petals",
      vendor: "Jaipur Flora Co.",
      status: "done",
      cost: 65000,
      notes: null,
    },
    {
      id: "i2-haldi-dhol",
      function_id: "f1-haldi",
      category: "instruments",
      title: "Live Punjabi Dhol & Tasha troupe (4 artists)",
      vendor: "Sur Sangeet Ensemble",
      status: "done",
      cost: 25000,
      notes: null,
    },
  ],
  "f2-sangeet": [
    {
      id: "i3-sangeet-light",
      function_id: "f2-sangeet",
      category: "lighting",
      title: "Sharpy moving heads, cold-pyros & haze machine",
      vendor: "Lumina FX",
      status: "in_progress",
      cost: 95000,
      notes: null,
    },
    {
      id: "i4-sangeet-decor",
      function_id: "f2-sangeet",
      category: "decor",
      title: "Glossy acrylic stage flooring & neon signage",
      vendor: "Artisan Stages",
      status: "in_progress",
      cost: 140000,
      notes: null,
    },
    {
      id: "i5-sangeet-sound",
      function_id: "f2-sangeet",
      category: "instruments",
      title: "Line array sound setup & digital mixing console",
      vendor: "ProAudio Sound",
      status: "not_started",
      cost: 80000,
      notes: null,
    },
  ],
  "f3-wedding": [
    {
      id: "i6-wedding-mandap",
      function_id: "f3-wedding",
      category: "decor",
      title: "Royal 4-pillar carved heritage Mandap",
      vendor: "Royal Rajputana Sets",
      status: "done",
      cost: 280000,
      notes: null,
    },
    {
      id: "i7-wedding-flowers",
      function_id: "f3-wedding",
      category: "flowers",
      title: "Fresh Rajnigandha & Red Rose Mandap dome",
      vendor: "Jaipur Flora Co.",
      status: "in_progress",
      cost: 150000,
      notes: null,
    },
    {
      id: "i8-wedding-shehnai",
      function_id: "f3-wedding",
      category: "instruments",
      title: "Traditional Shehnai & Nagada ensemble",
      vendor: "Vedic Troupe",
      status: "not_started",
      cost: 35000,
      notes: null,
    },
  ],
};

const demoPortalPayments: PaymentRecord[] = [
  {
    id: "pay-1",
    amount: 450000,
    paid_on: "2026-08-15",
    mode: "RTGS Bank Transfer",
    note: "Initial booking deposit & venue blocking",
  },
  {
    id: "pay-2",
    amount: 400000,
    paid_on: "2026-10-01",
    mode: "NEFT Bank Transfer",
    note: "Milestone 2: 3D Design sign-off & material procurement",
  },
];

// ─── Data‑fetching functions (Supabase → fallback) ──────────────────────────────

export interface PortalData {
  event: AdminEventSummary | null;
  functions: AdminFunction[];
  itemsByFunction: Record<string, AdminItem[]>;
  payments: PaymentRecord[];
  agreedTotal: number;
}

/**
 * Fetch the complete portal data for a given customer user ID.
 * First finds the event linked to the customer, then loads functions, items,
 * and (optionally) payment data depending on show_payments_to_customer.
 */
export async function getPortalDataForCustomer(
  userId: string
): Promise<PortalData> {
  try {
    const supabase = await createClient();

    // 1. Find the event linked to this customer
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("customer_id", userId)
      .maybeSingle();

    if (eventError || !eventData) {
      // Return demo data for local preview
      return getDemoPortalData();
    }

    const event: AdminEventSummary = {
      id: eventData.id,
      name: eventData.name,
      type: eventData.type,
      date: eventData.date,
      venue: eventData.venue,
      status: eventData.status,
      customer_id: eventData.customer_id,
      show_payments_to_customer: eventData.show_payments_to_customer,
    };

    // 2. Fetch functions
    const { data: funcsData } = await supabase
      .from("event_functions")
      .select("*")
      .eq("event_id", event.id)
      .order("date", { ascending: true });

    const functions: AdminFunction[] = funcsData || [];

    // 3. Fetch items for each function
    const itemsByFunction: Record<string, AdminItem[]> = {};
    if (functions.length > 0) {
      const funcIds = functions.map((f) => f.id);
      const { data: itemsData } = await supabase
        .from("event_items")
        .select("*")
        .in("function_id", funcIds);

      (itemsData || []).forEach((item: any) => {
        if (!itemsByFunction[item.function_id]) {
          itemsByFunction[item.function_id] = [];
        }
        itemsByFunction[item.function_id].push(item);
      });
    }

    // 4. Conditionally fetch payments
    let payments: PaymentRecord[] = [];
    let agreedTotal = 0;

    if (event.show_payments_to_customer) {
      const [budgetRes, paymentsRes] = await Promise.all([
        supabase
          .from("budgets")
          .select("agreed_total")
          .eq("event_id", event.id)
          .maybeSingle(),
        supabase
          .from("payments")
          .select("*")
          .eq("event_id", event.id)
          .order("paid_on", { ascending: false }),
      ]);

      agreedTotal = budgetRes.data?.agreed_total ?? 0;
      payments = (paymentsRes.data as PaymentRecord[]) || [];
    }

    return { event, functions, itemsByFunction, payments, agreedTotal };
  } catch {
    return getDemoPortalData();
  }
}

function getDemoPortalData(): PortalData {
  return {
    event: demoPortalEvent,
    functions: demoPortalFunctions,
    itemsByFunction: demoPortalItems,
    payments: demoPortalPayments,
    agreedTotal: demoPortalEvent.budget_total || 0,
  };
}
