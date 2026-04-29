-- Helper functions and triggers:
--   - mirror auth.users -> public.users on signup
--   - keep updated_at columns fresh
--   - derive duration_seconds from start/end times

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
  before update on public.comments
  for each row
  execute function public.update_updated_at_column();

create or replace function public.calculate_session_duration()
returns trigger
language plpgsql
as $$
begin
  if new.end_time is not null
     and (old.end_time is distinct from new.end_time) then
    new.duration_seconds := extract(epoch from (new.end_time - new.start_time))::integer;
  end if;
  return new;
end;
$$;

drop trigger if exists set_session_duration on public.study_sessions;
create trigger set_session_duration
  before update on public.study_sessions
  for each row
  execute function public.calculate_session_duration();
