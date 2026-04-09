import { createServerSupabaseClient } from '@/lib/supabase'

export interface StudySession {
  id: string
  user_id: string
  name: string
  subject_id: string | null
  subject_name: string | null
  duration_minutes: number
  tasks: string[]
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateSessionInput {
  name: string
  subject_id: string
  duration_minutes: number
  tasks: string[]
}

export type UpdateSessionInput = Partial<CreateSessionInput>

export interface SessionVersion {
  id: string
  session_id: string
  version_number: number
  snapshot: Record<string, unknown>
  created_at: string
}

export interface SessionLimitStatus {
  canCreate: boolean
  count: number
  limit: number
  isPro: boolean
}

export class TierLimitError extends Error {
  constructor(message = 'Session limit reached') {
    super(message)
    this.name = 'TierLimitError'
  }
}

export async function checkSessionLimit(userId: string): Promise<SessionLimitStatus> {
  const supabase = createServerSupabaseClient()

  // Check if user has active pro subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, status, plan')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('plan', 'pro')
    .maybeSingle()

  const isPro = subscription !== null

  // Count active sessions
  const { count, error } = await supabase
    .from('study_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('deleted_at', null)

  if (error) {
    console.error('Error counting sessions:', error)
    throw error
  }

  const sessionCount = count ?? 0
  const limit = 5

  return {
    canCreate: isPro || sessionCount < limit,
    count: sessionCount,
    limit,
    isPro,
  }
}

export async function getUserSessions(userId: string): Promise<StudySession[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      id,
      user_id,
      name,
      subject_id,
      duration_minutes,
      tasks,
      status,
      created_at,
      updated_at,
      deleted_at,
      subjects (
        name
      )
    `)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    throw error
  }

  return (data || []).map((s: {
    id: string
    user_id: string
    name: string
    subject_id: string | null
    duration_minutes: number
    tasks: string[] | null
    status: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    subjects: { name: string } | null
  }) => ({
    id: s.id,
    user_id: s.user_id,
    name: s.name,
    subject_id: s.subject_id,
    subject_name: s.subjects?.name ?? null,
    duration_minutes: s.duration_minutes,
    tasks: s.tasks ?? [],
    status: s.status,
    created_at: s.created_at,
    updated_at: s.updated_at,
    deleted_at: s.deleted_at,
  }))
}

export async function getSessionById(
  sessionId: string,
  userId: string
): Promise<StudySession | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      id,
      user_id,
      name,
      subject_id,
      duration_minutes,
      tasks,
      status,
      created_at,
      updated_at,
      deleted_at,
      subjects (
        name
      )
    `)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('Error fetching session:', error)
    throw error
  }

  if (!data) return null

  const s = data as {
    id: string
    user_id: string
    name: string
    subject_id: string | null
    duration_minutes: number
    tasks: string[] | null
    status: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    subjects: { name: string } | null
  }

  return {
    id: s.id,
    user_id: s.user_id,
    name: s.name,
    subject_id: s.subject_id,
    subject_name: s.subjects?.name ?? null,
    duration_minutes: s.duration_minutes,
    tasks: s.tasks ?? [],
    status: s.status,
    created_at: s.created_at,
    updated_at: s.updated_at,
    deleted_at: s.deleted_at,
  }
}

export async function createSession(
  userId: string,
  data: CreateSessionInput
): Promise<StudySession> {
  const supabase = createServerSupabaseClient()

  const limitStatus = await checkSessionLimit(userId)
  if (!limitStatus.canCreate) {
    throw new TierLimitError()
  }

  const { data: session, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      name: data.name,
      subject_id: data.subject_id || null,
      duration_minutes: data.duration_minutes,
      tasks: data.tasks,
      status: 'active',
    })
    .select(`
      id,
      user_id,
      name,
      subject_id,
      duration_minutes,
      tasks,
      status,
      created_at,
      updated_at,
      deleted_at,
      subjects (
        name
      )
    `)
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw error
  }

  const s = session as {
    id: string
    user_id: string
    name: string
    subject_id: string | null
    duration_minutes: number
    tasks: string[] | null
    status: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    subjects: { name: string } | null
  }

  return {
    id: s.id,
    user_id: s.user_id,
    name: s.name,
    subject_id: s.subject_id,
    subject_name: s.subjects?.name ?? null,
    duration_minutes: s.duration_minutes,
    tasks: s.tasks ?? [],
    status: s.status,
    created_at: s.created_at,
    updated_at: s.updated_at,
    deleted_at: s.deleted_at,
  }
}

