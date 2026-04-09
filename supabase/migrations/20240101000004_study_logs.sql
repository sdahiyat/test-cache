CREATE TABLE study_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (char_length(subject) <= 100),
  tasks_completed integer NOT NULL DEFAULT 0 CHECK (tasks_completed >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  notes text CHECK (char_length(notes) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX study_logs_user_id_idx ON study_logs(user_id);
CREATE INDEX study_logs_created_at_idx ON study_logs(created_at DESC);

ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs" ON study_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON study_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON study_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON study_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_study_logs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER study_logs_updated_at
  BEFORE UPDATE ON study_logs
  FOR EACH ROW EXECUTE FUNCTION update_study_logs_updated_at();
