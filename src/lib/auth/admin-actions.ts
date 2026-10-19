"use server";

import "server-only";
import * as crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { usernameToEmail, sanitizeUsername } from "@/lib/auth/synthetic-email";
import { createCustomerSchema } from "@/lib/auth/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { verifyAdminCaller } from "@/lib/auth/verify-admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
    const { data: existingUser, error: existingUserError } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();
    if (existingUserError) {
      return { success: false, error: existingUserError.message };
    }

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
      const { data: event, error: eventError } = await adminSupabase
        .from("events")
        .update({ customer_id: customerUserId })
        .eq("id", eventId)
        .select("id")
        .maybeSingle();
      if (eventError || !event) {
        await adminSupabase.from("profiles").delete().eq("id", customerUserId);
        await adminSupabase.auth.admin.deleteUser(customerUserId);
        return {
          success: false,
          error: eventError?.message || "The selected event could not be linked.",
        };
      }
    }

    // 8. Record audit log
    const { error: auditError } = await adminSupabase.from("audit_log").insert({
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
    if (auditError) return { success: false, error: auditError.message };

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
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
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
    const input = z
      .object({ customerId: z.string().uuid(), enable: z.boolean() })
      .safeParse({ customerId, enable });
    if (!input.success) return { success: false, error: "Invalid customer access request." };
    const adminUser = await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const { data: customer, error } = await adminSupabase
      .from("profiles")
      .update({ access_enabled: input.data.enable })
      .eq("id", input.data.customerId)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    if (!customer) return { success: false, error: "Customer was not found." };

    // Record audit log
    const { error: auditError } = await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: input.data.enable ? "ENABLE_PORTAL_ACCESS" : "DISABLE_PORTAL_ACCESS",
      table_name: "profiles",
      row_id: input.data.customerId,
      payload: { access_enabled: input.data.enable },
    });
    if (auditError) return { success: false, error: auditError.message };

    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update access." };
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
    const input = z
      .object({
        customerId: z.string().uuid(),
        customPassword: z.string().min(8).max(200).optional(),
      })
      .safeParse({ customerId, customPassword });
    if (!input.success) {
      return { success: false, error: input.error.issues[0]?.message ?? "Invalid password reset request." };
    }

    const generatedPassword =
      input.data.customPassword || "Pass@" + crypto.randomBytes(6).toString("hex");

    const adminUser = await verifyAdminCaller();
    const adminSupabase = createAdminClient();

    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      input.data.customerId,
      {
        password: generatedPassword,
      }
    );

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Force user to change password on their next login
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", input.data.customerId);
    if (profileError) return { success: false, error: profileError.message };

    // Record audit log
    const { error: auditError } = await adminSupabase.from("audit_log").insert({
      actor_id: adminUser.id,
      action: "RESET_CUSTOMER_PASSWORD",
      table_name: "profiles",
      row_id: input.data.customerId,
      payload: { must_change_password: true },
    });
    if (auditError) return { success: false, error: auditError.message };

    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return {
      success: true,
      newPassword: generatedPassword,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to reset password." };
  }
}

/**
 * General Sign Out action.
 */
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
  } catch {}
  redirect("/login");
}
