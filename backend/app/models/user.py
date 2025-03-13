import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class User(BaseModel):
    """User model representing registered users."""
    
    __tablename__ = "users"
    
    # Override id with UUID
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    
    # User information
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    
    # Relationships
    auth_methods = relationship("UserAuth", back_populates="user", cascade="all, delete-orphan")


class UserAuth(BaseModel):
    """User authentication methods model."""
    
    __tablename__ = "user_auth"
    
    # Override id with UUID
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    
    # Foreign key to User
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Authentication information
    auth_type = Column(String, nullable=False)  # 'local', 'google', 'facebook'
    auth_identifier = Column(String, nullable=False)  # email for local, social ID for others
    auth_secret = Column(String, nullable=True)  # hashed password for local, empty for social
    
    # Relationships
    user = relationship("User", back_populates="auth_methods")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('auth_type', 'auth_identifier', name='unique_auth_method'),
    ) 