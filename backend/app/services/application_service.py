from typing import List, Optional, Dict, Any
from uuid import UUID
import json
import httpx
from datetime import datetime

from app.core.config import get_settings
from app.core.supabase import supabase_client
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, CourseCreate, HonorCreate,
    TestScoreCreate, ActivityCreate, EssayCreate, AdditionalInfoCreate,
    FileCreate, FileUpdate, ApplicationStatus
)

settings = get_settings()

class ApplicationService:
    """Service for handling college application operations."""
    
    @staticmethod
    async def create_application(user_id: UUID, data: ApplicationCreate) -> dict:
        """Create a new college application."""
        try:
            application_data = {
                "user_id": str(user_id),
                "university_id": str(data.university_id) if data.university_id else None,
                "university_major_id": str(data.university_major_id) if data.university_major_id else None,
                "status": ApplicationStatus.draft.value,
                **data.model_dump(exclude={'university_id', 'university_major_id'})
            }
            
            response = supabase_client.table('applications').insert(application_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error creating application: {e}")
            raise
    
    @staticmethod
    async def get_application(user_id: UUID, application_id: UUID) -> Optional[dict]:
        """Get a specific application with all its related data."""
        try:
            # Get the main application
            response = supabase_client.from_('applications').select("""
                *,
                courses:application_courses(*),
                honors:application_honors(*),
                test_scores:application_test_scores(*),
                activities:application_activities(*),
                essays:application_essays(*),
                additional_info:application_additional_info(*),
                files:application_files(*)
            """).eq('id', str(application_id)).eq('user_id', str(user_id)).single().execute()
            
            return response.data if response.data else None
            
        except Exception as e:
            print(f"Error fetching application: {e}")
            raise
    
    @staticmethod
    async def list_applications(user_id: UUID) -> List[dict]:
        """List all applications for a user with summary information."""
        try:
            response = supabase_client.from_('applications').select("""
                *,
                university:universities(name),
                program:university_majors(name, degree_type)
            """).eq('user_id', str(user_id)).execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error listing applications: {e}")
            raise
    
    @staticmethod
    async def update_application(user_id: UUID, application_id: UUID, data: ApplicationUpdate) -> Optional[dict]:
        """Update an application's main information."""
        try:
            response = supabase_client.from_('applications').update(
                data.model_dump(exclude_unset=True)
            ).eq('id', str(application_id)).eq('user_id', str(user_id)).execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error updating application: {e}")
            raise
    
    @staticmethod
    async def delete_application(user_id: UUID, application_id: UUID) -> bool:
        """Delete an application and all its related data."""
        try:
            response = supabase_client.from_('applications').delete().eq('id', str(application_id)).eq('user_id', str(user_id)).execute()
            return bool(response.data)
            
        except Exception as e:
            print(f"Error deleting application: {e}")
            raise
    
    @staticmethod
    async def add_course(application_id: UUID, data: CourseCreate) -> dict:
        """Add a course to an application."""
        try:
            course_data = {
                "application_id": str(application_id),
                **data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_courses').insert(course_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding course: {e}")
            raise
    
    @staticmethod
    async def add_honor(application_id: UUID, data: HonorCreate) -> dict:
        """Add an honor to an application."""
        try:
            honor_data = {
                "application_id": str(application_id),
                **data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_honors').insert(honor_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding honor: {e}")
            raise
    
    @staticmethod
    async def add_test_score(application_id: UUID, data: TestScoreCreate) -> dict:
        """Add a test score to an application."""
        try:
            score_data = {
                "application_id": str(application_id),
                **data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_test_scores').insert(score_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding test score: {e}")
            raise
    
    @staticmethod
    async def add_activity(application_id: UUID, data: ActivityCreate) -> dict:
        """Add an activity to an application."""
        try:
            activity_data = {
                "application_id": str(application_id),
                **data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_activities').insert(activity_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding activity: {e}")
            raise
    
    @staticmethod
    async def add_essay(application_id: UUID, data: EssayCreate) -> dict:
        """Add an essay to an application."""
        try:
            essay_data = {
                "application_id": str(application_id),
                **data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_essays').insert(essay_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding essay: {e}")
            raise
    
    @staticmethod
    async def add_additional_info(application_id: UUID, data: AdditionalInfoCreate) -> dict:
        """Add additional information to an application."""
        try:
            info_data = {
                "application_id": str(application_id),
                **data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_additional_info').insert(info_data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding additional info: {e}")
            raise
    
    @staticmethod
    async def process_file(application_id: UUID, file_data: FileCreate) -> dict:
        """Process an uploaded file and store its information."""
        try:
            # First, create a record for the file
            file_record = {
                "application_id": str(application_id),
                **file_data.model_dump(exclude={'application_id'})
            }
            
            response = supabase_client.table('application_files').insert(file_record).execute()
            file_entry = response.data[0] if response.data else None
            
            if not file_entry:
                raise Exception("Failed to create file record")
            
            # We'll need the Mistral API key for OCR processing
            if not settings.MISTRAL_API_KEY:
                raise Exception("Mistral API key not configured")
            
            # Process the file with Mistral API for OCR
            # Note: This is a placeholder for the actual implementation
            # You'll need to implement the actual file processing logic
            headers = {
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            }
            
            # Update the file record with the processed text
            update_data = {
                "processed_text": "Placeholder for processed text",  # Replace with actual OCR result
                "processing_status": "completed"
            }
            
            update_response = supabase_client.table('application_files').update(
                update_data
            ).eq('id', file_entry['id']).execute()
            
            return update_response.data[0] if update_response.data else None
            
        except Exception as e:
            print(f"Error processing file: {e}")
            # Update the file record with error status
            if file_entry:
                supabase_client.table('application_files').update({
                    "processing_status": "error"
                }).eq('id', file_entry['id']).execute()
            raise
    
    @staticmethod
    async def get_universities() -> List[dict]:
        """Get list of universities."""
        try:
            response = supabase_client.from_('universities').select('*').execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error fetching universities: {e}")
            raise
    
    @staticmethod
    async def get_university_programs(university_id: UUID) -> List[dict]:
        """Get list of programs for a university."""
        try:
            response = supabase_client.from_('university_programs').select('*').eq('university_id', str(university_id)).execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error fetching university programs: {e}")
            raise
    
    @staticmethod
    async def duplicate_application(
        user_id: UUID,
        application_id: UUID,
        new_university_id: UUID,
        new_university_major_id: UUID
    ) -> dict:
        """Create a new application by duplicating an existing one."""
        try:
            # Get the original application with all its data
            original = await ApplicationService.get_application(user_id, application_id)
            if not original:
                raise Exception("Original application not found")
            
            # Create new application with basic data
            application_data = {
                **original,
                "university_id": new_university_id,
                "university_major_id": new_university_major_id,
            }
            
            new_application = await ApplicationService.create_application(user_id, ApplicationCreate(**application_data))
            
            # Copy courses
            for course in original.get('courses', []):
                await ApplicationService.add_course(
                    new_application['id'],
                    CourseCreate(**{**course, 'application_id': new_application['id']})
                )
            
            # Copy honors
            for honor in original.get('honors', []):
                await ApplicationService.add_honor(
                    new_application['id'],
                    HonorCreate(**{**honor, 'application_id': new_application['id']})
                )
            
            # Copy test scores
            for score in original.get('test_scores', []):
                await ApplicationService.add_test_score(
                    new_application['id'],
                    TestScoreCreate(**{**score, 'application_id': new_application['id']})
                )
            
            # Copy activities
            for activity in original.get('activities', []):
                await ApplicationService.add_activity(
                    new_application['id'],
                    ActivityCreate(**{**activity, 'application_id': new_application['id']})
                )
            
            # Copy main essay if it exists
            main_essay = next((essay for essay in original.get('essays', []) if essay.get('is_main_essay')), None)
            if main_essay:
                await ApplicationService.add_essay(
                    new_application['id'],
                    EssayCreate(**{**main_essay, 'application_id': new_application['id']})
                )
            
            return new_application
            
        except Exception as e:
            print(f"Error duplicating application: {e}")
            raise 