"""Router to get tsunami risk and CRUD tsunami polygons."""

from fastapi import APIRouter
from ..tags import Tags


router = APIRouter(
    prefix="/api/tsunami",
    tags=[Tags.TSUNAMI],
)


@router.get("/risk/{address}")
async def get_risk(address: str):
    """
    Return whether this address is in the current tsunami risk
    polygon.
    """
    # TODO: Change return type to boolean to avoid validation error
    return {"message": "This endpoint is not yet implemented"}
