from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.services.user_service import UserService
from app.core.config import get_settings

settings = get_settings()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/local")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get the current authenticated user from the JWT token.
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        user_id: UUID = UUID(payload.get("sub"))
    except (JWTError, ValidationError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = UserService.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_optional_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Optional[User]:
    """
    Get the current authenticated user if token is valid, or None if not.
    """
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        user_id: UUID = UUID(payload.get("sub"))
    except (JWTError, ValidationError, ValueError):
        return None
    
    # Get user from database
    user = UserService.get_user_by_id(db, user_id)
    return user 