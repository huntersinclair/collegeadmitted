-- Add city column to colleges table
ALTER TABLE colleges ADD COLUMN city TEXT;

-- Create index for city search
CREATE INDEX idx_colleges_city ON colleges(city); 