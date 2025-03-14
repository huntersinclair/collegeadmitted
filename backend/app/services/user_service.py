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
        """Get user profile by ID from Supabase."""
        try:
            # Use the profiles table which links to auth.users
            response = supabase_client.from_('profiles').select('*').eq('id', user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching user profile from Supabase: {e}")
            return None
    
    @staticmethod
    def get_auth_user_by_id(user_id: str) -> Optional[dict]:
        """Get user authentication data by ID from Supabase Auth."""
        try:
            # Get user from Supabase Auth
            response = supabase_client.auth.admin.get_user_by_id(user_id)
            
            if not response.user:
                return None
                
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata or {},
                "app_metadata": response.user.app_metadata or {}
            }
        except Exception as e:
            print(f"Error fetching auth user from Supabase: {e}")
            return None
            
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email from Supabase Auth."""
        try:
            # First get the user from Supabase Auth
            auth_response = supabase_client.auth.admin.list_users()
            users = [user for user in auth_response.users if user.email == email]
            
            if not users:
                return None
                
            # Then get their profile
            user_id = users[0].id
            response = supabase_client.from_('profiles').select('*').eq('id', user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching user from Supabase by email: {e}")
            return None
    
    @staticmethod
    def create_user(user_data: UserCreate) -> dict:
        """Create a new user in Supabase Auth."""
        # First check if user already exists - this is handled by Supabase,
        # but we can check first to provide a better error message
        try:
            auth_response = supabase_client.auth.admin.list_users()
            existing_user = [user for user in auth_response.users if user.email == user_data.email]
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
            
            # Create the user in Supabase Auth
            auth_response = supabase_client.auth.admin.create_user({
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": True,
                "user_metadata": {
                    "name": user_data.name
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user in Supabase Auth"
                )
            
            # The trigger will automatically create a profile entry
            # But we may want to update it with additional data
            user_id = auth_response.user.id
            profile_data = {
                "first_name": user_data.name.split()[0] if " " in user_data.name else user_data.name,
                "last_name": " ".join(user_data.name.split()[1:]) if " " in user_data.name else "",
                "display_name": user_data.name,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Update the profile
            response = supabase_client.from_('profiles').update(profile_data).eq('id', user_id).execute()
            
            if not response.data:
                print("Warning: Created user but failed to update profile data")
            
            # Return the user data
            return {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.name
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating user: {str(e)}"
            )
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[dict]:
        """Authenticate user with email and password using Supabase Auth."""
        try:
            # Sign in with Supabase Auth
            response = supabase_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not response.user:
                return None
            
            # Get the user profile
            user_id = response.user.id
            profile = UserService.get_user_by_id(user_id)
            
            if not profile:
                return {
                    "id": user_id,
                    "email": email,
                    "name": response.user.user_metadata.get("name", "")
                }
                
            # Return user data with profile information
            return {
                "id": user_id,
                "email": email,
                "name": profile.get("display_name") or response.user.user_metadata.get("name", ""),
                "first_name": profile.get("first_name", ""),
                "last_name": profile.get("last_name", ""),
                "avatar_url": profile.get("avatar_url", ""),
                "bio": profile.get("bio", ""),
                "school": profile.get("school", ""),
                "graduation_year": profile.get("graduation_year", None),
                "major": profile.get("major", "")
            }
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
    
    @staticmethod
    def update_user_profile(user_id: str, data: dict) -> Optional[dict]:
        """Update user profile in Supabase profiles table."""
        try:
            # Update the display_name in the profile data
            profile_data = {**data}
            if "name" in data:
                profile_data["display_name"] = data["name"]
                profile_data.pop("name", None)
                
                # Also update first_name and last_name if we have a full name
                if " " in data["name"]:
                    profile_data["first_name"] = data["name"].split()[0]
                    profile_data["last_name"] = " ".join(data["name"].split()[1:])
                else:
                    profile_data["first_name"] = data["name"]
                
            profile_data["updated_at"] = datetime.utcnow().isoformat()
            
            # Update the profiles table
            response = supabase_client.from_('profiles').update(profile_data).eq('id', user_id).execute()
            
            if not response.data:
                return None
                
            updated_profile = response.data[0]
            
            # Get the user's email from Supabase Auth
            auth_response = supabase_client.auth.admin.get_user_by_id(user_id)
            email = auth_response.user.email if auth_response.user else ""
            
            # Return combined user data
            return {
                "id": user_id,
                "email": email,
                "name": updated_profile.get("display_name", ""),
                "first_name": updated_profile.get("first_name", ""),
                "last_name": updated_profile.get("last_name", ""),
                "avatar_url": updated_profile.get("avatar_url", ""),
                "bio": updated_profile.get("bio", ""),
                "school": updated_profile.get("school", ""),
                "graduation_year": updated_profile.get("graduation_year", None),
                "major": updated_profile.get("major", "")
            }
        except Exception as e:
            print(f"Error updating user profile in Supabase: {e}")
            return None
            
    @staticmethod
    def create_access_token_for_user(user_id: str) -> str:
        """Create JWT access token for a user."""
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