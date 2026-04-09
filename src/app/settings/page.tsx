import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Metadata } from 'next';
import SettingsPageClient from './SettingsPageClient';
import SettingsLoading from './loading';
import type { ProfileData, SubscriptionData } from '@/types/settings';

export const metadata: Metadata = {
  title: 'Settings | StudySync',
};

async function getSettingsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, display_name, username, bio, study_focus, avatar_url, username_updated_at, timezone'
    )
    .eq('id', user.id)
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(
      'id, user_id, status, plan, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id'
    )
    .eq('user_id', user.id)
    .single();

  return { user, profile, subscription };
}

export default async function SettingsPage() {
  const { user, profile, subscription } = await getSettingsData();

  const profileData: ProfileData = profile || {
    id: user.id,
    display_name: user.email?.split('@')[0] || '',
    username: '',
    bio: null,
    study_focus: null,
    avatar_url: null,
    username_updated_at: null,
    timezone: null,
  };

  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsPageClient
        profile={profileData}
        subscription={subscription as SubscriptionData | null}
        user={user}
      />
    </Suspense>
  );
}
