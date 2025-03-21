from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, constr
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    draft = 'draft'
    in_progress = 'in_progress'
    completed = 'completed'
    submitted = 'submitted'


class GPAScale(str, Enum):
    FOUR = '4'
    FIVE = '5'
    SIX = '6'
    SEVEN = '7'
    EIGHT = '8'
    NINE = '9'
    TEN = '10'
    ELEVEN = '11'
    TWELVE = '12'
    THIRTEEN = '13'
    FOURTEEN = '14'
    FIFTEEN = '15'
    SIXTEEN = '16'
    SEVENTEEN = '17'
    EIGHTEEN = '18'
    NINETEEN = '19'
    TWENTY = '20'
    HUNDRED = '100'
    NONE = 'none'


class CourseSubject(str, Enum):
    PRE_ALGEBRA = 'Pre-Algebra'
    ALGEBRA = 'Algebra'
    GEOMETRY = 'Geometry'
    TRIGONOMETRY = 'Trigonometry'
    PRE_CALCULUS = 'Pre-Calculus'
    CALCULUS = 'Calculus'
    MATH_OTHER = 'Math (Other)'
    BIOLOGY = 'Biology'
    CHEMISTRY = 'Chemistry'
    PHYSICS = 'Physics'
    EARTH_SCIENCE = 'Earth/Environmental Science'
    SCIENCE_OTHER = 'Science (Other)'
    ENGLISH = 'English'
    HISTORY = 'History/Social Science'
    FOREIGN_LANGUAGE = 'Foreign/World Language'
    PE_HEALTH = 'Physical Education/Health'
    ART = 'Art (Visual or Performing)'
    COMPUTER_SCIENCE = 'Computer Science'
    RELIGION = 'Religion'
    OTHER = 'Other/Elective'


class CourseLevel(str, Enum):
    REGULAR = 'Regular/Standard'
    ACCELERATED = 'Accelerated'
    ADVANCED = 'Advanced'
    AP = 'Advanced Placement (AP)'
    AS_LEVEL = 'AS/A-level/International A-level'
    CAMBRIDGE = 'Cambridge AICE'
    COLLEGE_PREP = 'College Prep'
    DUAL_ENROLLMENT = 'Dual Enrollment'
    ENRICHED = 'Enriched'
    GCSE = 'GCSE'
    IGCSE = 'IGCSE'
    GIFTED = 'Gifted'
    HIGH_HONORS = 'High Honors'
    HONORS = 'Honors'
    INTENSIVE = 'Intensive'
    IB = 'International Baccalaureate (IB)'
    PRE_IB = 'Pre-IB'
    REGENTS = 'Regents'
    NA = 'N/A'


class ActivityType(str, Enum):
    ACADEMIC = 'Academic'
    ART = 'Art'
    ATHLETICS_CLUB = 'Athletics: Club'
    ATHLETICS_VARSITY = 'Athletics: JV/Varsity'
    CAREER = 'Career Oriented'
    COMMUNITY_SERVICE = 'Community Service (Volunteer)'
    COMPUTER = 'Computer/Technology'
    CULTURAL = 'Cultural'
    DANCE = 'Dance'
    DEBATE = 'Debate/Speech'
    ENVIRONMENTAL = 'Environmental'
    FAMILY = 'Family Responsibilities'
    FOREIGN_EXCHANGE = 'Foreign Exchange'
    FOREIGN_LANGUAGE = 'Foreign Language'
    INTERNSHIP = 'Internship'
    JOURNALISM = 'Journalism/Publication'
    JROTC = 'Junior R.O.T.C.'
    LGBT = 'LGBT'
    MUSIC_INSTRUMENTAL = 'Music: Instrumental'
    MUSIC_VOCAL = 'Music: Vocal'
    RELIGIOUS = 'Religious'
    RESEARCH = 'Research'
    ROBOTICS = 'Robotics'
    SCHOOL_SPIRIT = 'School Spirit'
    SCIENCE_MATH = 'Science/Math'
    SOCIAL_JUSTICE = 'Social Justice'
    STUDENT_GOVT = 'Student Govt./Politics'
    THEATER = 'Theater/Drama'
    WORK = 'Work (Paid)'
    OTHER = 'Other Club/Activity'


class ActivityTiming(str, Enum):
    DURING_SCHOOL = 'during_school'
    DURING_BREAK = 'during_break'
    ALL_YEAR = 'all_year'


