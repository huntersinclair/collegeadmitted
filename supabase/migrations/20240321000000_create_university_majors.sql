-- Create universities table if it doesn't exist
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    common_app_id INTEGER UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create university_majors table
CREATE TABLE IF NOT EXISTS university_majors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id),
    choice_label VARCHAR(255) NOT NULL,
    choice_value_id INTEGER NOT NULL,
    member_export_code VARCHAR(255),
    major_group VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(university_id, choice_value_id)
);

-- Create indexes
CREATE INDEX idx_university_majors_university_id ON university_majors(university_id);
CREATE INDEX idx_universities_common_app_id ON universities(common_app_id); 