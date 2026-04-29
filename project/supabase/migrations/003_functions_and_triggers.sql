-- Database functions and triggers for StudySync.

-- Mirror new auth.users rows into public.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.users (id, email, full_name, avatar_url)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Generic updated_at touch function.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_updated_at_users on public.users;
create trigger set_updated_at_users
    before update on public.users
    for each row
    execute function public.update_updated_at_column();

drop trigger if exists set_updated_at_study_sessions on public.study_sessions;
create trigger set_updated_at_study_sessions
    before update on public.study_sessions
    for each row
    execute function public.update_updated_at_column();

drop trigger if exists set_updated_at_comments on public.comments;
create trigger set_updated_at_comments
    before update on public.comments
    for each row
    execute function public.update_updated_at_column();

-- Aggregate user stats.
create or replace function public.get_user_stats(user_uuid uuid)
returns json
language sql
stable
as $$
    select json_build_object(
        'total_sessions',
            (select count(*) from public.study_sessions where user_id = user_uuid),
        'total_duration_minutes',
            coalesce((select sum(duration_minutes) from public.study_sessions where user_id = user_uuid), 0),
        'public_sessions',
            (select count(*) from public.study_sessions where user_id = user_uuid and is_public = true),
        'followers',
            (select count(*) from public.follows where following_id = user_uuid),
        'following',
            (select count(*) from public.follows where follower_id = user_uuid)
    );
$$;
