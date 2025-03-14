-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for users email
CREATE INDEX IF NOT EXISTS ix_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS ix_users_id ON public.users (id);

-- Create user_auth table
CREATE TABLE IF NOT EXISTS public.user_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    auth_type VARCHAR NOT NULL,
    auth_identifier VARCHAR NOT NULL,
    auth_secret VARCHAR NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_auth_method UNIQUE (auth_type, auth_identifier)
);

-- Create index for user_auth id
CREATE INDEX IF NOT EXISTS ix_user_auth_id ON public.user_auth (id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth ENABLE ROW LEVEL SECURITY;

-- Create Policies for Users table
CREATE POLICY "Users are viewable by authenticated users" 
    ON public.users FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Create Policies for User Auth table
CREATE POLICY "User_auth records are viewable by authenticated users" 
    ON public.user_auth FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "User_auth can be updated by owner" 
    ON public.user_auth FOR UPDATE 
    USING (auth.uid() = user_id); 