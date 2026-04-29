import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchProfiles } from '@/lib/api';
import type { ProfilesQueryParams } from '@/lib/types';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params: ProfilesQueryParams = {
    page: searchParams.has('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: (searchParams.get('order') as 'asc' | 'desc') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    skills: searchParams.get('skills') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    available: searchParams.has('available')
      ? searchParams.get('available') === 'true'
      : undefined,
  };

  try {
    const result = await fetchProfiles(params, accessToken);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch profiles';
    const status = msg.includes('401') ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
