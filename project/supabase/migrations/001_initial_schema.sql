-- Initial schema for StudySync.
-- Creates 7 core tables with foreign keys and indexes.

create extension if not exists "pgcrypto";

-- 1) users (mirrors auth.users)
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    avatar_url text,
    stripe_customer_id text unique,
    stripe_subscription_id text,
    subscription_status text not null default 'free',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2) subjects
create table if not exists public.subjects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    color text not null default '#6366f1',
    icon text,
    user_id uuid not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

-- 3) study_sessions
create table if not exists public.study_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    title text not null,
    description text,
    duration_minutes integer not null default 0,
    is_public boolean not null default false,
    ai_summary text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4) study_logs
create table if not exists public.study_logs (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.study_sessions(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    duration_seconds integer not null default 0,
    notes text,
    created_at timestamptz not null default now()
);

-- 5) follows
create table if not exists public.follows (
    id uuid primary key default gen_random_uuid(),
    follower_id uuid not null references public.users(id) on delete cascade,
    following_id uuid not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (follower_id, following_id),
    check (follower_id <> following_id)
);

-- 6) comments
create table if not exists public.comments (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.study_sessions(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 7) likes
create table if not exists public.likes (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.study_sessions(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (session_id, user_id)
);

-- Indexes
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_study_sessions_user_id on public.study_sessions (user_id);
create index if not exists idx_study_sessions_is_public on public.study_sessions (is_public);
create index if not exists idx_study_logs_session_id on public.study_logs (session_id);
create index if not exists idx_study_logs_user_id on public.study_logs (user_id);
create index if not exists idx_subjects_user_id on public.subjects (user_id);
create index if not exists idx_follows_follower_id on public.follows (follower_id);
create index if not exists idx_follows_following_id on public.follows (following_id);
create index if not exists idx_comments_session_id on public.comments (session_id);
create index if not exists idx_likes_session_id on public.likes (session_id);
