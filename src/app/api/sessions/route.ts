import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        subject:subjects(*),
        profile:profiles!study_sessions_user_id_fkey(username, display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json(sessions)
  } catch (err) {
    console.error('Unexpected error in GET /api/sessions:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
      name: string
      subject_id: string
      duration_minutes: number
      tasks: string[]
    }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, subject_id, duration_minutes, tasks } = body

    // Validation
    const validationErrors: string[] = []

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      validationErrors.push('Name is required')
    } else if (name.trim().length > 100) {
      validationErrors.push('Name must be 100 characters or less')
    }

    if (!subject_id || typeof subject_id !== 'string') {
      validationErrors.push('Subject is required')
    }

    if (duration_minutes === undefined || duration_minutes === null) {
      validationErrors.push('Duration is required')
    } else if (
      typeof duration_minutes !== 'number' ||
      !Number.isInteger(duration_minutes) ||
      duration_minutes < 1 ||
      duration_minutes > 480
    ) {
      validationErrors.push('Duration must be between 1 and 480 minutes')
    }

    if (!Array.isArray(tasks)) {
      validationErrors.push('Tasks must be an array')
    } else {
      if (tasks.length > 20) {
        validationErrors.push('Maximum 20 tasks allowed')
      }
      const invalidTasks = tasks.filter(
        (t) => typeof t !== 'string' || t.trim().length === 0 || t.trim().length > 200
      )
      if (invalidTasks.length > 0) {
        validationErrors.push('Each task must be between 1 and 200 characters')
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(', ') }, { status: 400 })
    }

    // Check subscription tier and session limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier ?? 'free'

    if (tier === 'free') {
      const { count, error: countError } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (countError) {
        console.error('Error counting sessions:', countError)
        return NextResponse.json({ error: 'Failed to check session limit' }, { status: 500 })
      }

      if ((count ?? 0) >= 5) {
        return NextResponse.json(
          {
            error: 'Session limit reached. Free users can have a maximum of 5 active sessions.',
            upgradeRequired: true,
          },
          { status: 403 }
        )
      }
    }

    // Insert the new session
    const { data: session, error: insertError } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        name: name.trim(),
        subject_id,
        duration_minutes,
        tasks: tasks.map((t) => t.trim()).filter((t) => t.length > 0),
        status: 'active',
        version: 1,
      })
      .select(`
        *,
        subject:subjects(*),
        profile:profiles!study_sessions_user_id_fkey(username, display_name, avatar_url)
      `)
      .single()

    if (insertError) {
      console.error('Error creating session:', insertError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json(session, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/sessions:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
