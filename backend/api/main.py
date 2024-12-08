"""
API index

Allows getting, putting, and deleting soft story records,
and seismic risk and tsunami polygons and the resulting
combined risk records
"""
import uvicorn
from .routers import combined_risk, polygons, soft_story, seismic, tsunami, addresses
from fastapi import FastAPI
# TODO:
# Decide:
# - whether old polygons should be kept #53
# - whether old soft story records should be kept #53
# - whether old combined risk records should be kept #53
# - where current and old polygons, soft story records, and
#   combined risk records should be kept #53
# Create:
# - a database to back the exposed arguments #54
# - a new API key for OpenGate
# - fuzzy logic to match addresses
# Make: each get method return that of their pydantic annotations


app = FastAPI()


app.include_router(combined_risk.router)
app.include_router(soft_story.router)
app.include_router(polygons.router)
app.include_router(seismic.router)
app.include_router(tsunami.router)
app.include_router(addresses.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
