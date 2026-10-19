import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function verifyAdminCaller(): Promise<{ id: string; email?: string; role: "admin" }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new Error(`Could not verify administrator session: ${userError.message}`);
  if (!user) throw new Error("Unauthorized: Active administrator session required.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,access_enabled")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Could not verify administrator profile: ${profileError.message}`);
  if (!profile || profile.role !== "admin" || !profile.access_enabled) {
    throw new Error("Unauthorized: Active administrator session required.");
  }

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) {
    throw new Error(`Could not verify administrator MFA: ${assuranceError.message}`);
  }
  if (assurance.currentLevel !== "aal2") {
    throw new Error("Unauthorized: Administrator MFA verification is required.");
  }

  return { id: user.id, email: user.email ?? undefined, role: "admin" };
}
