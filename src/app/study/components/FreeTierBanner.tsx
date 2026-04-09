'use client';

import Link from 'next/link';

interface FreeTierBannerProps {
  count: number;
  limit: number;
}

export function FreeTierBanner({ count, limit }: FreeTierBannerProps) {
  const atLimit = count >= limit;

  if (atLimit) {
    return (
      <div
        role="alert"
        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-red-700 font-medium">
            You&apos;ve reached the {limit} log entry limit for free accounts.
            Upgrade to Pro for unlimited logging.
          </p>
        </div>
        <Link
          href="/settings"
          className="flex-shrink-0 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-amber-700">
          You&apos;re at{' '}
          <span className="font-semibold">
            {count}/{limit}
          </span>{' '}
          log entries. Upgrade to Pro for unlimited logging.
        </p>
      </div>
      <Link
        href="/settings"
        className="flex-shrink-0 inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
