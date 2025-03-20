-- Drop existing tables if they exist
DROP TABLE IF EXISTS application_files;
DROP TABLE IF EXISTS application_additional_info;
DROP TABLE IF EXISTS application_essays;
DROP TABLE IF EXISTS application_activities;
DROP TABLE IF EXISTS application_test_scores;
DROP TABLE IF EXISTS application_honors;
DROP TABLE IF EXISTS application_courses;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS university_programs;
DROP TABLE IF EXISTS universities;

-- Drop enum types if they exist
DROP TYPE IF EXISTS application_status;
DROP TYPE IF EXISTS gpa_scale;
DROP TYPE IF EXISTS course_subject;
DROP TYPE IF EXISTS course_level;
DROP TYPE IF EXISTS activity_type;
DROP TYPE IF EXISTS activity_timing;
DROP TYPE IF EXISTS degree_type;

-- Create enum types for various selections
CREATE TYPE application_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');
CREATE TYPE gpa_scale AS ENUM ('4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '100', 'none');
CREATE TYPE course_subject AS ENUM (
    'Pre-Algebra', 'Algebra', 'Geometry', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'Math (Other)',
    'Biology', 'Chemistry', 'Physics', 'Earth/Environmental Science', 'Science (Other)',
    'English', 'History/Social Science', 'Foreign/World Language', 'Physical Education/Health',
    'Art (Visual or Performing)', 'Computer Science', 'Religion', 'Other/Elective'
);

CREATE TYPE course_level AS ENUM (
    'Regular/Standard', 'Accelerated', 'Advanced', 'Advanced Placement (AP)',
    'AS/A-level/International A-level', 'Cambridge AICE', 'College Prep', 'Dual Enrollment',
    'Enriched', 'GCSE', 'IGCSE', 'Gifted', 'High Honors', 'Honors', 'Intensive',
    'International Baccalaureate (IB)', 'Pre-IB', 'Regents', 'N/A'
);

CREATE TYPE activity_type AS ENUM (
    'Academic', 'Art', 'Athletics: Club', 'Athletics: JV/Varsity', 'Career Oriented',
    'Community Service (Volunteer)', 'Computer/Technology', 'Cultural', 'Dance',
    'Debate/Speech', 'Environmental', 'Family Responsibilities', 'Foreign Exchange',
    'Foreign Language', 'Internship', 'Journalism/Publication', 'Junior R.O.T.C.',
    'LGBT', 'Music: Instrumental', 'Music: Vocal', 'Religious', 'Research', 'Robotics',
    'School Spirit', 'Science/Math', 'Social Justice', 'Student Govt./Politics',
    'Theater/Drama', 'Work (Paid)', 'Other Club/Activity'
);

CREATE TYPE activity_timing AS ENUM ('during_school', 'during_break', 'all_year');
CREATE TYPE degree_type AS ENUM (
    'Associate''s (AA, AS)', 'Bachelor''s (BA, BS)', 'Master''s (MA, MS)',
    'Business (MBA, MAcc)', 'Law (JD, LLM)', 'Medicine (MD, DO, DVM, DDS)',
    'Doctorate (PhD, EdD, etc)', 'Other', 'Undecided'
);

-- Create universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    common_app_id TEXT,
    accepts_common_app BOOLEAN DEFAULT false,
    accepts_super_score BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name)
);

-- Create university_programs table
CREATE TABLE university_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_type degree_type NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(university_id, name, degree_type)
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    program_id UUID REFERENCES university_programs(id),
    status application_status DEFAULT 'draft',
    languages_count INTEGER,
    graduated_secondary BOOLEAN,
    progression_changes TEXT[],
    colleges_attended TEXT[],
    class_size INTEGER,
    class_rank INTEGER,
    class_rank_percentile INTEGER,
    rank_weighting TEXT,
    gpa_scale gpa_scale,
    cumulative_gpa DECIMAL(4,2),
    gpa_weighting TEXT,
    highest_degree_intended degree_type,
    career_interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create courses table for current/recent year courses
CREATE TABLE application_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    subject course_subject NOT NULL,
    name TEXT NOT NULL,
    course_level course_level NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create honors table
CREATE TABLE application_honors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create test scores table
CREATE TABLE application_test_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    subject TEXT,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create activities table
CREATE TABLE application_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    position_description TEXT,
    organization_name TEXT,
    description TEXT,
    timing activity_timing NOT NULL,
    hours_per_week INTEGER,
    hours_per_year INTEGER,
    plan_to_participate BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create essays table
CREATE TABLE application_essays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    is_main_essay BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create additional information table
CREATE TABLE application_additional_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create uploaded files table
CREATE TABLE application_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    processed_text TEXT,
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_honors ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_additional_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;

-- Universities and programs are readable by all authenticated users
CREATE POLICY "Universities are viewable by all users"
    ON universities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "University programs are viewable by all users"
    ON university_programs FOR SELECT
    TO authenticated
    USING (true);

-- Applications and related tables are only accessible by the owner
CREATE POLICY "Users can manage their own applications"
    ON applications FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own application courses"
    ON application_courses FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_courses.application_id
        AND applications.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own application honors"
    ON application_honors FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_honors.application_id
        AND applications.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own test scores"
    ON application_test_scores FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_test_scores.application_id
        AND applications.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own activities"
    ON application_activities FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_activities.application_id
        AND applications.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own essays"
    ON application_essays FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_essays.application_id
        AND applications.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own additional info"
    ON application_additional_info FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_additional_info.application_id
        AND applications.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own files"
    ON application_files FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_files.application_id
        AND applications.user_id = auth.uid()
    ));

-- Create indexes for better query performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_application_courses_application_id ON application_courses(application_id);
CREATE INDEX idx_application_honors_application_id ON application_honors(application_id);
CREATE INDEX idx_application_test_scores_application_id ON application_test_scores(application_id);
CREATE INDEX idx_application_activities_application_id ON application_activities(application_id);
CREATE INDEX idx_application_essays_application_id ON application_essays(application_id);
CREATE INDEX idx_application_additional_info_application_id ON application_additional_info(application_id);
CREATE INDEX idx_application_files_application_id ON application_files(application_id); 