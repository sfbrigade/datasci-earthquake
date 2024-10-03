"""
Index of API.

Allows getting, putting, and deleting soft story records,
and seismic risk and tsunami polygons and the resulting
combined risk records.
"""
# TODO:
# Decide: 
# - whether old polygons should be kept
# - whether old soft story records should be kept
# - whether old combined risk records should be kept
# - where current and old polygons, soft story records, and
#   combined risk records should be kept
# - whether polygons should be the exposed api to handle
#   polygons with its every method receiving an argument
#   indicating seismic or tsunami
# Create: 
# - a database to back the exposed arguments
# - a new API key for OpenGate
# - fuzzy logic to match addresses 
# Make: each get method return that of their pydantic annotations
from .routers import combined_risk, polygons, soft_story, seismic, tsunami
from fastapi import FastAPI


app = FastAPI()


app.include_router(combined_risk.router)
app.include_router(soft_story.router)
app.include_router(polygons.router)
app.include_router(seismic.router)
app.include_router(tsunami.router)
