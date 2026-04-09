import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(_req: NextRequest) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: logs, error } = await supabase
    .from('study_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('[GET /api/study-logs]', error);
    return NextResponse.json({ error: 'Failed to fetch study logs' }, { status: 500 });
  }

  return NextResponse.json(logs ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { subject, duration, tasks_completed, notes, logged_at } = body as {
    subject?: unknown;
    duration?: unknown;
    tasks_completed?: unknown;
    notes?: unknown;
    logged_at?: unknown;
  };

  // Validate
  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'subject must be a non-empty string' }, { status: 400 });
  }
  if (typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
    return NextResponse.json(
      { error: 'duration must be a positive integer (minutes)' },
      { status: 400 }
    );
  }
  if (
    typeof tasks_completed !== 'number' ||
    !Number.isInteger(tasks_completed) ||
    tasks_completed < 0
  ) {
    return NextResponse.json(
      { error: 'tasks_completed must be a non-negative integer' },
      { status: 400 }
    );
  }
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 1000)) {
    return NextResponse.json(
      { error: 'notes must be a string with max 1000 characters' },
      { status: 400 }
    );
  }
  if (logged_at !== undefined && isNaN(Date.parse(String(logged_at)))) {
    return NextResponse.json({ error: 'logged_at must be a valid ISO date string' }, { status: 400 });
  }

  // Free-tier cap check
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('[POST /api/study-logs] user fetch error', userError);
    return NextResponse.json({ error: 'Failed to verify user subscription' }, { status: 500 });
  }

  if (userData?.subscription_tier === 'free') {
    const { count, error: countError } = await supabase
      .from('study_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('[POST /api/study-logs] count error', countError);
      return NextResponse.json({ error: 'Failed to check log count' }, { status: 500 });
    }

    if ((count ?? 0) >= 500) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: 'Free plan limit of 500 log entries reached. Upgrade to continue logging.',
        },
        { status: 403 }
      );
    }
  }

  // Insert
  const { data: newLog, error: insertError } = await supabase
    .from('study_logs')
    .insert({
      user_id: user.id,
      subject: subject.trim(),
      duration,
      tasks_completed,
      notes: typeof notes === 'string' ? notes : '',
      logged_at: logged_at ? new Date(String(logged_at)).toISOString() : new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('[POST /api/study-logs]', insertError);
    return NextResponse.json({ error: 'Failed to create study log' }, { status: 500 });
  }

  return NextResponse.json(newLog, { status: 201 });
}
