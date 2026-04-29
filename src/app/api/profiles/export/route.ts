import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exportProfiles } from '@/lib/api';
import type { ProfilesQueryParams } from '@/lib/types';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params: ProfilesQueryParams = {
    search: searchParams.get('search') ?? undefined,
    skills: searchParams.get('skills') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    available: searchParams.has('available')
      ? searchParams.get('available') === 'true'
      : undefined,
  };

  try {
    const upstream = await exportProfiles(params, accessToken);

    const csvText = await upstream.text();

    return new NextResponse(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="profiles.csv"',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
