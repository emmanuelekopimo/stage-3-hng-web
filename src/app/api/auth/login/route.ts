import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

export async function GET() {
  const redirectUri = `${APP_URL}/api/auth/callback`;
  const backendUrl = `${API_BASE}/api/v1/auth/github/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(backendUrl);
}
