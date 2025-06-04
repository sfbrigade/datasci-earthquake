from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
)
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redirect_slashes=False)


# Log origin header for debugging
@app.middleware("http")
async def log_origin_header(request: Request, call_next):
    origin = request.headers.get("origin")
    logger.info(f"Incoming request from origin: {origin}")
    return await call_next(request)


origins = [
    "https://develop.safehome.report",
    "http://localhost",
    "http://localhost:3000",
]

origins_regex = r"^(https://datasci-ear-git-.*\.vercel\.app|https://datasci-earthquake-.*\.vercel\.app)$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(liquefaction_api.router)
app.include_router(tsunami_api.router)
app.include_router(soft_story_api.router)
app.include_router(health_api.router)


# Test route
@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI on Vercel!"}


handler = app
