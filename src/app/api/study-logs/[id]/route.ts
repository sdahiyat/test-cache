import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: log, error } = await supabase
    .from('study_logs')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !log) {
    return NextResponse.json({ error: 'Study log not found' }, { status: 404 });
  }

  return NextResponse.json(log);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if ('subject' in body) {
    if (typeof body.subject !== 'string' || body.subject.trim().length === 0) {
      return NextResponse.json({ error: 'subject must be a non-empty string' }, { status: 400 });
    }
    updates.subject = body.subject.trim();
  }

  if ('duration' in body) {
    if (
      typeof body.duration !== 'number' ||
      !Number.isInteger(body.duration) ||
      body.duration <= 0
    ) {
      return NextResponse.json(
        { error: 'duration must be a positive integer (minutes)' },
        { status: 400 }
      );
    }
    updates.duration = body.duration;
  }

  if ('tasks_completed' in body) {
    if (
      typeof body.tasks_completed !== 'number' ||
      !Number.isInteger(body.tasks_completed) ||
      body.tasks_completed < 0
    ) {
      return NextResponse.json(
        { error: 'tasks_completed must be a non-negative integer' },
        { status: 400 }
      );
    }
    updates.tasks_completed = body.tasks_completed;
  }

  if ('notes' in body) {
    if (typeof body.notes !== 'string' || body.notes.length > 1000) {
      return NextResponse.json(
        { error: 'notes must be a string with max 1000 characters' },
        { status: 400 }
      );
    }
    updates.notes = body.notes;
  }

  if ('logged_at' in body) {
    if (isNaN(Date.parse(String(body.logged_at)))) {
      return NextResponse.json(
        { error: 'logged_at must be a valid ISO date string' },
        { status: 400 }
      );
    }
    updates.logged_at = new Date(String(body.logged_at)).toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data: updatedLog, error: updateError } = await supabase
    .from('study_logs')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError || !updatedLog) {
    if (updateError?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Study log not found' }, { status: 404 });
    }
    console.error('[PUT /api/study-logs/[id]]', updateError);
    return NextResponse.json({ error: 'Failed to update study log' }, { status: 500 });
  }

  return NextResponse.json(updatedLog);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('study_logs')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[DELETE /api/study-logs/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete study log' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
