import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

/**
 * Secret key for JWT signing. Must be defined in a .env file as JWT_SECRET.
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not defined – authentication will fail.');
}

/**
 * Payload stored inside the JWT. Includes minimal fields required for role‑based access.
 */
export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role: 'admin' | 'customer';
}

/**
 * Create a signed JWT that expires in 7 days.
 */
export function signAuthToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a JWT and return its decoded payload, or null if verification fails.
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract the auth token from the `cookie` header of a Request (used in server actions).
 */
export function getTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(/auth_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
