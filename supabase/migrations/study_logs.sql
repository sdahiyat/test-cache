-- Create study_logs table
CREATE TABLE IF NOT EXISTS study_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  tasks_completed integer NOT NULL DEFAULT 0 CHECK (tasks_completed >= 0),
  notes text DEFAULT '',
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient user queries sorted by date
CREATE INDEX IF NOT EXISTS study_logs_user_id_logged_at_idx
  ON study_logs (user_id, logged_at DESC);

-- Enable Row Level Security
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own study logs"
  ON study_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study logs"
  ON study_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study logs"
  ON study_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study logs"
  ON study_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at on row update
CREATE OR REPLACE FUNCTION update_study_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER study_logs_updated_at
  BEFORE UPDATE ON study_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_study_logs_updated_at();

-- Function to upsert subject into subjects table on study log insert
CREATE OR REPLACE FUNCTION upsert_subject_from_study_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subjects (name)
  VALUES (NEW.subject)
  ON CONFLICT (name) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Do not fail the study log insert if subjects upsert fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER study_logs_upsert_subject
  AFTER INSERT ON study_logs
  FOR EACH ROW
  EXECUTE FUNCTION upsert_subject_from_study_log();
