'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, User, BookOpen, Loader2 } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';

interface UserResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  study_focus: string | null;
}

interface SubjectResult {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [subjectResults, setSubjectResults] = useState<SubjectResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Search failed');
      }

      const data = await response.json();
      setUserResults(data.users ?? []);
      setSubjectResults(data.subjects ?? []);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUserResults([]);
      setSubjectResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setUserResults([]);
      setSubjectResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    fetchResults(debouncedQuery.trim());
  }, [debouncedQuery, fetchResults]);

  function getInitials(displayName: string): string {
    return displayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users and subjects..."
          aria-label="Search users and subjects"
          aria-busy={isLoading}
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className="flex items-center justify-center py-8"
          role="status"
          aria-label="Loading results"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && !isLoading && !error && (
        <div className="space-y-8">
          {/* Users Section */}
          <section aria-labelledby="users-heading">
            <h2
              id="users-heading"
              className="text-lg font-semibold text-gray-900 mb-3"
            >
              Users{' '}
              <span className="text-gray-500 font-normal">
                ({userResults.length})
              </span>
            </h2>

            {userResults.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-lg">
                No users found
              </p>
            ) : (
              <ul className="space-y-2">
                {userResults.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/user/${user.username}`}
                      className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={`${user.display_name}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            {user.display_name ? (
                              <span className="text-primary-700 font-semibold text-sm">
                                {getInitials(user.display_name)}
                              </span>
                            ) : (
                              <User
                                className="h-5 w-5 text-primary-500"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.display_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          @{user.username}
                        </p>
                        {user.study_focus && (
                          <p className="text-xs text-primary-600 mt-0.5 truncate">
                            {user.study_focus}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Subjects Section */}
          <section aria-labelledby="subjects-heading">
            <h2
              id="subjects-heading"
              className="text-lg font-semibold text-gray-900 mb-3"
            >
              Subjects{' '}
              <span className="text-gray-500 font-normal">
                ({subjectResults.length})
              </span>
            </h2>

            {subjectResults.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-lg">
                No subjects found
              </p>
            ) : (
              <ul className="space-y-2">
                {subjectResults.map((subject) => (
                  <li key={subject.id}>
                    <Link
                      href={`/sessions?subject=${subject.id}`}
                      className="flex items-start gap-4 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <BookOpen
                            className="h-5 w-5 text-emerald-600"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* Subject Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {subject.name}
                        </p>
                        {subject.category && (
                          <p className="text-sm text-gray-500 truncate">
                            {subject.category}
                          </p>
                        )}
                        {subject.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Empty / Prompt State */}
      {!hasSearched && !isLoading && !error && (
        <div className="text-center py-12 text-gray-500">
          <Search
            className="h-12 w-12 mx-auto mb-3 text-gray-300"
            aria-hidden="true"
          />
          <p className="text-base">Enter at least 2 characters to search</p>
          <p className="text-sm mt-1 text-gray-400">
            Find users by name or username, and subjects by name
          </p>
        </div>
      )}
    </div>
  );
}
