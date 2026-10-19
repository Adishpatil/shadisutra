import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Database } from "../src/lib/supabase/types";

function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set in the environment.`);
  return value;
}

function assertNoError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function requireData<T>(data: T | null, message: string): T {
  if (data === null) throw new Error(message);
  return data;
}

async function runSeed(): Promise<void> {
  loadLocalEnv();

  if (process.env.NODE_ENV === "production") {
    throw new Error("The seed script cannot run when NODE_ENV=production.");
  }

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const passwords = {
    admin: requireEnv("SEED_ADMIN_PASSWORD"),
    customer1: requireEnv("SEED_CUSTOMER1_PASSWORD"),
    customer2: requireEnv("SEED_CUSTOMER2_PASSWORD"),
  };
  for (const password of Object.values(passwords)) {
    if (password.length < 12) {
      throw new Error("Seed passwords must be at least 12 characters long.");
    }
  }

  const hostname = new URL(supabaseUrl).hostname;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";
  const isConfirmedDevelopment =
    process.env.SUPABASE_SEED_TARGET === "development" &&
    hostname.endsWith(".supabase.co");
  if (!isLocal && !isConfirmedDevelopment) {
    throw new Error(
      "Refusing to seed a remote project. Set SUPABASE_SEED_TARGET=development only for a development Supabase project."
    );
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const usersByEmail = new Map<string, { id: string }>();
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw new Error(`Could not list seed users: ${error.message}`);
    for (const user of data.users) {
      if (user.email) usersByEmail.set(user.email, { id: user.id });
    }
    if (data.users.length < 100) break;
  }

  async function createOrUpdateUser(
    email: string,
    password: string,
    metadata: { full_name: string; username: string; role: "admin" | "customer" },
    accessEnabled: boolean,
    mustChangePassword: boolean
  ): Promise<string> {
    const existing = usersByEmail.get(email);
    let userId: string;

    if (existing) {
      const { data, error } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password, user_metadata: metadata }
      );
      if (error) throw new Error(`Could not update seed user: ${error.message}`);
      if (!data.user) throw new Error("Could not update seed user: no user returned.");
      userId = data.user.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error || !data.user) {
        throw new Error(`Could not create seed user: ${error?.message ?? "No user returned."}`);
      }
      userId = data.user.id;
      usersByEmail.set(email, { id: userId });
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      role: metadata.role,
      username: metadata.username,
      full_name: metadata.full_name,
      access_enabled: accessEnabled,
      must_change_password: mustChangePassword,
    });
    assertNoError(profileError);
    return userId;
  }

  const adminId = await createOrUpdateUser(
    "admin@shadisutra.app",
    passwords.admin,
    { full_name: "Master Administrator", username: "admin", role: "admin" },
    true,
    false
  );
  const customer1Id = await createOrUpdateUser(
    "sharma_wedding@shadisutra.app",
    passwords.customer1,
    {
      full_name: "Priyanshu & Ananya Sharma",
      username: "sharma_wedding",
      role: "customer",
    },
    true,
    false
  );
  const customer2Id = await createOrUpdateUser(
    "mehta_birthday@shadisutra.app",
    passwords.customer2,
    {
      full_name: "Rajesh & Priya Mehta",
      username: "mehta_birthday",
      role: "customer",
    },
    false,
    true
  );

  async function getOrCreateEvent(input: {
    customerId: string;
    name: string;
    type: "wedding" | "birthday";
    date: string;
    venue: string;
    status: "planning" | "finalized";
    showPayments: boolean;
  }): Promise<string> {
    const { data: existing, error: lookupError } = await supabase
      .from("events")
      .select("id")
      .eq("customer_id", input.customerId)
      .maybeSingle();
    assertNoError(lookupError);

    const values = {
      customer_id: input.customerId,
      name: input.name,
      type: input.type,
      date: input.date,
      venue: input.venue,
      status: input.status,
      show_payments_to_customer: input.showPayments,
    };
    if (existing) {
      const { data, error } = await supabase
        .from("events")
        .update(values)
        .eq("id", existing.id)
        .select("id")
        .single();
      assertNoError(error);
      return requireData(data, "Could not update the seed event.").id;
    }
    const { data, error } = await supabase
      .from("events")
      .insert(values)
      .select("id")
      .single();
    assertNoError(error);
    return requireData(data, "Could not create the seed event.").id;
  }

  const weddingId = await getOrCreateEvent({
    customerId: customer1Id,
    name: "Sharma Royal Wedding Celebrations",
    type: "wedding",
    date: "2026-11-20",
    venue: "The Oberoi Rajvilas, Jaipur",
    status: "finalized",
    showPayments: true,
  });
  const birthdayId = await getOrCreateEvent({
    customerId: customer2Id,
    name: "Aarav's First Birthday Celebration",
    type: "birthday",
    date: "2026-12-12",
    venue: "Palm Grove Banquet, Mumbai",
    status: "planning",
    showPayments: false,
  });

  async function clearEventRows(eventId: string): Promise<void> {
    for (const table of ["timeline_entries", "designs", "guests", "payments", "budgets", "event_functions"] as const) {
      const { error } = await supabase.from(table).delete().eq("event_id", eventId);
      assertNoError(error);
    }
  }

  async function seedEvent(
    eventId: string,
    functions: Array<{
      name: string;
      date: string;
      start_time: string;
      notes: string;
      items: Array<{
        category: "lighting" | "flowers" | "decor" | "instruments" | "other";
        title: string;
        vendor: string;
        status: "not_started" | "in_progress" | "done";
        cost: number;
      }>;
    }>,
    agreedTotal: number,
    payments: Array<{
      amount: number;
      paid_on: string;
      mode: string;
      note: string;
    }>,
    guests: Array<{
      name: string;
      party_size: number;
      phone: string;
      rsvp: "pending" | "yes" | "no";
      table_no: string;
      notes: string;
    }>
  ): Promise<void> {
    await clearEventRows(eventId);
    const { data: insertedFunctions, error: functionsError } = await supabase
      .from("event_functions")
      .insert(
        functions.map(({ name, date, start_time, notes }) => ({
          event_id: eventId,
          name,
          date,
          start_time,
          notes,
        }))
      )
      .select("id,name");
    assertNoError(functionsError);
    const functionRows = requireData(
      insertedFunctions,
      "Could not create the seed event functions."
    );

    const functionIdByName = new Map(
      functionRows.map((eventFunction) => [eventFunction.name, eventFunction.id])
    );
    const items = functions.flatMap((eventFunction) =>
      {
        const functionId = functionIdByName.get(eventFunction.name);
        if (!functionId) {
          throw new Error(`Missing seeded function ID for ${eventFunction.name}.`);
        }
        return eventFunction.items.map((item) => ({
          ...item,
          function_id: functionId,
        }));
      }
    );
    if (items.length) {
      const { error } = await supabase.from("event_items").insert(items);
      assertNoError(error);
    }

    const timelineEntries = functions.flatMap((eventFunction) => {
      const functionId = functionIdByName.get(eventFunction.name);
      if (!functionId) {
        throw new Error(`Missing seeded function ID for ${eventFunction.name}.`);
      }
      return [
        {
          event_id: eventId,
          function_id: functionId,
          starts_at: new Date(
            `${eventFunction.date}T${eventFunction.start_time}+05:30`
          ).toISOString(),
          title: eventFunction.name,
          notes: eventFunction.notes,
        },
      ];
    });
    const { error: timelineError } = await supabase
      .from("timeline_entries")
      .insert(timelineEntries);
    assertNoError(timelineError);

    const { error: budgetError } = await supabase.from("budgets").upsert({
      event_id: eventId,
      agreed_total: agreedTotal,
    });
    assertNoError(budgetError);
    if (payments.length) {
      const { error } = await supabase
        .from("payments")
        .insert(payments.map((payment) => ({ ...payment, event_id: eventId })));
      assertNoError(error);
    }
    if (guests.length) {
      const { error } = await supabase
        .from("guests")
        .insert(guests.map((guest) => ({ ...guest, event_id: eventId })));
      assertNoError(error);
    }
  }

  await seedEvent(
    weddingId,
    [
      {
        name: "Haldi",
        date: "2026-11-19",
        start_time: "10:30:00",
        notes: "Poolside ceremony",
        items: [
          { category: "flowers", title: "Marigold arrangements", vendor: "Jaipur Flora Co.", status: "done", cost: 65000 },
          { category: "instruments", title: "Punjabi dhol troupe", vendor: "Sur Sangeet Ensemble", status: "done", cost: 25000 },
        ],
      },
      {
        name: "Sangeet",
        date: "2026-11-19",
        start_time: "19:30:00",
        notes: "Ballroom stage and sound check",
        items: [
          { category: "lighting", title: "Moving-head stage lighting", vendor: "Lumina FX", status: "in_progress", cost: 95000 },
        ],
      },
      {
        name: "Wedding Ceremony",
        date: "2026-11-20",
        start_time: "18:00:00",
        notes: "Palace courtyard",
        items: [
          { category: "decor", title: "Four-pillar wedding mandap", vendor: "Royal Rajputana Sets", status: "done", cost: 280000 },
        ],
      },
    ],
    1250000,
    [
      { amount: 450000, paid_on: "2026-08-15", mode: "RTGS", note: "Initial booking deposit" },
      { amount: 400000, paid_on: "2026-10-01", mode: "NEFT", note: "Design sign-off milestone" },
    ],
    [
      { name: "Ramesh & Sunita Sharma", party_size: 4, phone: "9876543201", rsvp: "yes", table_no: "VIP 1", notes: "Immediate family" },
      { name: "Meenakshi Verma", party_size: 1, phone: "9876543203", rsvp: "pending", table_no: "Table 4", notes: "Awaiting travel details" },
    ]
  );
  await seedEvent(
    birthdayId,
    [
      {
        name: "Safari Party",
        date: "2026-12-12",
        start_time: "16:30:00",
        notes: "Jungle theme and cake cutting",
        items: [
          { category: "decor", title: "Animal cutouts and balloon garland", vendor: "Wonderland Parties", status: "in_progress", cost: 55000 },
        ],
      },
    ],
    180000,
    [{ amount: 60000, paid_on: "2026-10-10", mode: "UPI", note: "Booking deposit" }],
    [
      { name: "Vikram & Pooja Shah", party_size: 3, phone: "9822334455", rsvp: "yes", table_no: "Kids Area", notes: "Attending with two children" },
    ]
  );

  const enquiry = {
    name: "Demo Enquiry",
    phone: "9000000000",
    event_type: "wedding",
    event_date: "2027-02-14",
    message: "Local seed enquiry for testing the admin enquiries list.",
  };
  const { data: existingEnquiry, error: enquiryLookupError } = await supabase
    .from("enquiries")
    .select("id")
    .eq("name", enquiry.name)
    .eq("phone", enquiry.phone)
    .maybeSingle();
  assertNoError(enquiryLookupError);
  const { error: enquiryError } = existingEnquiry
    ? await supabase
        .from("enquiries")
        .update(enquiry)
        .eq("id", existingEnquiry.id)
    : await supabase.from("enquiries").insert(enquiry);
  assertNoError(enquiryError);

  const { error: clearAuditError } = await supabase
    .from("audit_log")
    .delete()
    .eq("action", "SEED_DEMO_DATA")
    .eq("row_id", weddingId);
  assertNoError(clearAuditError);
  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: adminId,
    action: "SEED_DEMO_DATA",
    table_name: "events",
    row_id: weddingId,
    payload: { event_id: weddingId },
  });
  assertNoError(auditError);
  console.info("Seed data is ready. Passwords were not printed.");
}

runSeed().catch((error: unknown) => {
  console.error("Seed failed:", error instanceof Error ? error.message : "Unknown error.");
  process.exitCode = 1;
});
