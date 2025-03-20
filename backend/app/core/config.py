import os
from typing import Optional, List, Union, Any
from pydantic import AnyHttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from functools import lru_cache

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CollegeAdmitted"
    
    # Supabase settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    JWT_SECRET: str = os.getenv("JWT_SECRET", "development_jwt_secret")
    JWT_ALGORITHM: str = "HS256"
    
    # CORS settings
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # OAuth2 settings
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    FACEBOOK_CLIENT_ID: Optional[str] = os.getenv("FACEBOOK_CLIENT_ID")
    FACEBOOK_CLIENT_SECRET: Optional[str] = os.getenv("FACEBOOK_CLIENT_SECRET")
    
    # Email settings (for future use)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Mistral API Configuration
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    
    # CommonApp API Configuration
    COMMONAPP_API_KEY: str = os.getenv("COMMONAPP_API_KEY", "")
    COMMONAPP_ORIGIN: str = os.getenv("COMMONAPP_ORIGIN", "")
    COMMONAPP_AUTH: str = os.getenv("COMMONAPP_AUTH", "")
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 