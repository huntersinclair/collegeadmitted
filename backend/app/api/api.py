from fastapi import APIRouter

from app.api.endpoints import auth, user

api_router = APIRouter()

# Include routers for different endpoints
api_router.include_router(auth.router, tags=["Authentication"])
api_router.include_router(user.router, tags=["Users"]) 