import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionById, getSessionVersions } from '@/lib/sessions'

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

    // Verify ownership
    const session = await getSessionById(params.id, user.id)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const versions = await getSessionVersions(params.id, user.id)
    return NextResponse.json(versions)
  } catch (error) {
    console.error('GET /api/sessions/[id]/versions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
