-- First, drop the existing foreign key constraint
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_program_id_fkey;

-- Add the new foreign key constraint pointing to university_majors
ALTER TABLE applications
ADD CONSTRAINT applications_program_id_fkey
FOREIGN KEY (program_id) REFERENCES university_majors(id)
ON DELETE SET NULL; 