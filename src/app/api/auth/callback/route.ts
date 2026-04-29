import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/auth';

const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_SECURE = IS_PROD;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Backend may pass tokens as query params or they may already be in cookies
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  const response = NextResponse.redirect(new URL('/dashboard', request.url));

  const csrfToken = generateCsrfToken();

  // Set CSRF token as readable cookie (not httpOnly)
  response.cookies.set('csrf_token', csrfToken, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  if (accessToken) {
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes
    });
  }

  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}
