from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.security import verify_password
from app.core.supabase import get_supabase_client

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get the current user from the JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the token with Supabase
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        if not user:
            raise credentials_exception
        return user
    except Exception as e:
        raise credentials_exception

async def get_current_active_user(current_user = Depends(get_current_user)):
    """
    Get the current active user.
    """
    if not current_user:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 