-- ============================================================
-- StudySync: Helper Functions
-- ============================================================
-- Run order: 004 (after all previous migrations)
-- ============================================================

-- ============================================================
-- 1. get_profile_stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_profile_stats(profile_uuid UUID)
RETURNS TABLE (
  followers_count       BIGINT,
  following_count       BIGINT,
  study_hours_total     NUMERIC,
  tasks_completed_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    (SELECT COUNT(*) FROM follows WHERE following_id = profile_uuid)     AS followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id  = profile_uuid)     AS following_count,
    COALESCE(
      (SELECT SUM(duration_minutes)::NUMERIC / 60
         FROM study_logs
        WHERE user_id = profile_uuid),
      0
    )                                                                     AS study_hours_total,
    COALESCE(
      (SELECT SUM(array_length(tasks_completed, 1))
         FROM study_logs
        WHERE user_id = profile_uuid
          AND tasks_completed != '{}'),
      0
    )::BIGINT                                                             AS tasks_completed_count;
$$;

GRANT EXECUTE ON FUNCTION get_profile_stats(UUID) TO authenticated;

-- ============================================================
-- 2. get_feed_for_user
-- ============================================================
CREATE OR REPLACE FUNCTION get_feed_for_user(
  requesting_user_id UUID,
  page_limit         INTEGER DEFAULT 20,
  page_offset        INTEGER DEFAULT 0
)
RETURNS TABLE (
  id                   UUID,
  user_id              UUID,
  session_id           UUID,
  subject_id           UUID,
  duration_minutes     INTEGER,
  tasks_completed      UUID[],
  notes                TEXT,
  logged_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ,
  profile_username     TEXT,
  profile_display_name TEXT,
  profile_avatar_url   TEXT,
  subject_name         TEXT,
  subject_category     TEXT,
  likes_count          BIGINT,
  comments_count       BIGINT,
  is_liked_by_me       BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    sl.id,
    sl.user_id,
    sl.session_id,
    sl.subject_id,
    sl.duration_minutes,
    sl.tasks_completed,
    sl.notes,
    sl.logged_at,
    sl.created_at,
    sl.updated_at,
    p.username          AS profile_username,
    p.display_name      AS profile_display_name,
    p.avatar_url        AS profile_avatar_url,
    s.name              AS subject_name,
    s.category          AS subject_category,
    COUNT(DISTINCT l.id)::BIGINT  AS likes_count,
    COUNT(DISTINCT c.id)::BIGINT  AS comments_count,
    BOOL_OR(l.user_id = requesting_user_id) AS is_liked_by_me
  FROM study_logs sl
  INNER JOIN profiles p ON p.id = sl.user_id
  LEFT  JOIN subjects s ON s.id = sl.subject_id
  LEFT  JOIN likes    l ON l.session_id = sl.id
  LEFT  JOIN comments c ON c.session_id = sl.id
  WHERE
    sl.user_id = requesting_user_id
    OR sl.user_id IN (
      SELECT following_id
        FROM follows
       WHERE follower_id = requesting_user_id
    )
  GROUP BY
    sl.id,
    sl.user_id,
    sl.session_id,
    sl.subject_id,
    sl.duration_minutes,
    sl.tasks_completed,
    sl.notes,
    sl.logged_at,
    sl.created_at,
    sl.updated_at,
    p.username,
    p.display_name,
    p.avatar_url,
    s.name,
    s.category
  ORDER BY sl.logged_at DESC
  LIMIT  page_limit
  OFFSET page_offset;
$$;

GRANT EXECUTE ON FUNCTION get_feed_for_user(UUID, INTEGER, INTEGER) TO authenticated;

-- ============================================================
-- 3. get_active_session_count
-- ============================================================
CREATE OR REPLACE FUNCTION get_active_session_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
    FROM study_sessions
   WHERE user_id = user_uuid
     AND status  = 'active';
$$;

GRANT EXECUTE ON FUNCTION get_active_session_count(UUID) TO authenticated;

-- ============================================================
-- 4. get_ai_usage_count
-- ============================================================
CREATE OR REPLACE FUNCTION get_ai_usage_count(
  user_uuid  UUID,
  hours_back INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
    FROM ai_usage_tracking
   WHERE user_id    = user_uuid
     AND created_at > NOW() - (hours_back || ' hours')::INTERVAL;
$$;

GRANT EXECUTE ON FUNCTION get_ai_usage_count(UUID, INTEGER) TO authenticated;

-- ============================================================
-- 5. get_ai_plans_today
-- ============================================================
CREATE OR REPLACE FUNCTION get_ai_plans_today(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
    FROM ai_study_plans
   WHERE user_id      = user_uuid
     AND generated_at = CURRENT_DATE;
$$;

GRANT EXECUTE ON FUNCTION get_ai_plans_today(UUID) TO authenticated;
