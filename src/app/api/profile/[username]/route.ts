import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import type { ProfileStats } from '@/types/database'

// ============================================================
// GET /api/profile/[username]
// Public endpoint: fetch profile by username + stats
// ============================================================
export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()

    // Fetch profile by username (case-insensitive)
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .ilike('username', username)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      console.error('Error fetching profile by username:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch stats using the database function
    let stats: ProfileStats = {
      study_hours: 0,
      tasks_completed: 0,
      followers_count: 0,
      following_count: 0,
      sessions_count: 0,
    }

    try {
      const { data: statsData, error: statsError } = await serviceClient
        .rpc('get_profile_stats', { p_user_id: profile.user_id })
        .single()

      if (!statsError && statsData) {
        stats = {
          study_hours: Number(statsData.study_hours) || 0,
          tasks_completed: Number(statsData.tasks_completed) || 0,
          followers_count: Number(statsData.followers_count) || 0,
          following_count: Number(statsData.following_count) || 0,
          sessions_count: Number(statsData.sessions_count) || 0,
        }
      }
    } catch (statsErr) {
      // Stats function may not exist yet — use defaults
      console.warn('Could not fetch profile stats:', statsErr)
    }

    return NextResponse.json({ profile, stats })
  } catch (err) {
    console.error('GET /api/profile/[username] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
