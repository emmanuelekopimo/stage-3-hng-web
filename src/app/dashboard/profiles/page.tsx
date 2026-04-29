import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import type { Profile, ApiResponse, PaginationMeta } from '@/lib/types';
import ProfileList from '@/components/ProfileList';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';

export const metadata: Metadata = { title: 'Profiles | Insighta Labs+' };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    search?: string;
    skills?: string;
    location?: string;
    available?: string;
  }>;
}

async function getProfiles(
  accessToken: string,
  sp: Awaited<PageProps['searchParams']>
): Promise<{ profiles: Profile[]; pagination: PaginationMeta | null; error?: string }> {
  try {
    const query = new URLSearchParams();
    query.set('page', sp.page ?? '1');
    query.set('limit', sp.limit ?? '20');
    if (sp.sort) query.set('sort', sp.sort);
    if (sp.order) query.set('order', sp.order);
    if (sp.search) query.set('search', sp.search);
    if (sp.skills) query.set('skills', sp.skills);
    if (sp.location) query.set('location', sp.location);
    if (sp.available !== undefined) query.set('available', sp.available);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(
      `${API_BASE}/api/v1/profiles?${query.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return { profiles: [], pagination: null, error: `Backend returned ${res.status}` };
    }

    const json = (await res.json()) as ApiResponse<Profile[]>;
    return {
      profiles: Array.isArray(json.data) ? json.data : [],
      pagination: json.pagination ?? null,
    };
  } catch (err) {
    return {
      profiles: [],
      pagination: null,
      error: err instanceof Error ? err.message : 'Failed to connect to backend',
    };
  }
}

export default async function ProfilesPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value ?? '';
  const sp = await searchParams;

  const { profiles, pagination, error } = await getProfiles(accessToken, sp);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Profiles</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} profiles · Page {pagination.page} of {pagination.totalPages}
            </p>
          )}
        </div>
        <a
          href={`/api/profiles/export?${new URLSearchParams({
            ...(sp.search ? { search: sp.search } : {}),
            ...(sp.skills ? { skills: sp.skills } : {}),
            ...(sp.location ? { location: sp.location } : {}),
            ...(sp.available ? { available: sp.available } : {}),
          }).toString()}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar defaultValue={sp.search} />
        <FilterPanel />
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800 text-sm">Backend unavailable</p>
            <p className="text-amber-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <ProfileList profiles={profiles} />

      {pagination && (
        <Pagination
          meta={{
            page: Number(sp.page ?? 1),
            limit: Number(sp.limit ?? 20),
            total: pagination.total,
            totalPages: pagination.totalPages,
          }}
        />
      )}
    </div>
  );
}
