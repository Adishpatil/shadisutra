"use server";

import "server-only";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { loginSchema } from "@/lib/auth/schemas";
import { sanitizeUsername, usernameToEmail } from "@/lib/auth/synthetic-email";
import { consumeRateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const INVALID_LOGIN = "Invalid username or password";

export interface LoginActionResult {
  error?: string;
  requiresMfa?: boolean;
  requiresEnrollment?: boolean;
  factorId?: string;
  qrCode?: string;
}

export async function loginAction(
  _previousState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: INVALID_LOGIN };

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: INVALID_LOGIN };
  }

  const username = sanitizeUsername(parsed.data.username);
  const requestHeaders = await headers();
  const allowed = await consumeRateLimit(
    rateLimitKey(requestHeaders, "admin-login", username),
    5,
    300
  );
  if (!allowed) return { error: INVALID_LOGIN };

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password: parsed.data.password,
    });

  if (authError || !authData.user) return { error: INVALID_LOGIN };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,access_enabled")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (
    profileError ||
    profile?.role !== "admin" ||
    !profile.access_enabled
  ) {
    await supabase.auth.signOut();
    return { error: INVALID_LOGIN };
  }

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) {
    await supabase.auth.signOut();
    return { error: INVALID_LOGIN };
  }
  if (assurance.currentLevel === "aal2") redirect("/admin");

  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();
  if (factorsError) {
    await supabase.auth.signOut();
    return { error: INVALID_LOGIN };
  }

  const verifiedFactor = factors.totp.find((factor) => factor.status === "verified");
  if (verifiedFactor) {
    return { requiresMfa: true, factorId: verifiedFactor.id };
  }

  const { data: enrollment, error: enrollmentError } =
    await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Shadi Sutra Admin",
    });
  if (enrollmentError || enrollment.type !== "totp") {
    await supabase.auth.signOut();
    return { error: INVALID_LOGIN };
  }

  const qrCode = await QRCode.toDataURL(enrollment.totp.uri, {
    errorCorrectionLevel: "H",
    margin: 2,
  });
  return {
    requiresEnrollment: true,
    factorId: enrollment.id,
    qrCode,
  };
}

export async function verifyMfaAction(
  factorId: string,
  code: string
): Promise<LoginActionResult> {
  const parsed = z
    .object({
      factorId: z.string().uuid(),
      code: z.string().regex(/^\d{6}$/),
    })
    .safeParse({ factorId, code });
  if (!parsed.success) {
    return { error: "Invalid authenticator code" };
  }

  const requestHeaders = await headers();
  const allowed = await consumeRateLimit(
    rateLimitKey(requestHeaders, "admin-mfa", parsed.data.factorId),
    5,
    300
  );
  if (!allowed) return { error: "Invalid authenticator code" };

  const supabase = await createClient();
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId: parsed.data.factorId });
  if (challengeError) return { error: "Invalid authenticator code" };

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (verifyError) return { error: "Invalid authenticator code" };

  redirect("/admin");
}
