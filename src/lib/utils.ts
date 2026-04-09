import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// cn — Tailwind class merging utility
// ============================================================

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
 * // → 'py-2 bg-blue-500 px-6'  (px-4 is overridden by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// formatDuration — minutes → human-readable string
// ============================================================

/**
 * Converts a duration in minutes to a human-readable string.
 *
 * @example
 * formatDuration(60)  // → '1h'
 * formatDuration(90)  // → '1h 30m'
 * formatDuration(45)  // → '45m'
 * formatDuration(0)   // → '0m'
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins  = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins  === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================================
// formatRelativeTime — date → relative time string
// ============================================================

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const TIME_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60,         unit: 'seconds' },
  { amount: 60,         unit: 'minutes' },
  { amount: 24,         unit: 'hours'   },
  { amount: 7,          unit: 'days'    },
  { amount: 4.34524,    unit: 'weeks'   },
  { amount: 12,         unit: 'months'  },
  { amount: Infinity,   unit: 'years'   },
];

/**
 * Returns a human-readable relative time string.
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // → '2 hours ago'
 * formatRelativeTime(new Date(Date.now() - 30 * 1000))           // → 'just now' (via 'now')
 */
export function formatRelativeTime(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  let   duration = (target.getTime() - Date.now()) / 1000; // negative = past

  for (const division of TIME_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), 'years');
}

// ============================================================
// isValidUsername — validate a username string
// ============================================================

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Returns true if the username matches the allowed pattern and length.
 * Rules: 3–30 characters, letters, digits, underscores, and hyphens only.
 */
export function isValidUsername(username: string): boolean {
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    USERNAME_REGEX.test(username)
  );
}

// ============================================================
// sanitizeUsername — convert arbitrary text to a valid username
// ============================================================

/**
 * Converts an email prefix or display name into a valid username.
 * - Lowercases the string
 * - Replaces spaces and disallowed characters with underscores
 * - Collapses consecutive underscores
 * - Removes leading/trailing underscores and hyphens
 * - Truncates to 30 characters
 * - Ensures minimum length of 3 by appending '_u' or similar
 */
export function sanitizeUsername(input: string): string {
  let username = input
    .toLowerCase()
    .replace(/\s+/g, '_')           // spaces → underscores
    .replace(/[^a-z0-9_-]/g, '_')   // disallowed chars → underscores
    .replace(/_+/g, '_')             // collapse consecutive underscores
    .replace(/^[_-]+|[_-]+$/g, ''); // strip leading/trailing _ and -

  username = username.substring(0, 30);

  if (username.length < 3) {
    username = (username + '_user').substring(0, 30);
  }

  return username;
}

// ============================================================
// truncateText — truncate with ellipsis
// ============================================================

/**
 * Truncates text to maxLength characters, appending '…' if truncated.
 *
 * @example
 * truncateText('Hello, world!', 5) // → 'Hello…'
 * truncateText('Hi', 10)           // → 'Hi'
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}

// ============================================================
// getStudyFocusOptions — predefined study focus values
// ============================================================

/**
 * Returns the list of predefined study focus options for user profiles.
 */
export function getStudyFocusOptions(): string[] {
  return [
    'STEM',
    'Humanities',
    'Business',
    'Arts',
    'Social Sciences',
    'Languages',
    'Other',
  ];
}
