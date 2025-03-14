from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List

from app.api.deps import get_current_user
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserLoginRequest, TokenResponse
from app.services.user_service import UserService

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate) -> Any:
    """Register a new user."""
    user = UserService.create_user(user_data)
    
    return {
        "user_id": user['id'],
        "token": UserService.create_access_token_for_user(user['id']),
        "token_type": "bearer"
    }


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLoginRequest) -> Any:
    """Login a user."""
    user = UserService.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "user_id": user['id'],
        "token": UserService.create_access_token_for_user(user['id']),
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: str = Depends(get_current_user)) -> Any:
    """Get current user information."""
    user = UserService.get_user_by_id(current_user)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Query Supabase Auth for email and metadata
    auth_user = UserService.get_auth_user_by_id(current_user)
    
    # Combine data from profile and auth
    return {
        "id": user.get("id", ""),
        "email": auth_user.get("email", ""),
        "name": user.get("display_name", auth_user.get("user_metadata", {}).get("name", "")),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "avatar_url": user.get("avatar_url", ""),
        "bio": user.get("bio", ""),
        "school": user.get("school", ""),
        "graduation_year": user.get("graduation_year"),
        "major": user.get("major", ""),
    }


@router.patch("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: str = Depends(get_current_user)
) -> Any:
    """Update current user information."""
    user = UserService.get_user_by_id(current_user)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prepare update data
    update_data = user_update.dict(exclude_unset=True)
    
    # Update the profile
    updated_user = UserService.update_user_profile(current_user, update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile",
        )
    
    # Get auth user data
    auth_user = UserService.get_auth_user_by_id(current_user)
    
    # Return combined data
    return {
        "id": updated_user.get("id", ""),
        "email": auth_user.get("email", ""),
        "name": updated_user.get("display_name", auth_user.get("user_metadata", {}).get("name", "")),
        "first_name": updated_user.get("first_name", ""),
        "last_name": updated_user.get("last_name", ""),
        "avatar_url": updated_user.get("avatar_url", ""),
        "bio": updated_user.get("bio", ""),
        "school": updated_user.get("school", ""),
        "graduation_year": updated_user.get("graduation_year"),
        "major": updated_user.get("major", ""),
    } 