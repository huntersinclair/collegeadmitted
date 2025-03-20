-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT word_count_check CHECK (word_count >= 0 AND word_count <= 10000)
);

-- Add RLS policies
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own essays" ON essays;

-- Allow users to manage their own essays
CREATE POLICY "Users can manage their own essays"
  ON essays
  FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at if it doesn't exist
DO $$ BEGIN
    CREATE TRIGGER set_timestamp_essays
      BEFORE UPDATE ON essays
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 