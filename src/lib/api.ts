import { ApiResponse, Profile, ProfilesQueryParams } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface FetchOptions {
  accessToken?: string;
  csrfToken?: string;
  method?: string;
  body?: unknown;
}

async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { accessToken, csrfToken, method = 'GET', body } = opts;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export async function fetchProfiles(
  params: ProfilesQueryParams,
  accessToken?: string,
  csrfToken?: string
): Promise<ApiResponse<Profile[]>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);
  if (params.search) query.set('search', params.search);
  if (params.skills) query.set('skills', params.skills);
  if (params.location) query.set('location', params.location);
  if (params.available !== undefined) query.set('available', String(params.available));

  const qs = query.toString();
  return apiFetch<Profile[]>(`/api/v1/profiles${qs ? `?${qs}` : ''}`, {
    accessToken,
    csrfToken,
  });
}

export async function fetchProfile(
  id: string,
  accessToken?: string,
  csrfToken?: string
): Promise<ApiResponse<Profile>> {
  return apiFetch<Profile>(`/api/v1/profiles/${id}`, { accessToken, csrfToken });
}

export async function updateProfile(
  id: string,
  data: Partial<Profile>,
  accessToken?: string,
  csrfToken?: string
): Promise<ApiResponse<Profile>> {
  return apiFetch<Profile>(`/api/v1/profiles/${id}`, {
    method: 'PATCH',
    body: data,
    accessToken,
    csrfToken,
  });
}

export async function deleteProfile(
  id: string,
  accessToken?: string,
  csrfToken?: string
): Promise<ApiResponse<null>> {
  return apiFetch<null>(`/api/v1/profiles/${id}`, {
    method: 'DELETE',
    accessToken,
    csrfToken,
  });
}

export async function exportProfiles(
  params: ProfilesQueryParams,
  accessToken?: string,
  csrfToken?: string
): Promise<Response> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.skills) query.set('skills', params.skills);
  if (params.location) query.set('location', params.location);
  if (params.available !== undefined) query.set('available', String(params.available));

  const qs = query.toString();
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

  return fetch(
    `${API_BASE}/api/v1/profiles/export${qs ? `?${qs}` : ''}`,
    { headers, cache: 'no-store' }
  );
}

export async function refreshToken(currentRefreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: currentRefreshToken }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }

  // Backend returns { status: 'success', data: { access_token, refresh_token, token_type, expires_in } }
  const json = await res.json() as { status: string; data: { access_token: string; refresh_token?: string; expires_in?: number } };
  return json.data;
}