class DegreeType(str, Enum):
    ASSOCIATES = 'Associate''s (AA, AS)'
    BACHELORS = 'Bachelor''s (BA, BS)'
    MASTERS = 'Master''s (MA, MS)'
    BUSINESS = 'Business (MBA, MAcc)'
    LAW = 'Law (JD, LLM)'
    MEDICINE = 'Medicine (MD, DO, DVM, DDS)'
    DOCTORATE = 'Doctorate (PhD, EdD, etc)'
    OTHER = 'Other'
    UNDECIDED = 'Undecided'


# Base Models
class UniversityBase(BaseModel):
    name: str
    common_app_id: Optional[str] = None
    accepts_common_app: bool = False
    accepts_super_score: bool = False


class UniversityProgramBase(BaseModel):
    name: str
    degree_type: DegreeType
    description: Optional[str] = None


class ApplicationBase(BaseModel):
    languages_count: Optional[int] = None
    graduated_secondary: Optional[bool] = None
    progression_changes: Optional[List[str]] = None
    colleges_attended: Optional[List[str]] = None
    class_size: Optional[int] = None
    class_rank: Optional[int] = None
    class_rank_percentile: Optional[int] = None
    rank_weighting: Optional[str] = None
    gpa_scale: Optional[GPAScale] = None
    cumulative_gpa: Optional[float] = None
    gpa_weighting: Optional[str] = None
    highest_degree_intended: Optional[DegreeType] = None
    career_interest: Optional[str] = None


class CourseBase(BaseModel):
    subject: CourseSubject
    name: str
    course_level: CourseLevel


class HonorBase(BaseModel):
    title: str


class TestScoreBase(BaseModel):
    test_type: str
    subject: Optional[str] = None
    score: int


class ActivityBase(BaseModel):
    activity_type: ActivityType
    position_description: Optional[str] = None
    organization_name: Optional[str] = None
    description: Optional[str] = None
    timing: ActivityTiming
    hours_per_week: Optional[int] = None
    hours_per_year: Optional[int] = None
    plan_to_participate: bool = False


class EssayBase(BaseModel):
    prompt: str
    response: str
    word_count: int
    is_main_essay: bool = False


class AdditionalInfoBase(BaseModel):
    content: str


class FileBase(BaseModel):
    file_type: str
    original_filename: str
    processed_text: Optional[str] = None
    processing_status: str = 'pending'


# Create Request Models
class UniversityCreate(UniversityBase):
    pass


class UniversityProgramCreate(UniversityProgramBase):
    university_id: UUID


class ApplicationCreate(BaseModel):
    user_id: UUID
    university_id: Optional[UUID] = None
    university_major_id: Optional[UUID] = None
    status: ApplicationStatus = ApplicationStatus.draft


class CourseCreate(CourseBase):
    application_id: UUID


class HonorCreate(HonorBase):
    application_id: UUID


class TestScoreCreate(TestScoreBase):
    application_id: UUID


class ActivityCreate(ActivityBase):
    application_id: UUID


class EssayCreate(EssayBase):
    application_id: UUID


class AdditionalInfoCreate(AdditionalInfoBase):
    application_id: UUID


class FileCreate(FileBase):
    application_id: UUID


# Response Models
class University(UniversityBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UniversityProgram(UniversityProgramBase):
    id: UUID
    university_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Course(CourseBase):
    id: UUID
    application_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Honor(HonorBase):
    id: UUID
    application_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TestScore(TestScoreBase):
    id: UUID
    application_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Activity(ActivityBase):
    id: UUID
    application_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Essay(EssayBase):
    id: UUID
    application_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdditionalInfo(AdditionalInfoBase):
    id: UUID
    application_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class File(FileBase):
    id: UUID
    application_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Application(ApplicationBase):
    id: UUID
    user_id: UUID
    university_id: UUID
    university_major_id: UUID
    status: ApplicationStatus
    courses: List[Course] = []
    honors: List[Honor] = []
    test_scores: List[TestScore] = []
    activities: List[Activity] = []
    essays: List[Essay] = []
    additional_info: Optional[AdditionalInfo] = None
    files: List[File] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Update Models
class UniversityUpdate(UniversityBase):
    pass


class UniversityProgramUpdate(UniversityProgramBase):
    pass


class ApplicationUpdate(BaseModel):
    university_id: Optional[UUID] = None
    university_major_id: Optional[UUID] = None
    status: Optional[ApplicationStatus] = None


class EssayUpdate(BaseModel):
    prompt: Optional[str] = None
    response: Optional[str] = None
    word_count: Optional[int] = None
    is_main_essay: Optional[bool] = None


class FileUpdate(BaseModel):
    processed_text: Optional[str] = None
    processing_status: Optional[str] = None 