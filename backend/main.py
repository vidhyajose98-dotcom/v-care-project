"""
V-Care Healthcare Insurance Application - FastAPI Backend
Main application entry point with CORS configuration and route initialization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from routers import profiles, applications, claims, telehealth
from database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    logger.info("Starting V-Care API server...")
    try:
        init_db()
        logger.info("Database connection initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    yield
    
    logger.info("Shutting down V-Care API server...")


app = FastAPI(
    title="V-Care Healthcare Insurance API",
    description="Backend API for V-Care healthcare insurance application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
# Update allowed_origins based on your deployment environment
allowed_origins = [
    "http://localhost:5173",  # Local Vite dev server
    "http://localhost:3000",   # Alternative local dev
    "https://vcare-app.vercel.app",  # Update with your Vercel domain
    "https://your-production-domain.com",  # Your production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(telehealth.router, prefix="/api/telehealth", tags=["Telehealth"])


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "V-Care API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for deployment services"""
    return {
        "status": "healthy",
        "message": "V-Care API is operational"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if app.debug else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
