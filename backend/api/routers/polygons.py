"""Router to CRUD polygons."""

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
    pass


@router.put("/{id}")
async def put_polygon(id: int, polygon: Polygon, table_name: str):
    """
    Put this polygon into that table.
    """
    pass


@router.post("/")
async def post_polygon(id: int, polygon: Polygon, table_name: str):
    """
    Post this polygon to that table.
    """
    pass


@router.get("/{id}")
async def get_polygon(id: int, table_name: str) -> Polygon:
    """
    Get this polygon from that table.
    """
    pass
