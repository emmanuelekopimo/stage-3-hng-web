import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Profile, ApiResponse } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

async function getProfile(
  id: string,
  accessToken: string
): Promise<Profile | null> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${API_BASE}/api/v1/profiles/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Backend error ${res.status}`);

    const json = (await res.json()) as ApiResponse<Profile>;
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Profile ${id} | Insighta Labs+` };
}

export default async function ProfileDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value ?? '';

  const profile = await getProfile(id, accessToken);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/profiles"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to profiles
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between mb-4">
            <div>
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="rounded-2xl border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span
              className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                profile.available
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {profile.available ? '✓ Available' : '✗ Not available'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          {profile.role && (
            <p className="text-indigo-600 font-medium text-sm mt-0.5">{profile.role}</p>
          )}
          {profile.location && (
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </p>
          )}
          {profile.email && (
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {profile.email}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {profile.githubUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Links</h2>
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            View on GitHub
          </a>
        </div>
      )}

      {/* Meta */}
      {(profile.createdAt || profile.updatedAt) && (
        <p className="text-xs text-gray-400 text-center">
          {profile.createdAt && `Joined ${new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          {profile.updatedAt && ` · Updated ${new Date(profile.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        </p>
      )}
    </div>
  );
}
