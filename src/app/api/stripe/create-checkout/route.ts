import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRO_PRICE_ID } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let user;
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    } else {
      // Try cookie-based auth
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingSub && (existingSub.status === 'active' || existingSub.status === 'trialing')) {
      return NextResponse.json(
        { error: 'You already have an active Pro subscription' },
        { status: 400 }
      );
    }

    // Get user email — try profiles table first, fall back to auth user
    let email = user.email ?? '';

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profile?.email) {
      email = profile.email;
    }

    // Look up or create Stripe customer
    let stripeCustomerId = existingSub?.stripe_customer_id;

    if (!stripeCustomerId) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email,
          metadata: { userId: user.id },
        });
        stripeCustomerId = newCustomer.id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/upgrade?success=true`,
      cancel_url: `${APP_URL}/upgrade?canceled=true`,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    // Upsert stripe_customer_id into subscriptions table
    await supabase.from('subscriptions').upsert(
      {
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        status: existingSub?.status ?? 'free',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
