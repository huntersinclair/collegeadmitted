from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_database_url

# Create database engine
engine = create_engine(
    get_database_url(),
    pool_pre_ping=True,  # Enable connection pool "pre-ping" feature
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 