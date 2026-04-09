import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionById, updateSession, deleteSession } from '@/lib/sessions'

function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSessionById(params.id, user.id)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get version count
    const { count } = await supabase
      .from('session_versions')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', params.id)

    return NextResponse.json({ ...session, version_count: count ?? 0 })
  } catch (error) {
    console.error('GET /api/sessions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject_id, duration_minutes, tasks } = body

    // Validation
    const errors: Record<string, string> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.name = 'Name cannot be empty'
      } else if (name.trim().length > 100) {
        errors.name = 'Name must be 100 characters or less'
      }
    }

    if (subject_id !== undefined) {
      if (typeof subject_id !== 'string') {
        errors.subject_id = 'Invalid subject ID'
      } else if (!isValidUUID(subject_id)) {
        errors.subject_id = 'Invalid subject ID format'
      }
    }

    if (duration_minutes !== undefined) {
      if (
        typeof duration_minutes !== 'number' ||
        !Number.isInteger(duration_minutes) ||
        duration_minutes < 15 ||
        duration_minutes > 480
      ) {
        errors.duration_minutes = 'Duration must be between 15 and 480 minutes'
      }
    }

    if (tasks !== undefined) {
      if (!Array.isArray(tasks)) {
        errors.tasks = 'Tasks must be an array'
      } else if (tasks.length > 20) {
        errors.tasks = 'Maximum 20 tasks allowed'
      } else {
        const invalidTask = tasks.find(
          (t) => typeof t !== 'string' || t.length > 200
        )
        if (invalidTask !== undefined) {
          errors.tasks = 'Each task must be a string with max 200 characters'
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    // Verify ownership
    const existing = await getSessionById(params.id, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (subject_id !== undefined) updateData.subject_id = subject_id
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes
    if (tasks !== undefined) updateData.tasks = tasks

    const updated = await updateSession(params.id, user.id, updateData)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/sessions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await getSessionById(params.id, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await deleteSession(params.id, user.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/sessions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
