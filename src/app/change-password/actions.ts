"use server";

import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/auth/schemas";
import { redirect } from "next/navigation";

export interface ChangePasswordResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function changePasswordAction(
  prevState: ChangePasswordResult | null,
  formData: FormData
): Promise<ChangePasswordResult> {
  const newPassword = formData.get("newPassword")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  // 1. Zod validation
  const validation = changePasswordSchema.safeParse({
    newPassword,
    confirmPassword,
  });

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "general";
      fieldErrors[field] = issue.message;
    }
    return {
      error: "Please correct the errors below.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  // 2. Verify authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 3. Update Supabase Auth password
  const { error: authError } = await supabase.auth.updateUser({
    password: validation.data.newPassword,
  });

  if (authError) {
    return {
      error: authError.message || "Failed to update password. Please try again.",
    };
  }

  // 4. Update profile must_change_password = false
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile update error:", profileError);
  }

  // 5. Query user role to determine destination
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/portal");
  }
}
