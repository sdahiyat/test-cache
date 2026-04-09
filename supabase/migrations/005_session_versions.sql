-- Create session_versions table if it doesn't exist
-- This supports session versioning on edits (Task 4)

CREATE TABLE IF NOT EXISTS public.session_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by session
CREATE INDEX IF NOT EXISTS idx_session_versions_session_id
  ON public.session_versions(session_id);

CREATE INDEX IF NOT EXISTS idx_session_versions_session_version
  ON public.session_versions(session_id, version_number);

-- Enable RLS
ALTER TABLE public.session_versions ENABLE ROW LEVEL SECURITY;

-- Users can only see versions of their own sessions
CREATE POLICY "Users can view their own session versions"
  ON public.session_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_sessions ss
      WHERE ss.id = session_versions.session_id
        AND ss.user_id = auth.uid()
    )
  );

-- Users can insert versions for their own sessions
CREATE POLICY "Users can create versions for their own sessions"
  ON public.session_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.study_sessions ss
      WHERE ss.id = session_versions.session_id
        AND ss.user_id = auth.uid()
    )
  );

-- Service role can do anything (needed for server-side operations)
CREATE POLICY "Service role has full access to session_versions"
  ON public.session_versions
  FOR ALL
  USING (auth.role() = 'service_role');
