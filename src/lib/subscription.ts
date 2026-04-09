import { createServerClient } from '@/lib/supabase';

export type SubscriptionStatus = 'free' | 'pro' | 'grace';

export interface UserSubscription {
  status: SubscriptionStatus;
  isActive: boolean;
  isPro: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEnd: string | null;
}

const FREE_SESSION_LIMIT = 5;

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = createServerClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !subscription) {
    return {
      status: 'free',
      isActive: false,
      isPro: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      gracePeriodEnd: null,
    };
  }

  const dbStatus = subscription.status as string;
  const now = new Date();

  let status: SubscriptionStatus = 'free';
  let isPro = false;

  if (dbStatus === 'active' || dbStatus === 'trialing') {
    status = 'pro';
    isPro = true;
  } else if (dbStatus === 'past_due') {
    const gracePeriodEnd = subscription.grace_period_end
      ? new Date(subscription.grace_period_end)
      : null;

    if (gracePeriodEnd && gracePeriodEnd > now) {
      status = 'grace';
      isPro = true;
    } else {
      status = 'free';
      isPro = false;
    }
  } else {
    status = 'free';
    isPro = false;
  }

  return {
    status,
    isActive: isPro,
    isPro,
    currentPeriodEnd: subscription.current_period_end ?? null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    gracePeriodEnd: subscription.grace_period_end ?? null,
  };
}

export async function canUseAI(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription.isPro;
}

export async function canCreateSession(
  userId: string,
  currentSessionCount: number
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (subscription.isPro) return true;
  return currentSessionCount < FREE_SESSION_LIMIT;
}
