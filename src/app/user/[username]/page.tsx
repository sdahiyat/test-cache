import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceRoleClient, createServerComponentClient } from '@/lib/supabase'
import ProfileCard from '@/components/profile/ProfileCard'
import type { Profile, ProfileStats } from '@/types/database'

interface PageProps {
  params: { username: string }
}

// ============================================================
// Metadata generation
// ============================================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const serviceClient = createServiceRoleClient()
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('display_name, username, bio')
      .ilike('username', params.username)
      .single()

    if (!profile) {
      return {
        title: 'User Not Found | StudySync',
      }
    }

    return {
      title: `${profile.display_name} (@${profile.username}) | StudySync`,
      description:
        profile.bio ||
        `View ${profile.display_name}'s study profile on StudySync`,
    }
  } catch {
    return {
      title: 'Profile | StudySync',
    }
  }
}

// ============================================================
// Page component (server component)
// ============================================================
export default async function UserProfilePage({ params }: PageProps) {
  const serviceClient = createServiceRoleClient()

  // Fetch profile by username (case-insensitive)
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('*')
    .ilike('username', params.username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch stats
  let stats: ProfileStats = {
    study_hours: 0,
    tasks_completed: 0,
    followers_count: 0,
    following_count: 0,
    sessions_count: 0,
  }

  try {
    const { data: statsData } = await serviceClient
      .rpc('get_profile_stats', { p_user_id: (profile as Profile).user_id })
      .single()

    if (statsData) {
      stats = {
        study_hours: Number(statsData.study_hours) || 0,
        tasks_completed: Number(statsData.tasks_completed) || 0,
        followers_count: Number(statsData.followers_count) || 0,
        following_count: Number(statsData.following_count) || 0,
        sessions_count: Number(statsData.sessions_count) || 0,
      }
    }
  } catch {
    // Stats function may not be available yet — use defaults
  }

  // Check if this is the current user's own profile
  let isOwnProfile = false
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user.id === (profile as Profile).user_id) {
      isOwnProfile = true
    }
  } catch {
    // Not authenticated or session error — profile is public, just not own
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <ProfileCard
          profile={profile as Profile}
          stats={stats}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </main>
  )
}
