import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase'
import { isValidUsername, canChangeUsername } from '@/lib/utils'
import type { UpdateProfileInput } from '@/types/database'

// ============================================================
// GET /api/profile
// Returns the current authenticated user's profile
// ============================================================
export async function GET() {
  try {
    const supabase = createServerComponentClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceRoleClient()
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('GET /api/profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// PUT /api/profile
// Updates the current authenticated user's profile
// ============================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: UpdateProfileInput
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { display_name, username, bio, study_focus } = body
    const errors: Record<string, string> = {}

    // Validate display_name
    if (display_name !== undefined) {
      const trimmed = display_name.trim()
      if (trimmed.length < 2) {
        errors.display_name = 'Display name must be at least 2 characters'
      } else if (trimmed.length > 50) {
        errors.display_name = 'Display name must be 50 characters or fewer'
      }
    }

    // Validate username
    if (username !== undefined) {
      if (!isValidUsername(username)) {
        errors.username = 'Username must be 3-20 characters using only letters, numbers, and underscores'
      }
    }

    // Validate bio
    if (bio !== undefined && bio !== null) {
      if (bio.length > 300) {
        errors.bio = 'Bio must be 300 characters or fewer'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()

    // Fetch current profile
    const { data: currentProfile, error: fetchError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}

    if (display_name !== undefined) {
      updates.display_name = display_name.trim()
    }

    if (bio !== undefined) {
      updates.bio = bio
    }

    if (study_focus !== undefined) {
      updates.study_focus = study_focus
    }

    // Handle username change with 30-day restriction
    if (username !== undefined && username !== currentProfile.username) {
      const { allowed, daysRemaining } = canChangeUsername(currentProfile.username_updated_at)

      if (!allowed) {
        return NextResponse.json(
          {
            error: 'Username change restricted',
            message: `You can change your username again in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
            daysRemaining,
          },
          { status: 429 }
        )
      }

      // Check username uniqueness (case-insensitive)
      const { data: existingUser } = await serviceClient
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .neq('user_id', session.user.id)
        .maybeSingle()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken', errors: { username: 'This username is already taken' } },
          { status: 409 }
        )
      }

      updates.username = username
      updates.username_updated_at = new Date().toISOString()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ profile: currentProfile })
    }

    const { data: updatedProfile, error: updateError } = await serviceClient
      .from('profiles')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)

      // Handle unique constraint violation
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'Username already taken', errors: { username: 'This username is already taken' } },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch (err) {
    console.error('PUT /api/profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
