export const SYNTHETIC_EMAIL_DOMAIN = "shadisutra.app";

/**
 * Converts a username to a synthetic internal Supabase Auth email.
 * e.g. "sharma_wedding" -> "sharma_wedding@shadisutra.app"
 */
export function usernameToEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return `${clean}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

/**
 * Extracts username from synthetic internal email.
 * e.g. "sharma_wedding@shadisutra.app" -> "sharma_wedding"
 */
export function emailToUsername(email: string): string {
  return email.split("@")[0] || email;
}

/**
 * Normalizes username input.
 */
export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}
