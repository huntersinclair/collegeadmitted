-- Drop the unused university_programs table
DROP TABLE IF EXISTS university_programs;

-- First, drop the existing foreign key constraint
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_program_id_fkey;

-- Rename the column
ALTER TABLE applications
RENAME COLUMN program_id TO university_major_id;

-- Add the foreign key constraint with the new column name
ALTER TABLE applications
ADD CONSTRAINT applications_university_major_id_fkey
FOREIGN KEY (university_major_id) REFERENCES university_majors(id)
ON DELETE SET NULL; 