"""Router to CRUD combined risk."""
from fastapi import APIRouter
from ..tags import Tags


router = APIRouter(
    prefix="/api/combined-risks",
    tags=[Tags.COMBINED_RISK],
)


@router.delete("/{address}")
async def delete_combined_risks(address: str):
    """
    Remove the combined seismic risks of an address from
    the database.
    """
    pass


@router.put("/{address}")
async def put_combined_risks(address: str, risks: dict):
    """
    Add the combined seismic risks of an address to the database.
    """
    pass


@router.post("/{address}")
async def put_combined_risks(address: str, risks: dict):
    """
    Add the combined seismic risks of an address to the database.
    """
    pass


@router.get("/{address}")
async def get_combined_risks(address: str) -> dict:
    """
    Return the combined risks of an address as a dictionary of
    three booleans.
    """
    # TODO: Return a dictionary to avoid validation error
    pass