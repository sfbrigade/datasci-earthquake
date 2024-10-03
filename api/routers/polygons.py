"""Router to CRUD polygons."""
from fastapi import APIRouter
from pydantic import BaseModel
from ..tags import Tags


router = APIRouter(
    prefix="/api/polygons",
    tags=[Tags.POLYGONS]
)


class Polygon(BaseModel):
    """GIS data container of vertices defining a polygon."""
    pass


@router.delete("/delete")
async def delete(id: int, table_name: str):
    """
    Delete this polygon from that table.
    """
    pass


@router.put("/put")
async def put(id: int, polygon: Polygon, table_name: str):
    """
    Put this polygon into that table.
    """
    pass


@router.post("/post")
async def post(id: int, polygon: Polygon, table_name: str):
    """
    Post this polygon to that table.
    """
    pass


@router.get("/get")
async def get(id: int, table_name: str) -> Polygon:
    """
    Get this polygon from that table.
    """
    pass