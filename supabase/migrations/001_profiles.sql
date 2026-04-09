-- Migration: 001_profiles.sql
-- Run this migration against your Supabase project:
--   1. Via Supabase Dashboard: Go to SQL Editor and paste this file
--   2. Via Supabase CLI: supabase db push
--   3. Via psql: psql $DATABASE_URL -f supabase/migrations/001_profiles.sql

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  bio text CHECK (char_length(bio) <= 300),
  study_focus text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  username_updated_at timestamptz
);

-- Case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON profiles (lower(username));

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read: all profiles are public
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
CREATE POLICY "Profiles are publicly viewable"
  ON profiles FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE: AVATARS BUCKET
-- ============================================================
-- Insert the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for avatars bucket
-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own avatars
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own avatars
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read of all avatar objects
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ============================================================
-- STATS FUNCTION
-- Gracefully handles missing tables (study_logs, follows)
-- Returns 0s until those tables are created in later tasks
-- ============================================================
CREATE OR REPLACE FUNCTION get_profile_stats(p_user_id uuid)
RETURNS TABLE(
  study_hours numeric,
  tasks_completed bigint,
  followers_count bigint,
  following_count bigint,
  sessions_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_study_hours numeric := 0;
  v_tasks_completed bigint := 0;
  v_followers_count bigint := 0;
  v_following_count bigint := 0;
  v_sessions_count bigint := 0;
BEGIN
  -- Try to get study hours from study_logs (may not exist yet)
  BEGIN
    SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
    INTO v_study_hours
    FROM study_logs
    WHERE user_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_study_hours := 0;
  END;

  -- Try to get tasks completed from study_logs
  BEGIN
    SELECT COALESCE(COUNT(*), 0)
    INTO v_tasks_completed
    FROM study_logs
    WHERE user_id = p_user_id AND tasks_completed > 0;
  EXCEPTION WHEN undefined_table THEN
    v_tasks_completed := 0;
  END;

  -- Try to get followers count from follows table
  BEGIN
    SELECT COALESCE(COUNT(*), 0)
    INTO v_followers_count
    FROM follows
    WHERE following_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_followers_count := 0;
  END;

  -- Try to get following count from follows table
  BEGIN
    SELECT COALESCE(COUNT(*), 0)
    INTO v_following_count
    FROM follows
    WHERE follower_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_following_count := 0;
  END;

  -- Try to get sessions count from study_sessions table
  BEGIN
    SELECT COALESCE(COUNT(*), 0)
    INTO v_sessions_count
    FROM study_sessions
    WHERE user_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_sessions_count := 0;
  END;

  RETURN QUERY SELECT
    v_study_hours,
    v_tasks_completed,
    v_followers_count,
    v_following_count,
    v_sessions_count;
END;
$$;
