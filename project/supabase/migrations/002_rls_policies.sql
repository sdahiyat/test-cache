-- Row-level security policies for all 7 tables. Ownership is enforced via
-- auth.uid() = user_id; visibility extends to public profiles via users.is_public.

alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_logs enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- users
create policy users_select_policy on public.users
  for select using (is_public = true or auth.uid() = id);

create policy users_insert_policy on public.users
  for insert with check (auth.uid() = id);

create policy users_update_policy on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy users_delete_policy on public.users
  for delete using (auth.uid() = id);

-- subjects
create policy subjects_select_policy on public.subjects
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.users u
      where u.id = subjects.user_id and u.is_public = true
    )
  );

create policy subjects_insert_policy on public.subjects
  for insert with check (auth.uid() = user_id);

create policy subjects_update_policy on public.subjects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy subjects_delete_policy on public.subjects
  for delete using (auth.uid() = user_id);

-- study_sessions
create policy study_sessions_select_policy on public.study_sessions
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.users u
      where u.id = study_sessions.user_id and u.is_public = true
    )
  );

create policy study_sessions_insert_policy on public.study_sessions
  for insert with check (auth.uid() = user_id);

create policy study_sessions_update_policy on public.study_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy study_sessions_delete_policy on public.study_sessions
  for delete using (auth.uid() = user_id);

-- study_logs
create policy study_logs_select_policy on public.study_logs
  for select using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.study_sessions ss
      join public.users u on u.id = ss.user_id
      where ss.id = study_logs.session_id and u.is_public = true
    )
  );

create policy study_logs_insert_policy on public.study_logs
  for insert with check (auth.uid() = user_id);

create policy study_logs_update_policy on public.study_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy study_logs_delete_policy on public.study_logs
  for delete using (auth.uid() = user_id);

-- follows
create policy follows_select_policy on public.follows
  for select using (auth.uid() = follower_id or auth.uid() = following_id);

create policy follows_insert_policy on public.follows
  for insert with check (auth.uid() = follower_id);

create policy follows_delete_policy on public.follows
  for delete using (auth.uid() = follower_id);

-- comments
create policy comments_select_policy on public.comments
  for select using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or exists (
        select 1
        from public.study_sessions ss
        join public.users u on u.id = ss.user_id
        where ss.id = comments.session_id
          and (u.is_public = true or u.id = auth.uid())
      )
    )
  );

create policy comments_insert_policy on public.comments
  for insert with check (auth.uid() = user_id);

create policy comments_update_policy on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy comments_delete_policy on public.comments
  for delete using (auth.uid() = user_id);

-- likes
create policy likes_select_policy on public.likes
  for select using (auth.uid() is not null);

create policy likes_insert_policy on public.likes
  for insert with check (auth.uid() = user_id);

create policy likes_delete_policy on public.likes
  for delete using (auth.uid() = user_id);
