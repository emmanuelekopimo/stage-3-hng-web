import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/auth';

const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_SECURE = IS_PROD;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const expiresIn = Number(searchParams.get('expires_in') ?? 900); // default 15 min

  // If no tokens arrived, redirect to login with an error flag
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url));

  const csrfToken = generateCsrfToken();

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // CSRF token is readable by JS (not httpOnly)
  response.cookies.set('csrf_token', csrfToken, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  });

  return response;
}
