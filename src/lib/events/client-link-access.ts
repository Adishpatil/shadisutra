import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const CLIENT_SESSION_SECONDS = 15 * 60;

function secret(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("Client link signing is not configured.");
  return value;
}

function signingKey(): Buffer {
  return createHmac("sha256", secret()).update("client-link-cookie-v1").digest();
}

export async function hashClientPin(pin: string): Promise<string> {
  const salt = Buffer.from(await import("node:crypto").then(({ randomBytes }) => randomBytes(16)));
  const derived = (await scryptAsync(pin, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyClientPin(pin: string, pinHash: string): Promise<boolean> {
  const match = /^scrypt\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{86})$/.exec(pinHash);
  if (!match) return false;
  const salt = Buffer.from(match[1], "base64url");
  const expected = Buffer.from(match[2], "base64url");
  const actual = (await scryptAsync(pin, salt, 64)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function clientSessionCookieName(token: string): string {
  return `client_link_${createHash("sha256").update(token).digest("hex").slice(0, 16)}`;
}

export function createClientSessionCookie(token: string, linkExpiresAt: string): {
  name: string;
  value: string;
  maxAge: number;
  path: string;
} {
  const maxAge = Math.min(
    CLIENT_SESSION_SECONDS,
    Math.floor((new Date(linkExpiresAt).getTime() - Date.now()) / 1000)
  );
  if (maxAge <= 0) throw new Error("Client link has expired.");
  const expires = Math.floor((Date.now() + maxAge * 1000) / 1000);
  const tokenHash = createHash("sha256").update(token).digest("base64url");
  const payload = `${expires}.${tokenHash}`;
  const signature = createHmac("sha256", signingKey()).update(payload).digest("base64url");
  return {
    name: clientSessionCookieName(token),
    value: `${payload}.${signature}`,
    maxAge,
    path: `/c/${token}`,
  };
}

export function hasValidClientSession(
  token: string,
  cookieValue: string | undefined,
  linkExpiresAt: string
): boolean {
  if (!cookieValue) return false;
  const match = /^(\d{10})\.([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{43})$/.exec(cookieValue);
  if (!match) return false;
  const expires = Number(match[1]);
  const expiresAt = Math.floor(new Date(linkExpiresAt).getTime() / 1000);
  const now = Math.floor(Date.now() / 1000);
  if (expires <= now || expires > expiresAt || expires - now > CLIENT_SESSION_SECONDS) {
    return false;
  }
  const tokenHash = createHash("sha256").update(token).digest("base64url");
  if (tokenHash !== match[2]) return false;
  const payload = `${match[1]}.${match[2]}`;
  const expected = createHmac("sha256", signingKey()).update(payload).digest();
  const actual = Buffer.from(match[3], "base64url");
  return actual.length === expected.length && timingSafeEqual(expected, actual);
}

export { CLIENT_SESSION_SECONDS };
