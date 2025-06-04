from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
)

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redirect_slashes=False)

origins = [
    "https://develop.safehome.report",
    "http://localhost",
    "http://localhost:3000",
]

origins_regex = r"^(https://datasci-ear-git-.*\.vercel\.app|https://datasci-earthquake-.*\.vercel\.app)$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=False,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(liquefaction_api.router)
app.include_router(tsunami_api.router)
app.include_router(soft_story_api.router)
app.include_router(health_api.router)
