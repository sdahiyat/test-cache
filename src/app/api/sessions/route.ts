import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getUserSessions, createSession, TierLimitError } from '@/lib/sessions'

function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await getUserSessions(user.id)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('GET /api/sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Name is required'
    } else if (name.trim().length > 100) {
      errors.name = 'Name must be 100 characters or less'
    }

    if (!subject_id || typeof subject_id !== 'string') {
      errors.subject_id = 'Subject is required'
    } else if (!isValidUUID(subject_id)) {
      errors.subject_id = 'Invalid subject ID'
    }

    if (
      duration_minutes === undefined ||
      duration_minutes === null ||
      typeof duration_minutes !== 'number'
    ) {
      errors.duration_minutes = 'Duration is required'
    } else if (
      !Number.isInteger(duration_minutes) ||
      duration_minutes < 15 ||
      duration_minutes > 480
    ) {
      errors.duration_minutes = 'Duration must be between 15 and 480 minutes'
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

    const session = await createSession(user.id, {
      name: name.trim(),
      subject_id,
      duration_minutes,
      tasks: tasks ?? [],
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    if (error instanceof TierLimitError) {
      return NextResponse.json(
        {
          error: 'Session limit reached',
          limit: 5,
          upgrade_url: '/upgrade',
        },
        { status: 403 }
      )
    }
    console.error('POST /api/sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
