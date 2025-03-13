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
class UserResponse(UserBase):
    """Schema for user information in responses."""
    id: UUID
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    user_id: UUID
    token: str
    token_type: str = "bearer"


# Login Request Schemas
class UserLogin(BaseModel):
    """Schema for user login with email/password."""
    email: EmailStr
    password: str


# Profile Update Schema
class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    
    class Config:
        from_attributes = True 