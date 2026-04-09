export interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  bio: string | null;
  study_focus: string | null;
  avatar_url: string | null;
  username_updated_at: string | null;
  timezone: string | null;
}

export interface SubscriptionData {
  id: string;
  user_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  plan: 'free' | 'pro';
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export type SettingsTab = 'profile' | 'subscription' | 'preferences' | 'account';
