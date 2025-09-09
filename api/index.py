from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
)
from backend.api.config import settings
from backend.etl.background_service import etl_service
import sentry_sdk
import logging


# Initialize Sentry
sentry_sdk.init(
    dsn=settings.sentry_dsn,
    # Add request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=False,
)

# Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redirect_slashes=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app.include_router(liquefaction_api.router)
app.include_router(tsunami_api.router)
app.include_router(soft_story_api.router)
app.include_router(health_api.router)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event - start ETL service in background
@app.on_event("startup")
async def startup_event():
    """Start background ETL service when FastAPI starts"""
    logger.info("Starting background ETL service")
    etl_service.start()


# Shutdown event - stop ETL service gracefully
@app.on_event("shutdown")
async def shutdown_event():
    """Stop background ETL service when FastAPI shuts down"""
    logger.info("Stopping background ETL service")
    etl_service.stop()


# Global exception handler (ensures flush before serverless exit)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    sentry_sdk.capture_exception(exc)
    sentry_sdk.flush(timeout=2.0)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
