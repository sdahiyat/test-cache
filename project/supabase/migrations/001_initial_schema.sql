-- Initial schema: 7 core tables (users, subjects, study_sessions, study_logs,
-- follows, comments, likes) with foreign keys and indexes.

create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  created_at timestamptz not null default now()
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_seconds integer,
  is_active boolean not null default false,
  goal_duration_seconds integer,
  created_at timestamptz not null default now()
);

create table public.study_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  log_type text not null check (log_type in ('start', 'pause', 'resume', 'stop', 'note')),
  note text,
  timestamp timestamptz not null default now()
);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, session_id)
);

create index idx_subjects_user_id on public.subjects(user_id);
create index idx_study_sessions_user_id on public.study_sessions(user_id);
create index idx_study_sessions_subject_id on public.study_sessions(subject_id);
create index idx_study_logs_session_id on public.study_logs(session_id);
create index idx_study_logs_user_id on public.study_logs(user_id);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_comments_session_id on public.comments(session_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_likes_session_id on public.likes(session_id);
create index idx_likes_user_id on public.likes(user_id);
