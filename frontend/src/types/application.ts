export type ApplicationStatus = 'draft' | 'in_progress' | 'completed' | 'submitted';
export type GPAScale = '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '100' | 'none';

export interface Course {
  id?: string;
  subject: CourseSubject;
  level: CourseLevel;
  grade: string;
  final_grade: string;
  in_progress: boolean;
}

export interface University {
  id: string;
  name: string;
  country: string;
  state?: string;
  city: string;
  website: string;
  created_at?: string;
}

export interface UniversityProgram {
  id: string;
  university_id: string;
  choice_label: string;
  choice_value_id: number;
  member_export_code?: string;
  major_group?: string;
  created_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  university_id?: string;
  program_id?: string;
  status: ApplicationStatus;
  highest_degree_intended?: DegreeType;
  career_interest?: string;
  gpa?: number;
  gpa_scale?: GPAScale;
  sat_math?: number;
  sat_reading_writing?: number;
  act_composite?: number;
  resume_text?: string;
  created_at?: string;
  updated_at?: string;
  languages_count?: number;
  graduated_secondary?: boolean;
  progression_options?: string[];
  colleges_attended?: string[];
  class_size?: number;
  class_rank?: number;
  class_rank_percentile?: number;
  rank_weighting?: 'weighted' | 'unweighted';
  cumulative_gpa?: number;
  gpa_weighting?: 'weighted' | 'unweighted';
}

export type ActivityType = 
  | 'academic'
  | 'art'
  | 'athletics'
  | 'career_oriented'
  | 'community_service'
  | 'cultural'
  | 'dance'
  | 'debate_speech'
  | 'environmental'
  | 'family_responsibilities'
  | 'journalism_publication'
  | 'leadership'
  | 'music'
  | 'religious'
  | 'research'
  | 'robotics'
  | 'school_spirit'
  | 'science_math'
  | 'student_govt'
  | 'theater_drama'
  | 'work_paid'
  | 'other';

export type ActivityTiming = 'during_school' | 'during_break' | 'all_year';
export type DegreeType = 
  | "Associate's (AA, AS)" | "Bachelor's (BA, BS)" | "Master's (MA, MS)"
  | 'Business (MBA, MAcc)' | 'Law (JD, LLM)' | 'Medicine (MD, DO, DVM, DDS)'
  | 'Doctorate (PhD, EdD, etc)' | 'Other' | 'Undecided';

export interface ApplicationCourse {
  id: string;
  application_id: string;
  subject: CourseSubject;
  level: CourseLevel;
  grade: string;
  final_grade: string;
  in_progress: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationHonor {
  id: string;
  application_id: string;
  title: string;
  created_at: string;
}

export interface ApplicationTestScore {
  id: string;
  application_id: string;
  test_type: string;
  subject?: string;
  score: number;
  created_at: string;
}

export interface ApplicationActivity {
  id: string;
  application_id: string;
  activity_type: ActivityType;
  position_description?: string;
  organization_name?: string;
  description?: string;
  timing: ActivityTiming;
  hours_per_week?: number;
  hours_per_year?: number;
  plan_to_participate: boolean;
  created_at: string;
}

export interface ApplicationEssay {
  id: string;
  application_id: string;
  prompt: string;
  response: string;
  word_count: number;
  is_main_essay: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationAdditionalInfo {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationFile {
  id: string;
  application_id: string;
  file_type: string;
  original_filename: string;
  processed_text?: string;
  processing_status: string;
  created_at: string;
  updated_at: string;
}

export interface CollegeCoursework {
  id: string;
  application_id: string;
  college_id: string;
  program_type: 'dual_enrollment' | 'summer_program' | 'credit_awarded';
  earned_degree: 'AA' | 'AS' | 'BA' | 'BS' | 'None';
  created_at: string;
  updated_at: string;
}

export interface CurrentCourse {
  id: string;
  application_id: string;
  subject: CourseSubject;
  name: string;
  course_level: CourseLevel;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: string;
  name: string;
  common_app_id: string;
  country: string;
  state?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export const COURSE_SUBJECTS = [
  'Pre-Algebra',
  'Algebra',
  'Geometry',
  'Trigonometry',
  'Pre-Calculus',
  'Calculus',
  'Math (Other)',
  'Biology',
  'Chemistry',
  'Physics',
  'Earth/Environmental Science',
  'Science (Other)',
  'English',
  'History/Social Science',
  'Foreign/World Language',
  'Physical Education/Health',
  'Art (Visual or Performing)',
  'Computer Science',
  'Religion',
  'Other/Elective'
] as const;

export const COURSE_LEVELS = [
  'Regular/Standard',
  'Accelerated',
  'Advanced',
  'Advanced Placement (AP)',
  'AS/A-level/International A-level, Cambridge AICE',
  'College Prep',
  'Dual Enrollment',
  'Enriched',
  'GCSE, IGCSE',
  'Gifted',
  'High Honors',
  'Honors',
  'Intensive',
  'International Baccalaureate (IB)',
  'Pre-IB',
  'Regents',
  'N/A'
] as const;

export type CourseSubject = typeof COURSE_SUBJECTS[number];
export type CourseLevel = typeof COURSE_LEVELS[number]; 