export async function updateSession(
  sessionId: string,
  userId: string,
  data: UpdateSessionInput
): Promise<StudySession> {
  const supabase = createServerSupabaseClient()

  // First, fetch current session to create a version snapshot
  const current = await getSessionById(sessionId, userId)
  if (!current) {
    throw new Error('Session not found')
  }

  // Get the current max version number
  const { data: existingVersions } = await supabase
    .from('session_versions')
    .select('version_number')
    .eq('session_id', sessionId)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersionNumber =
    existingVersions && existingVersions.length > 0
      ? existingVersions[0].version_number + 1
      : 1

  // Insert version snapshot
  const snapshot = {
    name: current.name,
    subject_id: current.subject_id,
    subject_name: current.subject_name,
    duration_minutes: current.duration_minutes,
    tasks: current.tasks,
    status: current.status,
    updated_at: current.updated_at,
  }

  const { error: versionError } = await supabase
    .from('session_versions')
    .insert({
      session_id: sessionId,
      version_number: nextVersionNumber,
      snapshot,
    })

  if (versionError) {
    console.error('Error creating session version:', versionError)
    throw versionError
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (data.name !== undefined) updatePayload.name = data.name
  if (data.subject_id !== undefined) updatePayload.subject_id = data.subject_id || null
  if (data.duration_minutes !== undefined) updatePayload.duration_minutes = data.duration_minutes
  if (data.tasks !== undefined) updatePayload.tasks = data.tasks

  const { data: updated, error } = await supabase
    .from('study_sessions')
    .update(updatePayload)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select(`
      id,
      user_id,
      name,
      subject_id,
      duration_minutes,
      tasks,
      status,
      created_at,
      updated_at,
      deleted_at,
      subjects (
        name
      )
    `)
    .single()

  if (error) {
    console.error('Error updating session:', error)
    throw error
  }

  const s = updated as {
    id: string
    user_id: string
    name: string
    subject_id: string | null
    duration_minutes: number
    tasks: string[] | null
    status: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    subjects: { name: string } | null
  }

  return {
    id: s.id,
    user_id: s.user_id,
    name: s.name,
    subject_id: s.subject_id,
    subject_name: s.subjects?.name ?? null,
    duration_minutes: s.duration_minutes,
    tasks: s.tasks ?? [],
    status: s.status,
    created_at: s.created_at,
    updated_at: s.updated_at,
    deleted_at: s.deleted_at,
  }
}

export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Check if any study logs reference this session
  const { count: logCount } = await supabase
    .from('study_logs')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  if (logCount && logCount > 0) {
    // Soft delete if logs exist
    const { error } = await supabase
      .from('study_sessions')
      .update({ deleted_at: new Date().toISOString(), status: 'archived' })
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error soft deleting session:', error)
      throw error
    }
  } else {
    // Hard delete if no logs
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }
}

export async function getSessionVersions(
  sessionId: string,
  userId: string
): Promise<SessionVersion[]> {
  const supabase = createServerSupabaseClient()

  // Verify ownership first
  const session = await getSessionById(sessionId, userId)
  if (!session) {
    return []
  }

  const { data, error } = await supabase
    .from('session_versions')
    .select('id, session_id, version_number, snapshot, created_at')
    .eq('session_id', sessionId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('Error fetching session versions:', error)
    throw error
  }

  return (data || []).map((v: {
    id: string
    session_id: string
    version_number: number
    snapshot: Record<string, unknown>
    created_at: string
  }) => ({
    id: v.id,
    session_id: v.session_id,
    version_number: v.version_number,
    snapshot: v.snapshot,
    created_at: v.created_at,
  }))
}
