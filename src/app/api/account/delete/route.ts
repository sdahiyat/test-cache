import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST() {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin client bypasses RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get subscription info before deletion for Stripe cleanup
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single();

    // Cancel active Stripe subscription if exists
    if (subscription?.stripe_subscription_id) {
      const activeStatuses = ['active', 'trialing', 'past_due'];
      if (activeStatuses.includes(subscription.status)) {
        try {
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        } catch (stripeError) {
          // Log but don't fail account deletion
          console.error('Stripe cancel error:', stripeError);
        }
      }
    }

    // Delete user data in dependency order
    const deletions = await Promise.allSettled([
      adminClient.from('study_logs').delete().eq('user_id', user.id),
      adminClient.from('study_sessions').delete().eq('user_id', user.id),
      adminClient
        .from('follows')
        .delete()
        .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`),
      adminClient.from('likes').delete().eq('user_id', user.id),
      adminClient.from('comments').delete().eq('user_id', user.id),
      adminClient.from('subscriptions').delete().eq('user_id', user.id),
    ]);

    // Log any deletion errors (non-fatal if table doesn't exist)
    deletions.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Deletion ${index} failed:`, result.reason);
      }
    });

    // Delete profile
    await adminClient.from('profiles').delete().eq('id', user.id);

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Auth user deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again.' },
      { status: 500 }
    );
  }
}
