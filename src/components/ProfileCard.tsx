'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Profile } from '@/lib/types';
import { useAuth } from './AuthProvider';

interface ProfileCardProps {
  profile: Profile;
  onDelete?: (id: string) => void;
}

export default function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  const { role, csrfToken } = useAuth();
  const isAdmin = role === 'admin';

  const handleDelete = async () => {
    if (!confirm(`Delete ${profile.name}? This cannot be undone.`)) return;

    const res = await fetch(`/api/profiles/${profile.id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken ?? '' },
    });

    if (res.ok) {
      onDelete?.(profile.id);
    } else {
      alert('Failed to delete profile');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
          {profile.location && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            profile.available
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {profile.available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {profile.bio && (
        <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
      )}

      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 5 && (
            <span className="text-xs text-gray-400 px-1 py-0.5">
              +{profile.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
        <Link
          href={`/dashboard/profiles/${profile.id}`}
          className="flex-1 text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Profile
        </Link>
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        )}
        {isAdmin && (
          <>
            <Link
              href={`/dashboard/profiles/${profile.id}?edit=true`}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
