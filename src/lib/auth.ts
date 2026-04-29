import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value;
}

export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('csrf_token')?.value;
}

export function generateCsrfToken(): string {
  return uuidv4();
}

export function validateCsrfToken(
  requestToken: string | null,
  cookieToken: string | null
): boolean {
  if (!requestToken || !cookieToken) return false;
  return requestToken === cookieToken;
}

export function isAuthenticated(accessToken: string | undefined): boolean {
  return Boolean(accessToken);
}

/**
 * Decode a JWT payload without verification (verification happens server-side).
 * Safe for reading claims like role/sub on the client.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}
