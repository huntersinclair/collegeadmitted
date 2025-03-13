from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/user-profile", response_model=UserResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user profile.
    
    Returns:
        User profile data
    """
    return current_user


@router.put("/user-profile", response_model=UserResponse)
def update_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Update current user profile.
    
    Args:
        user_data: Data to update
        
    Returns:
        Updated user profile
    """
    updated_user = UserService.update_user(db, current_user.id, user_data)
    return updated_user 