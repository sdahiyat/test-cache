import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getUserSessions, checkSessionLimit } from '@/lib/sessions'
import { getSubjects } from '@/lib/subjects'
import SessionCard from '@/components/sessions/SessionCard'
import NewSessionButton from '@/components/sessions/NewSessionButton'
import TierLimitBanner from '@/components/sessions/TierLimitBanner'
import { BookOpen } from 'lucide-react'

export default async function SessionsPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [sessions, limitStatus, subjects] = await Promise.all([
    getUserSessions(user.id),
    checkSessionLimit(user.id),
    getSubjects(),
  ])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Study Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your study sessions
          </p>
        </div>
        <NewSessionButton
          disabled={!limitStatus.canCreate}
          limitReached={!limitStatus.canCreate}
          subjects={subjects}
        />
      </div>

      {/* Tier Limit Banner */}
      <TierLimitBanner
        count={limitStatus.count}
        limit={limitStatus.limit}
        isPro={limitStatus.isPro}
      />

      {/* Sessions Grid or Empty State */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No study sessions yet
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first study session to start tracking your learning
            progress.
          </p>
          <NewSessionButton
            disabled={!limitStatus.canCreate}
            limitReached={!limitStatus.canCreate}
            subjects={subjects}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
