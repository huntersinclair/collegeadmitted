-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enum types for program types and earned degrees
CREATE TYPE program_type AS ENUM ('full_time', 'part_time', 'summer', 'exchange');
CREATE TYPE earned_degree AS ENUM ('yes', 'no', 'in_progress');

-- Create college_coursework table
CREATE TABLE college_coursework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES universities(id),
  program_type program_type NOT NULL,
  earned_degree earned_degree NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(application_id, college_id)
);

-- Add RLS policies for college_coursework
ALTER TABLE college_coursework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own college coursework"
  ON college_coursework
  FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Create current_courses table
CREATE TABLE current_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  name TEXT NOT NULL,
  course_level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for current_courses
ALTER TABLE current_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own current courses"
  ON current_courses
  FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp_college_coursework
  BEFORE UPDATE ON college_coursework
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_current_courses
  BEFORE UPDATE ON current_courses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp(); 