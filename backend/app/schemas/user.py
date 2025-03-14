from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# Base User Schemas
class UserBase(BaseModel):
    """Base schema for user data."""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for creating a new user with local authentication."""
    password: str = Field(..., min_length=8)


class UserAuth(BaseModel):
    """Schema for user authentication information."""
    user_id: UUID
    auth_type: str
    auth_identifier: str


# Response Schemas
class UserResponse(BaseModel):
    """Schema for user information in responses."""
    id: str
    email: EmailStr
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[int] = None
    major: Optional[str] = None
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    user_id: str
    token: str
    token_type: str = "bearer"


# Login Request Schemas
class UserLoginRequest(BaseModel):
    """Schema for user login with email/password."""
    email: EmailStr
    password: str


# Profile Update Schema
class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[int] = None
    major: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True 