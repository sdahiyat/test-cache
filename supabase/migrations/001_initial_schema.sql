-- =============================================================================
-- StudySync Initial Database Schema
-- =============================================================================
-- This migration creates all 7 core tables with constraints, indexes,
-- foreign keys, and row-level security (RLS) policies.
--
-- How to apply:
--   Option 1: Supabase CLI — run `supabase db push` from the project root.
--   Option 2: Supabase Dashboard — paste this file into the SQL editor and run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL UNIQUE,
  display_name  TEXT,
  username      TEXT        UNIQUE,
  bio           TEXT,
  study_focus   TEXT,
  avatar_url    TEXT,
  is_pro        BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. subjects
-- ---------------------------------------------------------------------------
CREATE TABLE public.subjects (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT        NOT NULL,
  category         TEXT        NOT NULL,
  task_description TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. study_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE public.study_sessions (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  subject          TEXT        NOT NULL,
  duration_minutes INTEGER     NOT NULL CHECK (duration_minutes > 0),
  tasks            JSONB       NOT NULL DEFAULT '[]',
  is_completed     BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. study_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.study_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id       UUID        REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  subject          TEXT        NOT NULL,
  tasks_completed  JSONB       NOT NULL DEFAULT '[]',
  duration_minutes INTEGER     NOT NULL CHECK (duration_minutes > 0),
  notes            TEXT,
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. follows
-- ---------------------------------------------------------------------------
CREATE TABLE public.follows (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ---------------------------------------------------------------------------
-- 6. comments
-- ---------------------------------------------------------------------------
CREATE TABLE public.comments (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID        NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 7. likes
-- ---------------------------------------------------------------------------
CREATE TABLE public.likes (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID        NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, session_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_study_sessions_user_id  ON public.study_sessions(user_id);
CREATE INDEX idx_study_logs_user_id      ON public.study_logs(user_id);
CREATE INDEX idx_study_logs_session_id   ON public.study_logs(session_id);
CREATE INDEX idx_follows_follower_id     ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id    ON public.follows(following_id);
CREATE INDEX idx_comments_session_id     ON public.comments(session_id);
CREATE INDEX idx_likes_session_id        ON public.likes(session_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Enable Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes          ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS Policies: users
-- ---------------------------------------------------------------------------
-- Any authenticated user can view any profile (public profiles)
CREATE POLICY "users_select_authenticated"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own row
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own row
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only delete their own row
CREATE POLICY "users_delete_own"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- RLS Policies: study_sessions
-- ---------------------------------------------------------------------------
-- Any authenticated user can read any session (for activity feed)
CREATE POLICY "study_sessions_select_authenticated"
  ON public.study_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "study_sessions_insert_own"
  ON public.study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_update_own"
  ON public.study_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_delete_own"
  ON public.study_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: study_logs (private — only owner can read)
-- ---------------------------------------------------------------------------
CREATE POLICY "study_logs_select_own"
  ON public.study_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "study_logs_insert_own"
  ON public.study_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_logs_update_own"
  ON public.study_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_logs_delete_own"
  ON public.study_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: subjects (public reference data — read-only for normal users)
-- ---------------------------------------------------------------------------
CREATE POLICY "subjects_select_authenticated"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT / UPDATE / DELETE are blocked for normal users (no policies).
-- Only the service role (which bypasses RLS) can modify subjects.

-- ---------------------------------------------------------------------------
-- RLS Policies: follows
-- ---------------------------------------------------------------------------
CREATE POLICY "follows_select_authenticated"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "follows_insert_own"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: comments
-- ---------------------------------------------------------------------------
CREATE POLICY "comments_select_authenticated"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "comments_insert_own"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: likes
-- ---------------------------------------------------------------------------
CREATE POLICY "likes_select_authenticated"
  ON public.likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "likes_insert_own"
  ON public.likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
  ON public.likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create user profile trigger
-- ---------------------------------------------------------------------------
-- When Supabase Auth creates a new user in auth.users, this trigger
-- automatically creates the corresponding row in public.users so application
-- code never needs to do this manually.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
