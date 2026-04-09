-- ============================================================
-- StudySync: Row-Level Security Policies
-- ============================================================
-- Run order: 002 (after 001_initial_schema.sql)
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_study_plans    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Public read: all profiles are public
CREATE POLICY "profiles_select_public"
  ON profiles
  FOR SELECT
  USING (true);

-- Insert: users can only create their own profile row
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update: users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Delete: disallow in MVP (no self-deletion)
-- (No DELETE policy = implicit deny)

-- ============================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================

-- Read: users can only see their own subscription
CREATE POLICY "subscriptions_select_own"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/Update/Delete: managed by service role only (webhooks/triggers)
-- No client-side INSERT, UPDATE, or DELETE policies → implicit deny for clients

-- ============================================================
-- SUBJECTS POLICIES
-- ============================================================

-- Public read: subject library is public
CREATE POLICY "subjects_select_public"
  ON subjects
  FOR SELECT
  USING (true);

-- Insert/Update/Delete: admin/service role only → implicit deny for clients

-- ============================================================
-- TASKS POLICIES
-- ============================================================

-- Public read: task library is public
CREATE POLICY "tasks_select_public"
  ON tasks
  FOR SELECT
  USING (true);

-- Insert/Update/Delete: admin/service role only → implicit deny for clients

-- ============================================================
-- STUDY SESSIONS POLICIES
-- ============================================================

-- Read: users see only their own sessions
CREATE POLICY "study_sessions_select_own"
  ON study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert: own row only; enforce free-tier active session limit at DB level
CREATE POLICY "study_sessions_insert_own"
  ON study_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      is_pro_user(auth.uid())
      OR (
        SELECT COUNT(*)
          FROM study_sessions
         WHERE user_id = auth.uid()
           AND status = 'active'
      ) < 5
    )
  );

-- Update: own sessions only
CREATE POLICY "study_sessions_update_own"
  ON study_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: own sessions only
CREATE POLICY "study_sessions_delete_own"
  ON study_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STUDY LOGS POLICIES
-- ============================================================

-- Read: own logs OR logs of followed users
CREATE POLICY "study_logs_select_own_and_followed"
  ON study_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
        FROM follows
       WHERE follower_id  = auth.uid()
         AND following_id = study_logs.user_id
    )
  );

-- Insert: own row; free users capped at 500 logs
CREATE POLICY "study_logs_insert_own"
  ON study_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      is_pro_user(auth.uid())
      OR (
        SELECT COUNT(*)
          FROM study_logs
         WHERE user_id = auth.uid()
      ) < 500
    )
  );

-- Update: own logs only
CREATE POLICY "study_logs_update_own"
  ON study_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: own logs only
CREATE POLICY "study_logs_delete_own"
  ON study_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS POLICIES
-- ============================================================

-- Read: any authenticated user can see follow relationships
CREATE POLICY "follows_select_authenticated"
  ON follows
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert: authenticated user can only follow as themselves
CREATE POLICY "follows_insert_own"
  ON follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Delete: authenticated user can only unfollow as themselves
CREATE POLICY "follows_delete_own"
  ON follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- No UPDATE needed for follows

-- ============================================================
-- LIKES POLICIES
-- ============================================================

-- Read: any authenticated user can see likes
CREATE POLICY "likes_select_authenticated"
  ON likes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert: authenticated user can only like as themselves
CREATE POLICY "likes_insert_own"
  ON likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Delete: authenticated user can only remove their own like
CREATE POLICY "likes_delete_own"
  ON likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS POLICIES
-- ============================================================

-- Read: any authenticated user can see comments (including flagged — visibility controlled in app layer)
CREATE POLICY "comments_select_authenticated"
  ON comments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert: authenticated user can only comment as themselves
CREATE POLICY "comments_insert_own"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update: disallow from client (flagging managed server-side via service role)
-- No UPDATE policy → implicit deny for clients

-- Delete: users can only delete their own comments
CREATE POLICY "comments_delete_own"
  ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- AI USAGE TRACKING POLICIES
-- ============================================================

-- Read: users can only see their own usage records
CREATE POLICY "ai_usage_tracking_select_own"
  ON ai_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/Update/Delete: managed server-side via service role only → implicit deny for clients

-- ============================================================
-- AI STUDY PLANS POLICIES
-- ============================================================

-- Read: users can only see their own plans
CREATE POLICY "ai_study_plans_select_own"
  ON ai_study_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert: managed server-side via service role only → implicit deny for clients

-- Update: users can edit their own generated plans (to customize)
CREATE POLICY "ai_study_plans_update_own"
  ON ai_study_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: users can delete their own plans
CREATE POLICY "ai_study_plans_delete_own"
  ON ai_study_plans
  FOR DELETE
  USING (auth.uid() = user_id);
