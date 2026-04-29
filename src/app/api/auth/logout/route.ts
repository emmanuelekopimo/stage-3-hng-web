import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  try {
    if (accessToken) {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    }
  } catch {
    // Best effort — proceed with local logout regardless
  }

  const response = NextResponse.json({ success: true });

  const cookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('access_token', '', cookieOptions);
  response.cookies.set('refresh_token', '', cookieOptions);
  response.cookies.set('csrf_token', '', { ...cookieOptions, httpOnly: false });

  return response;
}

// Also handle GET for direct navigation
export async function GET(_request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', _request.url));
  const cookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
  response.cookies.set('access_token', '', cookieOptions);
  response.cookies.set('refresh_token', '', cookieOptions);
  response.cookies.set('csrf_token', '', { ...cookieOptions, httpOnly: false });
  return response;
}
