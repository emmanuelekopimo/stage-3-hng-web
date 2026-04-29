import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshToken as callRefresh } from '@/lib/api';

const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const currentRefreshToken = cookieStore.get('refresh_token')?.value;

  if (!currentRefreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const result = await callRefresh(currentRefreshToken);
    const expiresIn = result.expires_in ?? 900;

    const response = NextResponse.json({ success: true });

    response.cookies.set('access_token', result.access_token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    });

    if (result.refresh_token) {
      response.cookies.set('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Refresh failed' },
      { status: 401 }
    );
  }
}