import Image from 'next/image'
import Link from 'next/link'
import { cn, getInitials, formatCount } from '@/lib/utils'
import type { Profile, ProfileStats } from '@/types/database'

interface ProfileCardProps {
  profile: Profile
  stats: ProfileStats
  isOwnProfile: boolean
}

const FOCUS_COLORS: Record<string, string> = {
  STEM: 'bg-blue-100 text-blue-800',
  Humanities: 'bg-purple-100 text-purple-800',
  Business: 'bg-yellow-100 text-yellow-800',
  Arts: 'bg-pink-100 text-pink-800',
  Law: 'bg-red-100 text-red-800',
  Medicine: 'bg-green-100 text-green-800',
  'Social Sciences': 'bg-orange-100 text-orange-800',
  Other: 'bg-gray-100 text-gray-800',
}

function AvatarDisplay({
  avatarUrl,
  displayName,
  size = 'lg',
}: {
  avatarUrl: string | null
  displayName: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-xl',
    lg: 'h-24 w-24 text-2xl',
  }

  const initials = getInitials(displayName)

  if (avatarUrl) {
    return (
      <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size])}>
        <Image
          src={avatarUrl}
          alt={`${displayName}'s avatar`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary flex items-center justify-center font-semibold text-white',
        sizeClasses[size]
      )}
      aria-label={`${displayName}'s avatar`}
      role="img"
    >
      {initials}
    </div>
  )
}

interface StatItemProps {
  value: number
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-gray-900">{formatCount(value)}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}

export default function ProfileCard({ profile, stats, isOwnProfile }: ProfileCardProps) {
  const focusColorClass = profile.study_focus
    ? FOCUS_COLORS[profile.study_focus] ?? FOCUS_COLORS.Other
    : null

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      {/* Header: Avatar + Name + Edit Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <AvatarDisplay
            avatarUrl={profile.avatar_url}
            displayName={profile.display_name}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {profile.display_name}
            </h1>
            <p className="text-gray-500 mt-0.5">@{profile.username}</p>
            {profile.study_focus && focusColorClass && (
              <span
                className={cn(
                  'inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium',
                  focusColorClass
                )}
              >
                {profile.study_focus}
              </span>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <Link
            href="/settings"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="mt-5 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {profile.bio}
        </p>
      )}

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-4 text-center">
          <StatItem
            value={Math.round(stats.study_hours * 10) / 10}
            label="Study Hours"
          />
          <StatItem value={stats.tasks_completed} label="Tasks Done" />
          <StatItem value={stats.followers_count} label="Followers" />
          <StatItem value={stats.following_count} label="Following" />
        </div>
      </div>

      {/* Sessions count */}
      {stats.sessions_count > 0 && (
        <p className="mt-4 text-center text-sm text-gray-500">
          {formatCount(stats.sessions_count)} study session{stats.sessions_count === 1 ? '' : 's'} created
        </p>
      )}
    </article>
  )
}

// Re-export AvatarDisplay for use in other components
export { AvatarDisplay }
