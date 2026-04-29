import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect API proxy routes (except auth routes)
  if (
    pathname.startsWith('/api/profiles') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/auth/refresh')
  ) {
    const method = request.method;
    // Only check CSRF on mutating requests
    if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
      const csrfHeader = request.headers.get('X-CSRF-Token');
      const csrfCookie = request.cookies.get('csrf_token')?.value;

      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/profiles/:path*', '/api/auth/logout', '/api/auth/refresh'],
};
