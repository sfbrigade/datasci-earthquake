from fastapi import FastAPI
import sentry_sdk
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
)

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redirect_slashes=False)

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

sentry_sdk.init(
    dsn="https://3f10d5d496e27bbed3d3f2d0c7128e63@o4507340843384832.ingest.us.sentry.io/4509358454669312"
)

@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0