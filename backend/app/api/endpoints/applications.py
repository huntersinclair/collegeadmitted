from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from uuid import UUID

from app.core.supabase import get_supabase_client
from app.schemas.application import (
    Application, ApplicationCreate, ApplicationUpdate,
    CourseCreate, HonorCreate, TestScoreCreate, ActivityCreate,
    EssayCreate, AdditionalInfoCreate, FileCreate,
    University, UniversityProgram
)
from app.services.application_service import ApplicationService

router = APIRouter()

async def get_current_user():
    """Get the current user from Supabase."""
    supabase = get_supabase_client()
    try:
        user = supabase.auth.get_user()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

@router.post("/applications", response_model=Application, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
) -> Application:
    """Create a new college application."""
    try:
        application = await ApplicationService.create_application(current_user["id"], data)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create application"
            )
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/applications", response_model=List[Application])
async def list_applications(
    current_user: dict = Depends(get_current_user)
) -> List[Application]:
    """List all applications for the current user."""
    try:
        return await ApplicationService.list_applications(current_user["id"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/applications/{application_id}", response_model=Application)
async def get_application(
    application_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> Application:
    """Get a specific application with all its data."""
    try:
        application = await ApplicationService.get_application(current_user["id"], application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/applications/{application_id}", response_model=Application)
async def update_application(
    application_id: UUID,
    data: ApplicationUpdate,
    current_user: dict = Depends(get_current_user)
) -> Application:
    """Update an application's main information."""
    try:
        application = await ApplicationService.update_application(current_user["id"], application_id, data)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> None:
    """Delete an application and all its related data."""
    try:
        success = await ApplicationService.delete_application(current_user["id"], application_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/courses", response_model=dict)
async def add_course(
    application_id: UUID,
    data: CourseCreate,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Add a course to an application."""
    try:
        return await ApplicationService.add_course(application_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/honors", response_model=dict)
async def add_honor(
    application_id: UUID,
    data: HonorCreate,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Add an honor to an application."""
    try:
        return await ApplicationService.add_honor(application_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/test-scores", response_model=dict)
async def add_test_score(
    application_id: UUID,
    data: TestScoreCreate,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Add a test score to an application."""
    try:
        return await ApplicationService.add_test_score(application_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/activities", response_model=dict)
async def add_activity(
    application_id: UUID,
    data: ActivityCreate,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Add an activity to an application."""
    try:
        return await ApplicationService.add_activity(application_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/essays", response_model=dict)
async def add_essay(
    application_id: UUID,
    data: EssayCreate,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Add an essay to an application."""
    try:
        return await ApplicationService.add_essay(application_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/additional-info", response_model=dict)
async def add_additional_info(
    application_id: UUID,
    data: AdditionalInfoCreate,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Add additional information to an application."""
    try:
        return await ApplicationService.add_additional_info(application_id, data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/files", response_model=dict)
async def upload_file(
    application_id: UUID,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Upload and process a file for an application."""
    try:
        file_data = FileCreate(
            file_type=file.content_type,
            original_filename=file.filename
        )
        return await ApplicationService.process_file(application_id, file_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/universities", response_model=List[University])
async def list_universities(
    current_user: dict = Depends(get_current_user)
) -> List[University]:
    """Get list of universities."""
    try:
        return await ApplicationService.get_universities()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/universities/{university_id}/programs", response_model=List[UniversityProgram])
async def list_university_programs(
    university_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> List[UniversityProgram]:
    """Get list of programs for a university."""
    try:
        return await ApplicationService.get_university_programs(university_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/applications/{application_id}/duplicate", response_model=Application)
async def duplicate_application(
    application_id: UUID,
    new_university_id: UUID,
    new_university_major_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> Application:
    """Create a new application by duplicating an existing one."""
    try:
        return await ApplicationService.duplicate_application(
            current_user["id"],
            application_id,
            new_university_id,
            new_university_major_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 