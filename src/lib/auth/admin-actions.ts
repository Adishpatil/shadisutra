"use server";

import "server-only";
import * as crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { usernameToEmail, sanitizeUsername } from "@/lib/auth/synthetic-email";
import { createCustomerSchema } from "@/lib/auth/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Helper to verify that the calling session is an active Administrator.
 */
async function verifyAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Authentication required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, access_enabled")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.access_enabled) {
    throw new Error("Forbidden: Administrator privileges required.");
  }

  return user;
}

export interface CreatedCustomerResult {
  success: boolean;
  error?: string;
  credentials?: {
    username: string;
    password: string; // One-time display to admin
    fullName: string;
  };
}

/**
 * Admin action: Provision a new Customer portal account.
 * Uses service-role key on the server. Never logs passwords in plaintext.
 */
export async function createCustomerAccountAction(
  formData: FormData
): Promise<CreatedCustomerResult> {
  try {
    // 1. Verify caller is an admin
    const adminUser = await verifyAdminCaller();

    const rawData = {
      fullName: formData.get("fullName")?.toString() || "",
      username: formData.get("username")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      eventId: formData.get("eventId")?.toString() || "",
    };

    // 2. Validate input with Zod
    const validation = createCustomerSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input parameters.",
      };
    }

    const { fullName, eventId } = validation.data;
    const cleanUsername = sanitizeUsername(validation.data.username);

    // 3. Password generation or assignment
    const generatedPassword =
      validation.data.password ||
      "Pass@" + crypto.randomBytes(6).toString("hex");

    const email = usernameToEmail(cleanUsername);
    const adminSupabase = createAdminClient();

    // 4. Check if username already exists in profiles
    const { data: existingUser } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return {
        success: false,
        error: `Username "${cleanUsername}" is already taken. Please choose another.`,
      };
    }

    // 5. Create Supabase Auth user using service role
    const { data: newAuth, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          username: cleanUsername,
          role: "customer",
        },
      });

    if (authError || !newAuth.user) {
      return {
        success: false,
        error: authError?.message || "Failed to create customer user account.",
      };
    }

    const customerUserId = newAuth.user.id;

    // 6. Create Profile (access_enabled = false, must_change_password = true)
    const { error: profileError } = await adminSupabase.from("profiles").upsert({
      id: customerUserId,
      role: "customer",
      username: cleanUsername,
      full_name: fullName,
      access_enabled: false,
      must_change_password: true,
    });

    if (profileError) {
      // Cleanup auth user on profile failure
      await adminSupabase.auth.admin.deleteUser(customerUserId);
      return {
        success: false,
        error: `Failed to create profile: ${profileError.message}`,
      };
    }

    // 7. Link to event if eventId was supplied
    if (eventId) {
      await adminSupabase
        .from("events")
        .update({ customer_id: customerUserId })
        .eq("id", eventId);
    }

    // 8. Record audit log
    await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "CREATE_CUSTOMER",
      table_name: "profiles",
      row_id: customerUserId,
      payload: {
        username: cleanUsername,
        full_name: fullName,
        linked_event_id: eventId || null,
      },
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return {
      success: true,
      credentials: {
        username: cleanUsername,
        password: generatedPassword,
        fullName,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

/**
 * Admin action: Toggle customer portal access on or off.
 */
export async function toggleCustomerAccessAction(
  customerId: string,
  enable: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("profiles")
      .update({ access_enabled: enable })
      .eq("id", customerId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Record audit log
    await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: enable ? "ENABLE_PORTAL_ACCESS" : "DISABLE_PORTAL_ACCESS",
      table_name: "profiles",
      row_id: customerId,
      payload: { access_enabled: enable },
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: Reset customer password.
 */
export async function resetCustomerPasswordAction(
  customerId: string,
  customPassword?: string
): Promise<{ success: boolean; newPassword?: string; error?: string }> {
  try {
    const adminUser = await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const generatedPassword =
      customPassword || "Pass@" + crypto.randomBytes(6).toString("hex");

    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      customerId,
      {
        password: generatedPassword,
      }
    );

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Force user to change password on their next login
    await adminSupabase
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", customerId);

    // Record audit log
    await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "RESET_CUSTOMER_PASSWORD",
      table_name: "profiles",
      row_id: customerId,
      payload: { must_change_password: true },
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return {
      success: true,
      newPassword: generatedPassword,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * General Sign Out action.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
