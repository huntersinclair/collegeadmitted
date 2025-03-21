from fastapi import APIRouter

from app.api.endpoints import applications, documents

api_router = APIRouter()

# Include routers for different endpoints
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"]) 