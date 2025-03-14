from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError

from app.services.user_service import UserService
from app.core.config import get_settings
from app.core.supabase import supabase_client

settings = get_settings()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> str:
    """
    Get the current authenticated user ID from the JWT token.
    
    Returns:
        str: User ID from Supabase
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # First try to validate with our own secret key
        try:
            # Decode JWT token with our app's secret
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=["HS256"]
            )
            user_id: str = payload.get("sub")
            if not user_id:
                raise ValueError("Invalid token payload")
        except (JWTError, ValidationError, ValueError):
            # If that fails, try with Supabase
            # Supabase JWT validation - this verifies the token with Supabase
            response = supabase_client.auth.get_user(token)
            if not response.user:
                raise ValueError("Invalid Supabase token")
            user_id = response.user.id
        
        # Check if user exists in Supabase profiles
        user = UserService.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_optional_current_user(
    token: str = Depends(oauth2_scheme)
) -> Optional[str]:
    """
    Get the current authenticated user ID if token is valid, or None if not.
    
    Returns:
        Optional[str]: User ID if authenticated, None otherwise
    """
    try:
        return get_current_user(token)
    except HTTPException:
        return None 