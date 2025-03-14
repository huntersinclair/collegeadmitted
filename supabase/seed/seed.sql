-- Seed data for development environment
-- Insert a test user
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test authentication for the user (password is 'password' hashed)
INSERT INTO public.user_auth (id, user_id, auth_type, auth_identifier, auth_secret, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'email', 'test@example.com', '$2a$10$EHKQw.BeZHZJPBrZtFw0R.PPsWj1kQKo2s8n/aAl9P89g17QnIvJe', NOW(), NOW())
ON CONFLICT (auth_type, auth_identifier) DO NOTHING; 