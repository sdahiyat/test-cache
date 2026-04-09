import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import StudyPageClient from './StudyPageClient';

export const metadata: Metadata = {
  title: 'Study Log | StudySync',
  description: 'Track your study sessions, visualize progress, and stay on top of your learning goals.',
};

export default async function StudyPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch user subscription info
  const { data: userData } = await supabase
    .from('users')
    .select('id, subscription_tier')
    .eq('id', user.id)
    .single();

  // Fetch study logs
  const { data: logsData } = await supabase
    .from('study_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(200);

  const logs = logsData ?? [];
  const subscriptionTier = userData?.subscription_tier ?? 'free';
  const isLimitReached = subscriptionTier === 'free' && logs.length >= 500;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Study Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your study sessions and visualize your learning progress.
          </p>
          {subscriptionTier === 'free' && (
            <p className="mt-1 text-xs text-gray-400">
              {logs.length} / 500 entries used on free plan
            </p>
          )}
        </div>

        <StudyPageClient
          initialLogs={logs}
          userId={user.id}
          isLimitReached={isLimitReached}
        />
      </div>
    </div>
  );
}
