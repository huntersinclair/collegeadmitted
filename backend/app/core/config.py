from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from typing import Optional

class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "College Admitted"
    
    # Database Configuration
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str
    
    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Mistral AI Configuration
    MISTRAL_API_KEY: Optional[str] = None
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

# Database URL construction
def get_database_url() -> str:
    """Construct database URL from settings."""
    settings = get_settings()
    return f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}" 