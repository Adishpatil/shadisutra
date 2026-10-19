"use server";

import { createClient } from "@/lib/supabase/server";
import { usernameToEmail, sanitizeUsername } from "@/lib/auth/synthetic-email";
import { loginSchema } from "@/lib/auth/schemas";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { signAuthToken } from '@/lib/auth';

// Rate limiting map: tracks failed attempts per username (max 5 per 5 minutes)
interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 5;

  const record = loginAttempts.get(key);

  if (!record) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - record.firstAttempt > windowMs) {
    // Reset window
    loginAttempts.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

function resetRateLimit(key: string) {
  loginAttempts.delete(key);
}

export interface LoginActionResult {
  success?: boolean;
  error?: string;
  requiresMfa?: boolean;
  factorId?: string;
}

export async function loginAction(
  prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const rawUsername = formData.get("username")?.toString() || "";
  const rawPassword = formData.get("password")?.toString() || "";

  // 1. Zod Validation
  const validation = loginSchema.safeParse({
    username: rawUsername,
    password: rawPassword,
  });

  if (!validation.success) {
    return { error: "Invalid username or password." };
  }

  const cleanUsername = sanitizeUsername(validation.data.username);

  // 2. Rate Limiting Check
  if (!checkRateLimit(cleanUsername)) {
    return {
      error: "Too many failed login attempts. Please wait 5 minutes before trying again.",
    };
  }

  const email = usernameToEmail(cleanUsername);

  const supabase = await createClient();

  // 3. Authenticate with Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password: validation.data.password,
    });

  if (authError || !authData.user) {
    return { error: "Invalid username or password." };
  }

  // 4. Query user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, access_enabled, must_change_password")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Invalid username or password." };
  }

  // 5. Customer Access Control: Must have access_enabled = true
  if (profile.role === "customer" && !profile.access_enabled) {
    await supabase.auth.signOut();
    return {
      error:
        "Portal access is currently not enabled for this account. Please reach out to your event coordinator.",
    };
  }

  // Reset rate limiting on successful authentication
  resetRateLimit(cleanUsername);

  // 6. Admin TOTP MFA Check
  if (profile.role === "admin") {
    const { data: aalData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalData && aalData.nextLevel === "aal2" && aalData.currentLevel === "aal1") {
      // Find verified TOTP factor
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp.find((f) => f.status === "verified");

      if (totpFactor) {
        return {
          requiresMfa: true,
          factorId: totpFactor.id,
        };
      }
    }
  }

  // 7. Forced Password Change Check
  if (profile.must_change_password) {
    redirect("/change-password");
  }

  // 8. Role-based redirect with JWT cookie
  // Create signed JWT for session
  const token = signAuthToken({ userId: authData.user.id, role: profile.role });
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });
  if (profile.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/portal");
  }
}

/**
 * Verifies TOTP MFA code for Admin accounts
 */
export async function verifyMfaAction(
  factorId: string,
  code: string
): Promise<LoginActionResult> {
  const supabase = await createClient();

  const { error: challengeError, data: challengeData } =
    await supabase.auth.mfa.challenge({ factorId });

  if (challengeError) {
    return { error: "Failed to generate MFA challenge. Please try again." };
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code: code.trim(),
  });

  if (verifyError) {
    return { error: "Invalid authenticator code. Please check your app." };
  }

  redirect("/admin");
}
