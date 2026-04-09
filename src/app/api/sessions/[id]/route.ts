import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

async function getSessionAndVerifyOwner(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  sessionId: string,
  userId: string
) {
  const { data: session, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    return { session: null, errorResponse: NextResponse.json({ error: 'Session not found' }, { status: 404 }) }
  }

  if (session.user_id !== userId) {
    return { session: null, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { session, errorResponse: null }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session: ownedSession, errorResponse } = await getSessionAndVerifyOwner(supabase, id, user.id)
    if (errorResponse) return errorResponse

    // Fetch full session with relations
    const { data: session, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        subject:subjects(*),
        profile:profiles!study_sessions_user_id_fkey(username, display_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch version history
    const { data: versions } = await supabase
      .from('study_session_versions')
      .select('*')
      .eq('session_id', id)
      .order('version_number', { ascending: false })

    return NextResponse.json({ ...session, versions: versions ?? [] })
  } catch (err) {
    console.error('Unexpected error in GET /api/sessions/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session: currentSession, errorResponse } = await getSessionAndVerifyOwner(supabase, id, user.id)
    if (errorResponse) return errorResponse

    let body: {
      name?: string
      subject_id?: string
      duration_minutes?: number
      tasks?: string[]
    }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, subject_id, duration_minutes, tasks } = body

    // Validation
    const validationErrors: string[] = []

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        validationErrors.push('Name cannot be empty')
      } else if (name.trim().length > 100) {
        validationErrors.push('Name must be 100 characters or less')
      }
    }

    if (duration_minutes !== undefined) {
      if (
        typeof duration_minutes !== 'number' ||
        !Number.isInteger(duration_minutes) ||
        duration_minutes < 1 ||
        duration_minutes > 480
      ) {
        validationErrors.push('Duration must be between 1 and 480 minutes')
      }
    }

    if (tasks !== undefined) {
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
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(', ') }, { status: 400 })
    }

    // Save current state to version history before updating
    const { error: versionError } = await supabase
      .from('study_session_versions')
      .insert({
        session_id: id,
        user_id: user.id,
        name: currentSession!.name,
        subject_id: currentSession!.subject_id,
        duration_minutes: currentSession!.duration_minutes,
        tasks: currentSession!.tasks,
        version_number: currentSession!.version,
      })

    if (versionError) {
      console.error('Error saving version history:', versionError)
      return NextResponse.json({ error: 'Failed to save version history' }, { status: 500 })
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      version: (currentSession!.version ?? 1) + 1,
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name.trim()
    if (subject_id !== undefined) updateData.subject_id = subject_id
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes
    if (tasks !== undefined) updateData.tasks = tasks.map((t) => t.trim()).filter((t) => t.length > 0)

    const { data: updatedSession, error: updateError } = await supabase
      .from('study_sessions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        subject:subjects(*),
        profile:profiles!study_sessions_user_id_fkey(username, display_name, avatar_url)
      `)
      .single()

    if (updateError) {
      console.error('Error updating session:', updateError)
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    return NextResponse.json(updatedSession)
  } catch (err) {
    console.error('Unexpected error in PUT /api/sessions/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { errorResponse } = await getSessionAndVerifyOwner(supabase, id, user.id)
    if (errorResponse) return errorResponse

    const { error: deleteError } = await supabase
      .from('study_sessions')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Error archiving session:', deleteError)
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/sessions/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
