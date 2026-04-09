import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { getStudyLogs, getStudyLogCount, getProgressStats } from '@/lib/study-logs';
import { StudyPageClient } from './StudyPageClient';

export const metadata = {
  title: 'Study Log | StudySync',
};

export default async function StudyPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [logs, count, progressStats, profileData] = await Promise.all([
    getStudyLogs(user.id),
    getStudyLogCount(user.id),
    getProgressStats(user.id),
    supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single(),
  ]);

  const subscriptionTier = profileData.data?.subscription_tier ?? 'free';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <StudyPageClient
        initialLogs={logs}
        initialCount={count}
        progressStats={progressStats}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}
