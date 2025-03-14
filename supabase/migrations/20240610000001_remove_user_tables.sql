-- Drop user_auth table if it exists
DROP TABLE IF EXISTS public.user_auth;

-- Drop user table if it exists
DROP TABLE IF EXISTS public.users;

-- Make sure the profiles table fields match the code
ALTER TABLE public.profiles
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL,
  ALTER COLUMN display_name DROP NOT NULL,
  ALTER COLUMN avatar_url DROP NOT NULL,
  ALTER COLUMN bio DROP NOT NULL,
  ALTER COLUMN school DROP NOT NULL,
  ALTER COLUMN graduation_year DROP NOT NULL,
  ALTER COLUMN major DROP NOT NULL;

-- Add display_name index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Make sure we have default values for created_at and updated_at
ALTER TABLE public.profiles
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW(); 