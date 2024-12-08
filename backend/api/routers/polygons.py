"""Router to CRUD for polygons"""
from fastapi import APIRouter
from pydantic import BaseModel
from ..tags import Tags


router = APIRouter(prefix="/api/polygons", tags=[Tags.POLYGONS])


class Polygon(BaseModel):
    """GIS data container of vertices defining a polygon."""
    pass


@router.delete("/{id}")
async def delete_polygon(id: int, table_name: str):
    """
    Delete this polygon from that table.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.put("/{id}")
async def put_polygon(id: int, polygon: Polygon, table_name: str):
    """
    Put this polygon into that table.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.post("/")
async def post_polygon(id: int, polygon: Polygon, table_name: str):
    """
    Post this polygon to that table.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.get("/{id}")
async def get_polygon(id: int, table_name: str):
    """
    Get this polygon from that table.
    """
    return {"message": "This endpoint is not yet implemented"}
