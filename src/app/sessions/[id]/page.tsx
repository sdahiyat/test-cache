import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionById, getSessionVersions } from '@/lib/sessions'
import { getSubjects } from '@/lib/subjects'
import SessionEditModal from '@/components/sessions/SessionEditModal'
import SessionDeleteButton from '@/components/sessions/SessionDeleteButton'
import VersionHistory from '@/components/sessions/VersionHistory'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckSquare,
  Calendar,
  Tag,
} from 'lucide-react'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [session, versions, subjects] = await Promise.all([
    getSessionById(params.id, user.id),
    getSessionVersions(params.id, user.id),
    getSubjects(),
  ])

  if (!session) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sessions
      </Link>

      {/* Session Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  session.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {session.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 break-words">
              {session.name}
            </h1>
            {session.subject_name && (
              <div className="flex items-center gap-1.5 mt-2 text-primary-600">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">{session.subject_name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SessionEditModal
              session={session}
              subjects={subjects}
            />
            <SessionDeleteButton
              sessionId={session.id}
              sessionName={session.name}
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-medium">{formatDuration(session.duration_minutes)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Tasks</p>
              <p className="text-sm font-medium">{session.tasks.length} tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Created</p>
              <p className="text-sm font-medium">{formatDate(session.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      {session.tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            Topics &amp; Tasks
          </h2>
          <ul className="space-y-2">
            {session.tasks.map((task, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-medium mt-0.5">
                  {index + 1}
                </span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Updated at */}
      {session.updated_at !== session.created_at && (
        <p className="text-xs text-gray-400 mb-4">
          Last updated {formatDate(session.updated_at)}
        </p>
      )}

      {/* Version History */}
      <VersionHistory sessionId={session.id} initialVersions={versions} />
    </div>
  )
}
