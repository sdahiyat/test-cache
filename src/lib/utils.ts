import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a duration in minutes into a human-readable string.
 * e.g. 90 => "1h 30m", 45 => "45m", 120 => "2h"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Format a number with compact notation.
 * e.g. 1500 => "1.5K", 1000000 => "1M"
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`
}

/**
 * Calculate days remaining until a date.
 * Returns 0 if the date is in the past.
 */
export function daysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Check if a username change is allowed (30-day restriction).
 * Returns { allowed: boolean, daysRemaining: number }
 */
export function canChangeUsername(usernameUpdatedAt: string | null): {
  allowed: boolean
  daysRemaining: number
} {
  if (!usernameUpdatedAt) return { allowed: true, daysRemaining: 0 }

  const updatedAt = new Date(usernameUpdatedAt)
  const canChangeAt = new Date(updatedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()

  if (now >= canChangeAt) return { allowed: true, daysRemaining: 0 }

  const daysRemaining = Math.ceil((canChangeAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return { allowed: false, daysRemaining }
}

/**
 * Validate a username string.
 * Must be 3-20 characters, alphanumeric and underscores only.
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}

/**
 * Get initials from a display name (up to 2 characters).
 * e.g. "John Doe" => "JD", "Alice" => "A"
 */
export function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
