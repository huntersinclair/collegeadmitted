-- First, drop any existing data in the activities and honors tables since we need to recreate the types
DELETE FROM activities;
DELETE FROM honors;

-- Drop and recreate the enum types
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS participation_grade CASCADE;

-- Create enum types with correct values
CREATE TYPE activity_type AS ENUM (
  'academic',
  'art',
  'athletics',
  'career_oriented',
  'community_service',
  'cultural',
  'dance',
  'debate_speech',
  'environmental',
  'family_responsibilities',
  'journalism_publication',
  'leadership',
  'music',
  'religious',
  'research',
  'robotics',
  'school_spirit',
  'science_math',
  'student_govt',
  'theater_drama',
  'work_paid',
  'other'
);

CREATE TYPE participation_grade AS ENUM (
  '9', '10', '11', '12', 'post_graduate'
);

-- Recreate the tables with the new enum types
DROP TABLE IF EXISTS activities CASCADE;
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  position_title TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  activity_type activity_type NOT NULL,
  participation_grades participation_grade[] NOT NULL,
  hours_per_week INTEGER NOT NULL,
  weeks_per_year INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT hours_per_week_check CHECK (hours_per_week > 0 AND hours_per_week <= 168),
  CONSTRAINT weeks_per_year_check CHECK (weeks_per_year > 0 AND weeks_per_year <= 52)
);

DROP TABLE IF EXISTS honors CASCADE;
CREATE TABLE honors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  honor_title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  received_grade participation_grade NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('school', 'state', 'national', 'international')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Re-enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE honors ENABLE ROW LEVEL SECURITY;

-- Recreate the policies
DROP POLICY IF EXISTS "Users can manage their own activities" ON activities;
CREATE POLICY "Users can manage their own activities"
  ON activities
  FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own honors" ON honors;
CREATE POLICY "Users can manage their own honors"
  ON honors
  FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Recreate the triggers
DROP TRIGGER IF EXISTS set_timestamp_activities ON activities;
CREATE TRIGGER set_timestamp_activities
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_honors ON honors;
CREATE TRIGGER set_timestamp_honors
  BEFORE UPDATE ON honors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp(); 