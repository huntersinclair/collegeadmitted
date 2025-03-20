-- Update applications table with new fields and constraints
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS languages_count INTEGER,
  ADD COLUMN IF NOT EXISTS graduated_secondary BOOLEAN,
  ADD COLUMN IF NOT EXISTS progression_options TEXT[],
  ADD COLUMN IF NOT EXISTS rank_weighting VARCHAR(20) CHECK (rank_weighting IN ('weighted', 'unweighted')),
  ADD COLUMN IF NOT EXISTS gpa_weighting VARCHAR(20) CHECK (gpa_weighting IN ('weighted', 'unweighted'));

-- Add comments for documentation
COMMENT ON COLUMN applications.languages_count IS 'Number of languages the applicant is proficient in';
COMMENT ON COLUMN applications.graduated_secondary IS 'Whether the applicant graduated from secondary/high school';
COMMENT ON COLUMN applications.progression_options IS 'Array of progression options that affected the applicant''s secondary education';
COMMENT ON COLUMN applications.rank_weighting IS 'Whether the class rank is weighted or unweighted';
COMMENT ON COLUMN applications.gpa_weighting IS 'Whether the GPA is weighted or unweighted'; 