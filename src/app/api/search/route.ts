import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  if (q.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServer();

    const [usersResult, subjectsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, study_focus')
        .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(50),
      supabase
        .from('subjects')
        .select('id, name, category, description')
        .ilike('name', `${q}%`)
        .limit(50),
    ]);

    if (usersResult.error) {
      console.error('Error fetching users:', usersResult.error);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    if (subjectsResult.error) {
      console.error('Error fetching subjects:', subjectsResult.error);
      return NextResponse.json(
        { error: 'Failed to search subjects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: usersResult.data ?? [],
      subjects: subjectsResult.data ?? [],
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
