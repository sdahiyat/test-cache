import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase'
import SettingsPageClient from '@/components/profile/SettingsPageClient'
import type { Profile } from '@/types/database'

export const metadata: Metadata = {
  title: 'Settings | StudySync',
  description: 'Manage your StudySync profile and account settings',
}

export default async function SettingsPage() {
  const supabase = createServerComponentClient()

  // Check authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login?redirectTo=/settings')
  }

  const serviceClient = createServiceRoleClient()

  // Fetch the user's profile
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  // If profile doesn't exist yet, we might need to handle onboarding
  // For now, create a minimal profile if one doesn't exist
  let userProfile: Profile | null = profile

  if (profileError?.code === 'PGRST116' || !profile) {
    // Profile not found — attempt to create one from auth user metadata
    const username = (session.user.user_metadata?.username as string) ||
      session.user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20) ||
      `user_${session.user.id.slice(0, 8)}`

    const displayName = (session.user.user_metadata?.display_name as string) ||
      (session.user.user_metadata?.full_name as string) ||
      session.user.email?.split('@')[0] ||
      'New User'

    const { data: newProfile, error: createError } = await serviceClient
      .from('profiles')
      .insert({
        user_id: session.user.id,
        display_name: displayName,
        username: username,
        bio: null,
        study_focus: null,
        avatar_url: null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create profile:', createError)
      // Redirect to home with an error message or show error state
      redirect('/')
    }

    userProfile = newProfile
  } else if (profileError) {
    console.error('Error fetching profile:', profileError)
    redirect('/')
  }

  if (!userProfile) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your profile and account preferences
        </p>
      </div>
      <SettingsPageClient profile={userProfile} />
    </main>
  )
}
