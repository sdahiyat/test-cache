import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { BookOpen, User } from 'lucide-react'

export default async function SessionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile for display name
  let displayName = user?.email ?? 'User'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.display_name) {
      displayName = profile.display_name
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-primary-600 font-bold text-xl hover:text-primary-700 transition-colors"
            >
              <BookOpen className="h-6 w-6" />
              <span>StudySync</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/sessions"
                className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Sessions
              </Link>
              <Link
                href="/feed"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Feed
              </Link>
            </div>

            {/* User */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden sm:block font-medium">{displayName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
