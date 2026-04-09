import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen, CheckSquare, History, Edit2 } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import DeleteSessionButton from '@/components/sessions/DeleteSessionButton'
import VersionHistory from '@/components/sessions/VersionHistory'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Subject, StudySessionVersion } from '@/types/database'

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700', dotClass: 'bg-green-500' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-400' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700', dotClass: 'bg-blue-500' },
}

const CATEGORY_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Science: 'bg-green-100 text-green-700',
  'Computer Science': 'bg-purple-100 text-purple-700',
  'Language Arts': 'bg-yellow-100 text-yellow-700',
  History: 'bg-orange-100 text-orange-700',
  Geography: 'bg-teal-100 text-teal-700',
  Arts: 'bg-pink-100 text-pink-700',
  Music: 'bg-indigo-100 text-indigo-700',
  'Physical Education': 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch session
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
    notFound()
  }

  if (session.user_id !== user.id) {
    redirect('/sessions')
  }

  // Fetch version history
  const { data: versions } = await supabase
    .from('study_session_versions')
    .select('*')
    .eq('session_id', id)
    .order('version_number', { ascending: false })

  // Fetch all subjects for version history display
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name')

  const status = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active
  const subjectCategory = session.subject?.category
  const categoryColor = subjectCategory
    ? (CATEGORY_COLORS[subjectCategory] ?? CATEGORY_COLORS.Other)
    : CATEGORY_COLORS.Other

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Sessions
      </Link>

      {/* Session header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
              {session.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {/* Subject badge */}
              {session.subject && (
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium', categoryColor)}>
                  <BookOpen className="h-3.5 w-3.5" />
                  {session.subject.name}
                </span>
              )}

              {/* Duration badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(session.duration_minutes)}
              </span>

              {/* Status badge */}
              <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium', status.className)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dotClass)} />
                {status.label}
              </span>

              {/* Version badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                v{session.version}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/sessions/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Link>
            <DeleteSessionButton
              sessionId={id}
              sessionName={session.name}
              redirectAfterDelete
              className="px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50"
            />
          </div>
        </div>

        {/* Meta */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-3 mt-3">
          Created {new Date(session.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
          {session.updated_at !== session.created_at && (
            <span className="ml-2">
              · Updated {new Date(session.updated_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          )}
        </div>
      </div>

      {/* Tasks */}
      {session.tasks && session.tasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckSquare className="h-4.5 w-4.5 text-gray-400" />
            Tasks & Topics
            <span className="ml-auto text-sm font-normal text-gray-400">
              {session.tasks.length} item{session.tasks.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <ul className="space-y-2">
            {session.tasks.map((task: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-medium">{i + 1}</span>
                </span>
                <span className="text-sm text-gray-700">{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Version History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-gray-400" />
          Edit History
          {versions && versions.length > 0 && (
            <span className="ml-auto text-sm font-normal text-gray-400">
              {versions.length} revision{versions.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <VersionHistory
          versions={(versions ?? []) as StudySessionVersion[]}
          subjects={(subjects ?? []) as Subject[]}
        />
      </div>
    </div>
  )
}
