"""Router to get seismic risk and CRUD seismic polygons."""

from fastapi import APIRouter
from ..tags import Tags


router = APIRouter(
    prefix="/api/seismic",
    tags=[Tags.SEISMIC],
)


@router.get("/risk/{address}")
async def get_seismic_risk(address: str) -> bool:
    """
    Return whether this address is in the current seismic risk
    polygon.
    """
    # TODO: Change return type to boolean to avoid validation error
    pass
