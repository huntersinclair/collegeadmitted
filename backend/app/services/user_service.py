from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserAuth
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token


class UserService:
    """Service for handling user operations."""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user with local authentication."""
        # Check if user with this email already exists
        db_user = db.query(User).filter(User.email == user_data.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(email=user_data.email, name=user_data.name)
        db.add(user)
        db.flush()  # Flush to get user ID
        
        # Create local auth method
        hashed_password = get_password_hash(user_data.password)
        auth_method = UserAuth(
            user_id=user.id,
            auth_type="local",
            auth_identifier=user_data.email,
            auth_secret=hashed_password
        )
        db.add(auth_method)
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password."""
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        
        # Find local auth method
        auth_method = db.query(UserAuth).filter(
            UserAuth.user_id == user.id,
            UserAuth.auth_type == "local"
        ).first()
        
        if not auth_method or not verify_password(password, auth_method.auth_secret):
            return None
        
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def update_user(db: Session, user_id: UUID, user_data: UserUpdate) -> User:
        """Update user profile."""
        user = UserService.get_user_by_id(db, user_id)
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
            return UserService.get_user_by_id(db, auth_method.user_id)
        
        # Check if user with this email exists
        user = UserService.get_user_by_email(db, email)
        
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
    def create_access_token_for_user(user_id: UUID) -> str:
        """Create JWT access token for a user."""
        return create_access_token(subject=user_id) 