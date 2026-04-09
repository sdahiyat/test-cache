-- ============================================================
-- StudySync: Initial Schema Migration
-- ============================================================
-- Run order: 001 (must be first)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username             TEXT UNIQUE NOT NULL,
  display_name         TEXT NOT NULL,
  bio                  TEXT CHECK (char_length(bio) <= 300),
  study_focus          TEXT,
  avatar_url           TEXT,
  username_updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
  CONSTRAINT profiles_username_length CHECK (char_length(username) BETWEEN 3 AND 30)
);

-- ============================================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id       TEXT UNIQUE,
  stripe_subscription_id   TEXT UNIQUE,
  plan                     TEXT NOT NULL DEFAULT 'free'
                             CHECK (plan IN ('free', 'pro')),
  status                   TEXT NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end       TIMESTAMPTZ,
  grace_period_end         TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. SUBJECTS TABLE
-- ============================================================
CREATE TABLE subjects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TASKS TABLE (predefined task library)
-- ============================================================
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id   UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  difficulty   TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. STUDY SESSIONS TABLE
-- ============================================================
CREATE TABLE study_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  subject_id        UUID REFERENCES subjects(id) ON DELETE SET NULL,
  duration_minutes  INTEGER NOT NULL CHECK (duration_minutes > 0),
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'completed', 'archived')),
  task_ids          UUID[] NOT NULL DEFAULT '{}',
  notes             TEXT,
  version           INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. STUDY LOGS TABLE
-- ============================================================
CREATE TABLE study_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  subject_id        UUID REFERENCES subjects(id) ON DELETE SET NULL,
  duration_minutes  INTEGER NOT NULL CHECK (duration_minutes > 0),
  tasks_completed   UUID[] NOT NULL DEFAULT '{}',
  notes             TEXT,
  logged_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. FOLLOWS TABLE
-- ============================================================
CREATE TABLE follows (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (follower_id, following_id),
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id)
);

-- ============================================================
-- 8. LIKES TABLE
-- (session_id FK → study_logs.id per spec: likes are on feed items/logs)
-- ============================================================
CREATE TABLE likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  UUID NOT NULL REFERENCES study_logs(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, session_id)
);

-- ============================================================
-- 9. COMMENTS TABLE
-- (session_id FK → study_logs.id per spec: comments are on feed items/logs)
-- ============================================================
CREATE TABLE comments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id       UUID NOT NULL REFERENCES study_logs(id) ON DELETE CASCADE,
  content          TEXT NOT NULL CHECK (char_length(content) <= 500),
  is_flagged       BOOLEAN NOT NULL DEFAULT FALSE,
  appeal_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. AI USAGE TRACKING TABLE
-- ============================================================
CREATE TABLE ai_usage_tracking (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type  TEXT NOT NULL
                  CHECK (request_type IN ('study_plan', 'study_tips', 'moderation')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. AI STUDY PLANS TABLE
-- ============================================================
CREATE TABLE ai_study_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subjects        TEXT[] NOT NULL,
  hours_per_week  INTEGER NOT NULL,
  difficulty      TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  available_days  TEXT[] NOT NULL,
  plan_content    JSONB NOT NULL,
  is_edited       BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles (username);

-- Study sessions
CREATE INDEX idx_study_sessions_user_status ON study_sessions (user_id, status);

-- Study logs
CREATE INDEX idx_study_logs_user_logged_at ON study_logs (user_id, logged_at DESC);
CREATE INDEX idx_study_logs_session_id ON study_logs (session_id);

-- Follows
CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_follows_following_id ON follows (following_id);

-- Likes
CREATE INDEX idx_likes_session_id ON likes (session_id);
CREATE INDEX idx_likes_user_id ON likes (user_id);

-- Comments
CREATE INDEX idx_comments_session_id ON comments (session_id);

-- AI usage tracking
CREATE INDEX idx_ai_usage_user_created ON ai_usage_tracking (user_id, created_at);

-- AI study plans
CREATE INDEX idx_ai_study_plans_user_date ON ai_study_plans (user_id, generated_at);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_study_sessions_updated_at
  BEFORE UPDATE ON study_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_study_logs_updated_at
  BEFORE UPDATE ON study_logs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_ai_study_plans_updated_at
  BEFORE UPDATE ON ai_study_plans
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- HELPER FUNCTION: is_pro_user
-- ============================================================
CREATE OR REPLACE FUNCTION is_pro_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_plan   TEXT;
  v_status TEXT;
  v_grace  TIMESTAMPTZ;
BEGIN
  SELECT plan, status, grace_period_end
    INTO v_plan, v_status, v_grace
    FROM subscriptions
   WHERE user_id = user_uuid;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Active or trialing pro
  IF v_plan = 'pro' AND v_status IN ('active', 'trialing') THEN
    RETURN TRUE;
  END IF;

  -- Canceled but within grace period
  IF v_plan = 'pro' AND v_status = 'canceled' AND v_grace IS NOT NULL AND v_grace > NOW() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- ============================================================
-- TRIGGER: AUTO-CREATE PROFILE + SUBSCRIPTION ON AUTH SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_username   TEXT;
  v_username        TEXT;
  v_display_name    TEXT;
  v_suffix          TEXT;
  v_username_exists BOOLEAN;
BEGIN
  -- Derive a base username from the email prefix
  v_base_username := LOWER(
    REGEXP_REPLACE(
      SPLIT_PART(NEW.email, '@', 1),
      '[^a-zA-Z0-9_-]',
      '_',
      'g'
    )
  );

  -- Ensure minimum length
  IF char_length(v_base_username) < 3 THEN
    v_base_username := v_base_username || '_user';
  END IF;

  -- Truncate to 25 chars to leave room for suffix
  v_base_username := SUBSTRING(v_base_username FROM 1 FOR 25);

  -- Check uniqueness; append random 4-digit suffix if needed
  v_username := v_base_username;
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE username = v_username
  ) INTO v_username_exists;

  IF v_username_exists THEN
    v_suffix   := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    v_username := v_base_username || '_' || v_suffix;
  END IF;

  -- Derive display name
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    INITCAP(REPLACE(v_base_username, '_', ' '))
  );

  -- Insert profile
  INSERT INTO profiles (id, username, display_name, created_at, updated_at)
  VALUES (NEW.id, v_username, v_display_name, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Insert free subscription
  INSERT INTO subscriptions (user_id, plan, status, created_at, updated_at)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
