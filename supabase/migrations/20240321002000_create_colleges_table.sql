-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    common_app_id TEXT NOT NULL,
    country TEXT NOT NULL,
    state TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(common_app_id)
);

-- Create index on common_app_id
CREATE INDEX idx_colleges_common_app_id ON colleges(common_app_id);

-- Create index for name search
CREATE INDEX idx_colleges_name ON colleges(name); 