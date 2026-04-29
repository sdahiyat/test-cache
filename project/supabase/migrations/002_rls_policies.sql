-- Row-level security policies for StudySync.

alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_logs enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- USERS
create policy "Public profiles are viewable"
    on public.users for select
    using (true);

create policy "Users can update own profile"
    on public.users for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- SUBJECTS
create policy "Users manage own subjects"
    on public.subjects for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- STUDY_SESSIONS
create policy "Users can manage own sessions"
    on public.study_sessions for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Public sessions are viewable by all"
    on public.study_sessions for select
    using (is_public = true);

create policy "Followers can view private sessions"
    on public.study_sessions for select
    using (
        user_id in (
            select following_id from public.follows
            where follower_id = auth.uid()
        )
    );

-- STUDY_LOGS
create policy "Users manage own logs"
    on public.study_logs for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Session owners can view logs"
    on public.study_logs for select
    using (
        session_id in (
            select id from public.study_sessions
            where user_id = auth.uid()
        )
    );

-- FOLLOWS
create policy "Users can view all follows"
    on public.follows for select
    using (true);

create policy "Users can insert own follows"
    on public.follows for insert
    with check (auth.uid() = follower_id);

create policy "Users can delete own follows"
    on public.follows for delete
    using (auth.uid() = follower_id);

-- COMMENTS
create policy "View comments on public or own sessions"
    on public.comments for select
    using (
        session_id in (
            select id from public.study_sessions
            where is_public = true or user_id = auth.uid()
        )
    );

create policy "Authenticated users can comment on public sessions"
    on public.comments for insert
    with check (
        auth.uid() = user_id
        and session_id in (
            select id from public.study_sessions
            where is_public = true
        )
    );

create policy "Users can update own comments"
    on public.comments for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own comments"
    on public.comments for delete
    using (auth.uid() = user_id);

-- LIKES
create policy "View likes on public or own sessions"
    on public.likes for select
    using (
        session_id in (
            select id from public.study_sessions
            where is_public = true or user_id = auth.uid()
        )
    );

create policy "Authenticated users can like public sessions"
    on public.likes for insert
    with check (
        auth.uid() = user_id
        and session_id in (
            select id from public.study_sessions
            where is_public = true
        )
    );

create policy "Users can unlike"
    on public.likes for delete
    using (auth.uid() = user_id);
