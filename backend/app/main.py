from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.api import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="College Admitted API",
    description="API for college application analysis platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify API status."""
    return JSONResponse(
        content={"status": "healthy", "message": "API is running"},
        status_code=200
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 