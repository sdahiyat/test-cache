import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('GET profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const {
      display_name,
      username,
      bio,
      study_focus,
      avatar_url,
      timezone,
    } = body;

    // Validate bio length
    if (bio !== undefined && bio !== null && bio.length > 300) {
      return NextResponse.json(
        { error: 'Bio must be 300 characters or less' },
        { status: 400 }
      );
    }

    // Validate timezone
    if (timezone !== undefined && timezone !== null) {
      if (typeof timezone !== 'string' || timezone.length > 100) {
        return NextResponse.json(
          { error: 'Invalid timezone value' },
          { status: 400 }
        );
      }
    }

    // Build update object — only include provided fields
    const updateData: Record<string, unknown> = {};

    if (display_name !== undefined) {
      if (typeof display_name !== 'string' || display_name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Display name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.display_name = display_name.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio === null ? null : bio;
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    if (study_focus !== undefined) {
      updateData.study_focus = study_focus;
    }

    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }

    // Handle username change with 30-day restriction
    if (username !== undefined) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, username_updated_at')
        .eq('id', user.id)
        .single();

      if (currentProfile?.username_updated_at) {
        const lastChanged = new Date(currentProfile.username_updated_at);
        const daysSince =
          (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 30) {
          const daysLeft = Math.ceil(30 - daysSince);
          return NextResponse.json(
            {
              error: `Username can only be changed every 30 days. Please wait ${daysLeft} more day(s).`,
            },
            { status: 400 }
          );
        }
      }

      // Check uniqueness
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }

      updateData.username = username.toLowerCase();
      updateData.username_updated_at = new Date().toISOString();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Handle missing column gracefully
      if (updateError.code === '42703') {
        // Column does not exist — retry without the problematic field
        if (updateData.timezone !== undefined) {
          delete updateData.timezone;
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

          if (retryError) {
            return NextResponse.json(
              { error: 'Failed to update profile' },
              { status: 500 }
            );
          }
          return NextResponse.json(retryProfile);
        }
      }
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('PATCH profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
