import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import SessionCard from '@/components/sessions/SessionCard'
import { SessionListSkeleton } from '@/components/sessions/SessionSkeleton'
import { SessionWithSubject } from '@/types/database'

async function SessionsList() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: sessions }, { data: subscription }] = await Promise.all([
    supabase
      .from('study_sessions')
      .select(`
        *,
        subject:subjects(*),
        profile:profiles!study_sessions_user_id_fkey(username, display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single(),
  ])

  const tier = subscription?.tier ?? 'free'
  const activeSessions = (sessions ?? []).filter((s) => s.status === 'active')
  const isAtLimit = tier === 'free' && activeSessions.length >= 5

  return (
    <SessionsContent
      sessions={(sessions ?? []) as SessionWithSubject[]}
      isAtLimit={isAtLimit}
      tier={tier}
      activeCount={activeSessions.length}
    />
  )
}

function SessionsContent({
  sessions,
  isAtLimit,
  tier,
  activeCount,
}: {
  sessions: SessionWithSubject[]
  isAtLimit: boolean
  tier: string
  activeCount: number
}) {
  return (
    <>
      {/* Limit warning */}
      {isAtLimit && (
        <div className="mb-6 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-800">
              You've reached the free plan limit ({activeCount}/5 active sessions)
            </p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Archive a session or{' '}
              <Link href="/upgrade" className="font-semibold underline hover:no-underline">
                upgrade to Pro
              </Link>{' '}
              for unlimited sessions.
            </p>
          </div>
          <Link
            href="/upgrade"
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Upgrade
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Free tier indicator (not at limit) */}
      {tier === 'free' && !isAtLimit && (
        <div className="mb-6 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{activeCount}/5</span> active sessions used on free plan
          </p>
          <Link
            href="/upgrade"
            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
          >
            Upgrade for unlimited
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Session grid */}
      {sessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No study sessions yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first one to get started organizing your studies.
          </p>
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Session
          </Link>
        </div>
      )}
    </>
  )
}

export default async function SessionsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Quick check for limit to render the button state
  const [{ data: sessions }, { data: subscription }] = await Promise.all([
    supabase
      .from('study_sessions')
      .select('status')
      .eq('user_id', user!.id)
      .eq('status', 'active'),
    supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user!.id)
      .single(),
  ])

  const tier = subscription?.tier ?? 'free'
  const activeCount = sessions?.length ?? 0
  const isAtLimit = tier === 'free' && activeCount >= 5

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Study Sessions</h1>
          <p className="text-gray-500 mt-1">Organize and manage your study sessions</p>
        </div>

        <div className="relative group">
          {isAtLimit ? (
            <>
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-400 font-medium rounded-xl cursor-not-allowed text-sm"
                title="Upgrade to create more sessions"
              >
                <Plus className="h-4 w-4" />
                New Session
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-10 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                You've reached the 5-session limit. Upgrade to Pro for unlimited sessions.
              </div>
            </>
          ) : (
            <Link
              href="/sessions/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              New Session
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={<SessionListSkeleton />}>
        <SessionsList />
      </Suspense>
    </div>
  )
}
