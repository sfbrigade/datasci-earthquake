"""
API index

Allows getting soft story records, tsunami, landslide, and liquefaction zones
"""

import uvicorn
from .routers import (
    combined_risk,
    polygons,
    soft_story_api,
    tsunami_api,
    landslide_api,
    liquefaction_api,
)
from fastapi import FastAPI


app = FastAPI()


app.include_router(combined_risk.router)
app.include_router(soft_story_api.router)
app.include_router(polygons.router)
app.include_router(tsunami_api.router)
app.include_router(landslide_api.router)
app.include_router(liquefaction_api.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
