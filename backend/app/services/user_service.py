import uuid
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.models.user import User, UserAuth
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import get_settings
from app.core.supabase import supabase_client

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for handling user operations using Supabase."""
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[dict]:
        """Get user by ID from Supabase."""
        try:
            response = supabase.table('users').select('*').eq('id', user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching user from Supabase: {e}")
            return None
            
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email from Supabase."""
        try:
            response = supabase.table('users').select('*').eq('email', email).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching user from Supabase: {e}")
            return None
    
    @staticmethod
    def create_user(user_data: UserCreate) -> dict:
        """Create a new user in Supabase Auth and store additional data in users table."""
        # First check if user already exists
        existing_user = UserService.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        try:
            # Create the user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "name": user_data.name
                    }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user in Supabase Auth"
                )
            
            # Store additional user data in the users table
            user_id = auth_response.user.id
            user_data = {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.name,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert into users table
            response = supabase.table('users').insert(user_data).execute()
            
            if not response.data:
                # Delete the auth user if we couldn't create the profile
                # This is a best effort cleanup - we don't throw if it fails
                try:
                    supabase.auth.admin.delete_user(user_id)
                except:
                    pass
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile"
                )
            
            return response.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating user: {str(e)}"
            )
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[dict]:
        """Authenticate user with email and password using Supabase Auth."""
        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not response.user:
                return None
            
            # Get the user profile from our users table
            user = UserService.get_user_by_id(response.user.id)
            return user
        except Exception:
            return None
    
    @staticmethod
    def update_user_profile(user_id: str, data: dict) -> Optional[dict]:
        """Update user profile in Supabase."""
        try:
            data["updated_at"] = datetime.utcnow().isoformat()
            response = supabase.table('users').update(data).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating user in Supabase: {e}")
            return None
            
    @staticmethod
    def create_access_token_for_user(user_id: str) -> str:
        """Create JWT access token for a user."""
        # You might want to use Supabase's JWT instead
        # This is a simple implementation for backward compatibility
        to_encode = {
            "sub": str(user_id),
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    
    @staticmethod
    def get_or_create_social_user(
        db: Session, 
        email: str, 
        name: str, 
        auth_type: str, 
        auth_identifier: str
    ) -> User:
        """Get or create user with social authentication."""
        # Check if auth method exists
        auth_method = db.query(UserAuth).filter(
            UserAuth.auth_type == auth_type,
            UserAuth.auth_identifier == auth_identifier
        ).first()
        
        if auth_method:
            # Return existing user
            return UserService.get_user_by_id(auth_method.user_id)
        
        # Check if user with this email exists
        user = UserService.get_user_by_email(email)
        
        if not user:
            # Create new user
            user = User(email=email, name=name)
            db.add(user)
            db.flush()
        
        # Create social auth method
        auth_method = UserAuth(
            user_id=user.id,
            auth_type=auth_type,
            auth_identifier=auth_identifier,
            auth_secret=None  # No password for social auth
        )
        db.add(auth_method)
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def update_user(db: Session, user_id: UUID, user_data: UserUpdate) -> User:
        """Update user profile."""
        user = UserService.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user fields
        for key, value in user_data.dict(exclude_unset=True).items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        return user 