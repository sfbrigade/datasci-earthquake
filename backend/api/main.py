"""
API index

Allows getting soft story records; seismic, tsunami, landslide, and liquefaction zones
"""

import uvicorn
from .routers import (
    combined_risk,
    polygons,
    soft_story_api,
    seismic_api,
    tsunami_api,
    addresses_api,
    landslide_api,
    liquefaction_api,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.include_router(combined_risk.router)
app.include_router(soft_story_api.router)
app.include_router(polygons.router)
app.include_router(seismic_api.router)
app.include_router(tsunami_api.router)
app.include_router(addresses_api.router)
app.include_router(landslide_api.router)
app.include_router(liquefaction_api.router)


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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
