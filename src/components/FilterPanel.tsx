'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js',
  'Go', 'Rust', 'Java', 'CSS', 'SQL', 'Docker', 'Kubernetes',
];

export default function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentSkills = searchParams.get('skills') ?? '';
  const currentLocation = searchParams.get('location') ?? '';
  const currentAvailable = searchParams.get('available') ?? '';
  const currentSort = searchParams.get('sort') ?? '';
  const currentOrder = searchParams.get('order') ?? 'asc';

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    currentSkills || currentLocation || currentAvailable || currentSort;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          hasActiveFilters
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-indigo-600 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Skills */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((skill) => {
                const isActive = currentSkills.split(',').includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => {
                      const skills = currentSkills
                        ? currentSkills.split(',').filter(Boolean)
                        : [];
                      const next = isActive
                        ? skills.filter((s) => s !== skill)
                        : [...skills, skill];
                      applyFilter('skills', next.join(','));
                    }}
                    className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Custom skill…"
              className="mt-2 w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    const skills = currentSkills ? currentSkills.split(',').filter(Boolean) : [];
                    applyFilter('skills', [...skills, val].join(','));
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Lagos, Remote…"
              defaultValue={currentLocation}
              onBlur={(e) => applyFilter('location', e.target.value.trim())}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Availability */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Availability
            </label>
            <div className="flex gap-2">
              {[
                { label: 'All', value: '' },
                { label: 'Available', value: 'true' },
                { label: 'Unavailable', value: 'false' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => applyFilter('available', opt.value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    currentAvailable === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Sort by
            </label>
            <div className="flex gap-2">
              <select
                value={currentSort}
                onChange={(e) => applyFilter('sort', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Default</option>
                <option value="name">Name</option>
                <option value="createdAt">Date joined</option>
                <option value="location">Location</option>
              </select>
              <select
                value={currentOrder}
                onChange={(e) => applyFilter('order', e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
