import datetime
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routers import api_router
from app.core.config import settings
from app.core.seeder import seed_initial_demo_data

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    logger.info("Initializing WASKITA SQLite database and seeding demo accounts...")
    seed_initial_demo_data()
    yield
    # Shutdown
    logger.info("Shutting down WASKITA backend engine.")


app = FastAPI(
    title=settings.APP_NAME,
    description="WASKITA (Web-Article Semantic & Quality Inspection Tool for Pre-Publishing Audit) - Core Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware (mendukung frontend React Mokly di port 3000, 5173, dll.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrasi Router API v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": "sqlite_wal_active",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }
