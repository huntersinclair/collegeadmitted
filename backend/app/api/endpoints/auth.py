from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Any

from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.user_service import UserService
from app.services.social_auth_service import SocialAuthService
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()


@router.post("/registration/local", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user with email and password.
    """
    # Create user
    user = UserService.create_user(db, user_data)
    
    # Generate access token
    token = UserService.create_access_token_for_user(user.id)
    
    return {
        "user_id": user.id,
        "token": token,
        "token_type": "bearer"
    }


@router.post("/login/local", response_model=TokenResponse)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
) -> Any:
    """
    Authenticate a user with email and password.
    """
    # Authenticate user
    user = UserService.authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    token = UserService.create_access_token_for_user(user.id)
    
    return {
        "user_id": user.id,
        "token": token,
        "token_type": "bearer"
    }


@router.get("/login/{provider}")
def social_login(
    provider: str,
    request: Request
) -> Any:
    """
    Initiate social login flow with provider.
    
    Args:
        provider: "google" or "facebook"
        
    Returns:
        RedirectResponse to provider's auth page
    """
    if provider not in ["google", "facebook"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}"
        )
    
    # Construct callback URL
    callback_url = f"{settings.BACKEND_URL}{settings.API_V1_STR}/callback/{provider}"
    
    # Get authorization URL for provider
    if provider == "google":
        auth_url = SocialAuthService.get_google_auth_url(callback_url)
    else:  # Facebook
        auth_url = SocialAuthService.get_facebook_auth_url(callback_url)
    
    return RedirectResponse(auth_url)


@router.get("/callback/{provider}")
def social_callback(
    provider: str,
    code: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Handle social login callback from provider.
    
    Args:
        provider: "google" or "facebook"
        code: Authorization code from provider
        
    Returns:
        RedirectResponse to frontend with token in query params
    """
    if provider not in ["google", "facebook"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}"
        )
    
    # Construct callback URL
    callback_url = f"{settings.BACKEND_URL}{settings.API_V1_STR}/callback/{provider}"
    
    # Process login based on provider
    if provider == "google":
        user = SocialAuthService.process_google_login(db, code, callback_url)
    else:  # Facebook
        user = SocialAuthService.process_facebook_login(db, code, callback_url)
    
    if not user:
        # Redirect to frontend with error
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/login?error=social_login_failed"
        )
    
    # Generate access token
    token = UserService.create_access_token_for_user(user.id)
    
    # Redirect to frontend with token
    return RedirectResponse(
        f"{settings.FRONTEND_URL}/login/success?token={token}&user_id={user.id}"
    ) 