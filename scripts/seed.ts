import { createClient } from "@supabase/supabase-js";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

// Load .env.local manually if not populated
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generateSecurePassword(): string {
  return "Pass@" + crypto.randomBytes(6).toString("hex");
}

async function runSeed() {
  console.log("----------------------------------------------------------------");
  console.log("       Shadi Sutra: Local Database Seed Utility                 ");
  console.log("----------------------------------------------------------------");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined."
    );
    console.error("Please configure your credentials in .env.local first.");
    process.exit(1);
  }

  // Safety Guard: Refuse to run against production unless forced
  const isLocalOrDev =
    supabaseUrl.includes("localhost") ||
    supabaseUrl.includes("127.0.0.1") ||
    supabaseUrl.includes(".supabase.co");

  const hasForceFlag = process.argv.includes("--force");

  if (!isLocalOrDev && !hasForceFlag) {
    console.error(
      "❌ Safety Abort: Target project is not recognized as local or development."
    );
    console.error("To override and force seed execution, pass the --force flag:");
    console.error("   npm run seed -- --force");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || generateSecurePassword();
  const customer1Password = process.env.SEED_CUSTOMER1_PASSWORD || generateSecurePassword();
  const customer2Password = process.env.SEED_CUSTOMER2_PASSWORD || generateSecurePassword();

  console.log("🌱 Starting seed operations...\n");

  // Helper: Create or get auth user
  async function createOrGetUser(email: string, pass: string, metadata: { full_name: string; username: string; role: string }) {
    // Check if user exists
    const { data: existingList } = await supabase.auth.admin.listUsers();
    const existing = existingList?.users.find((u) => u.email === email);

    if (existing) {
      console.log(`ℹ️  User ${email} already exists. Updating profile...`);
      await supabase.from("profiles").upsert({
        id: existing.id,
        role: metadata.role as any,
        username: metadata.username,
        full_name: metadata.full_name,
        access_enabled: true,
        must_change_password: false,
      });
      return existing.id;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: pass,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error || !data.user) {
      throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
    }

    // Insert or update profile
    await supabase.from("profiles").upsert({
      id: data.user.id,
      role: metadata.role as any,
      username: metadata.username,
      full_name: metadata.full_name,
      access_enabled: true,
      must_change_password: false,
    });

    return data.user.id;
  }

  // 1. Create Admin
  const adminId = await createOrGetUser("admin@shadisutra.app", adminPassword, {
    full_name: "Master Administrator",
    username: "admin",
    role: "admin",
  });
  console.log("✅ Admin account provisioned.");

  // 2. Create Demo Customer 1 (Wedding)
  const cust1Id = await createOrGetUser("sharma_wedding@shadisutra.app", customer1Password, {
    full_name: "Priyanshu & Ananya Sharma",
    username: "sharma_wedding",
    role: "customer",
  });
  console.log("✅ Demo Customer 1 (Sharma Wedding) provisioned.");

  // 3. Create Demo Customer 2 (Birthday)
  const cust2Id = await createOrGetUser("mehta_birthday@shadisutra.app", customer2Password, {
    full_name: "Rajesh & Priya Mehta",
    username: "mehta_birthday",
    role: "customer",
  });
  console.log("✅ Demo Customer 2 (Mehta Birthday) provisioned.");

  // 4. Create Event 1 (Wedding)
  const { data: event1, error: ev1Err } = await supabase
    .from("events")
    .upsert({
      name: "Sharma Royal Wedding & Celebrations",
      customer_id: cust1Id,
      type: "wedding",
      date: "2026-11-20",
      venue: "The Oberoi Rajvilas, Jaipur",
      status: "finalized",
      show_payments_to_customer: true,
    })
    .select()
    .single();

  if (ev1Err) throw new Error(`Event 1 creation error: ${ev1Err.message}`);
  console.log("✅ Event 1 (Wedding) created.");

  // Event 1 Functions
  const { data: fHaldi } = await supabase
    .from("event_functions")
    .insert({
      event_id: event1.id,
      name: "Vibrant Haldi & Phoolon Ki Holi",
      date: "2026-11-19",
      start_time: "10:30:00",
      notes: "Yellow marigold dress code, poolside terrace",
    })
    .select()
    .single();

  const { data: fSangeet } = await supabase
    .from("event_functions")
    .insert({
      event_id: event1.id,
      name: "Grand Sangeet & Musical Extravaganza",
      date: "2026-11-19",
      start_time: "19:30:00",
      notes: "Ballroom stage, DJ sound, couple entry sequence",
    })
    .select()
    .single();

  const { data: fWedding } = await supabase
    .from("event_functions")
    .insert({
      event_id: event1.id,
      name: "Varmala & Sacred Phere",
      date: "2026-11-20",
      start_time: "18:00:00",
      notes: "Palace courtyard mandap with lotus pond",
    })
    .select()
    .single();

  // Event 1 Items (Admin Tracking)
  if (fHaldi) {
    await supabase.from("event_items").insert([
      {
        function_id: fHaldi.id,
        category: "flowers",
        title: "Marigold floral fountain and yellow drapes",
        vendor: "Jaipur Flora Co.",
        status: "done",
        cost: 65000,
      },
      {
        function_id: fHaldi.id,
        category: "instruments",
        title: "Live Punjabi Dhol & Tasha troupe",
        vendor: "Sur Sangeet Ensemble",
        status: "done",
        cost: 25000,
      },
    ]);
  }

  if (fSangeet) {
    await supabase.from("event_items").insert([
      {
        function_id: fSangeet.id,
        category: "lighting",
        title: "Moving heads, warm stage washes & kinetic cold pyros",
        vendor: "Lumina FX",
        status: "in_progress",
        cost: 95000,
      },
      {
        function_id: fSangeet.id,
        category: "decor",
        title: "LED acrylic stage flooring & customized neon backdrop",
        vendor: "Artisan Stages",
        status: "in_progress",
        cost: 140000,
      },
    ]);
  }

  if (fWedding) {
    await supabase.from("event_items").insert([
      {
        function_id: fWedding.id,
        category: "decor",
        title: "Royal 4-pillar Carved Mandap with Rose Chandeliers",
        vendor: "Royal Rajputana Sets",
        status: "done",
        cost: 280000,
      },
    ]);
  }

  // Event 1 Budget & Payments
  await supabase.from("budgets").upsert({
    event_id: event1.id,
    agreed_total: 1250000,
  });

  await supabase.from("payments").insert([
    {
      event_id: event1.id,
      amount: 450000,
      paid_on: "2026-08-15",
      mode: "RTGS Bank Transfer",
      note: "Initial booking deposit & venue blocking",
    },
    {
      event_id: event1.id,
      amount: 400000,
      paid_on: "2026-10-01",
      mode: "NEFT Bank Transfer",
      note: "Milestone 2: Design sign-off and material procurement",
    },
  ]);

  // Event 1 Finalized Designs
  await supabase.from("designs").insert([
    {
      event_id: event1.id,
      title: "Mandap Architectural 3D Rendering (Final)",
      file_path: "demo/sharma-mandap-v2.pdf",
      version: 2,
      is_finalized: true,
    },
    {
      event_id: event1.id,
      title: "Sangeet Stage Lighting Scheme (Draft v1)",
      file_path: "demo/sharma-stage-draft.webp",
      version: 1,
      is_finalized: false, // Not visible to customer
    },
  ]);

  // Event 1 Guests
  await supabase.from("guests").insert([
    {
      event_id: event1.id,
      name: "Ramesh & Sunita Sharma",
      party_size: 4,
      phone: "9876543201",
      rsvp: "yes",
      table_no: "VIP Table 1",
      notes: "Immediate family, suite 201",
    },
    {
      event_id: event1.id,
      name: "Col. Vikram Rathore",
      party_size: 2,
      phone: "9876543202",
      rsvp: "yes",
      table_no: "VIP Table 2",
      notes: "Arriving on 19th morning",
    },
    {
      event_id: event1.id,
      name: "Meenakshi Verma",
      party_size: 1,
      phone: "9876543203",
      rsvp: "pending",
      table_no: "Table 4",
      notes: "Awaiting travel schedule",
    },
  ]);

  console.log("✅ Event 1 complete data seeded.");

  // 5. Create Event 2 (Birthday)
  const { data: event2, error: ev2Err } = await supabase
    .from("events")
    .upsert({
      name: "Aarav's 1st Royal Safari Birthday Jubilee",
      customer_id: cust2Id,
      type: "birthday",
      date: "2026-12-12",
      venue: "Palm Grove Banquet, Mumbai",
      status: "planning",
      show_payments_to_customer: false,
    })
    .select()
    .single();

  if (ev2Err) throw new Error(`Event 2 creation error: ${ev2Err.message}`);

  const { data: fBirthday } = await supabase
    .from("event_functions")
    .insert({
      event_id: event2.id,
      name: "Safari Party & Magic Games",
      date: "2026-12-12",
      start_time: "16:30:00",
      notes: "Jungle theme cake cutting & puppet show",
    })
    .select()
    .single();

  if (fBirthday) {
    await supabase.from("event_items").insert([
      {
        function_id: fBirthday.id,
        category: "decor",
        title: "3D animal cutouts, foliage arches & custom balloon garland",
        vendor: "Wonderland Parties",
        status: "in_progress",
        cost: 55000,
      },
    ]);
  }

  await supabase.from("budgets").upsert({
    event_id: event2.id,
    agreed_total: 180000,
  });

  await supabase.from("payments").insert([
    {
      event_id: event2.id,
      amount: 60000,
      paid_on: "2026-10-10",
      mode: "UPI",
      note: "Booking token amount",
    },
  ]);

  console.log("✅ Event 2 complete data seeded.");

  console.log("\n================================================================");
  console.log("       🎉 SEED DATA CREATED SUCCESSFULLY                        ");
  console.log("================================================================");
  console.log("Save these credentials securely (they are not logged elsewhere):\n");
  console.log("🔑 [ADMIN]");
  console.log(`   Username: admin`);
  console.log(`   Email:    admin@shadisutra.app`);
  console.log(`   Password: ${adminPassword}\n`);

  console.log("🔑 [CUSTOMER 1 - Wedding]");
  console.log(`   Username: sharma_wedding`);
  console.log(`   Email:    sharma_wedding@shadisutra.app`);
  console.log(`   Password: ${customer1Password}\n`);

  console.log("🔑 [CUSTOMER 2 - Birthday]");
  console.log(`   Username: mehta_birthday`);
  console.log(`   Email:    mehta_birthday@shadisutra.app`);
  console.log(`   Password: ${customer2Password}`);
  console.log("================================================================\n");
}

runSeed().catch((err) => {
  console.error("❌ Seed failed with error:", err);
  process.exit(1);
});
