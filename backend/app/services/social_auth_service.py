import requests
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.user_service import UserService
from app.models.user import User

settings = get_settings()


class SocialAuthService:
    """Service for handling social authentication with providers."""
    
    @staticmethod
    def get_google_auth_url(redirect_uri: str) -> str:
        """
        Generate Google OAuth2 authorization URL.
        
        Args:
            redirect_uri: The callback URL after authorization
            
        Returns:
            str: Google authorization URL
        """
        google_auth_url = "https://accounts.google.com/o/oauth2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{google_auth_url}?{query_string}"
    
    @staticmethod
    def get_facebook_auth_url(redirect_uri: str) -> str:
        """
        Generate Facebook OAuth2 authorization URL.
        
        Args:
            redirect_uri: The callback URL after authorization
            
        Returns:
            str: Facebook authorization URL
        """
        facebook_auth_url = "https://www.facebook.com/v12.0/dialog/oauth"
        params = {
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "scope": "email",
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{facebook_auth_url}?{query_string}"
    
    @staticmethod
    def exchange_google_code(code: str, redirect_uri: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Exchange Google authorization code for user info.
        
        Args:
            code: The authorization code from Google
            redirect_uri: The callback URL
            
        Returns:
            Tuple with (email, name, google_id) or (None, None, None) if failed
        """
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        
        token_response = requests.post(token_url, data=token_data)
        if not token_response.ok:
            return None, None, None
        
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        if not access_token:
            return None, None, None
        
        # Get user info with token
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        
        if not userinfo_response.ok:
            return None, None, None
        
        userinfo = userinfo_response.json()
        email = userinfo.get("email")
        name = userinfo.get("name")
        google_id = userinfo.get("sub")
        
        return email, name, google_id
    
    @staticmethod
    def exchange_facebook_code(code: str, redirect_uri: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Exchange Facebook authorization code for user info.
        
        Args:
            code: The authorization code from Facebook
            redirect_uri: The callback URL
            
        Returns:
            Tuple with (email, name, facebook_id) or (None, None, None) if failed
        """
        # Exchange code for token
        token_url = "https://graph.facebook.com/v12.0/oauth/access_token"
        token_params = {
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "client_secret": settings.FACEBOOK_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "code": code,
        }
        
        token_response = requests.get(token_url, params=token_params)
        if not token_response.ok:
            return None, None, None
        
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        if not access_token:
            return None, None, None
        
        # Get user info with token
        userinfo_url = "https://graph.facebook.com/me"
        params = {
            "fields": "id,name,email",
            "access_token": access_token,
        }
        userinfo_response = requests.get(userinfo_url, params=params)
        
        if not userinfo_response.ok:
            return None, None, None
        
        userinfo = userinfo_response.json()
        email = userinfo.get("email")
        name = userinfo.get("name")
        facebook_id = userinfo.get("id")
        
        return email, name, facebook_id
    
    @staticmethod
    def process_google_login(db: Session, code: str, redirect_uri: str) -> Optional[User]:
        """
        Process Google login and return user.
        
        Args:
            db: Database session
            code: Authorization code from Google
            redirect_uri: The callback URL
            
        Returns:
            User object or None if login failed
        """
        email, name, google_id = SocialAuthService.exchange_google_code(code, redirect_uri)
        
        if not email or not name or not google_id:
            return None
        
        # Get or create user with Google authentication
        return UserService.get_or_create_social_user(
            db=db,
            email=email,
            name=name,
            auth_type="google",
            auth_identifier=google_id
        )
    
    @staticmethod
    def process_facebook_login(db: Session, code: str, redirect_uri: str) -> Optional[User]:
        """
        Process Facebook login and return user.
        
        Args:
            db: Database session
            code: Authorization code from Facebook
            redirect_uri: The callback URL
            
        Returns:
            User object or None if login failed
        """
        email, name, facebook_id = SocialAuthService.exchange_facebook_code(code, redirect_uri)
        
        if not email or not name or not facebook_id:
            return None
        
        # Get or create user with Facebook authentication
        return UserService.get_or_create_social_user(
            db=db,
            email=email,
            name=name,
            auth_type="facebook",
            auth_identifier=facebook_id
        ) 