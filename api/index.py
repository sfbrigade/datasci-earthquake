"""
Index of API.

Allows getting, putting, and deleting soft story records,
and seismic risk and tsunami polygons and the resulting
combined risk records.

TODO:
- Decide whether old polygons should be kept
- Decide whether old soft story records should be kept
- Decide whether old combined risk records should be kept
- Require polygon as an argument to the exposed put polygon methods
- Require a dictionary as an argument to the put combined risks method
- Create a database to back the exposed arguments
- Make each get method return that of their pydantic annotations
"""
from typing import Annotated
from fastapi import FastAPI, Path, Query
from .schemas import Polygon
import sqlalchemy

app = FastAPI()




async def _delete_polygon(polygon_name: str):
    """
    Delete the named polygon from the database.

    Backend implementation method for the exposed,
    named polygon setters.
    """
    pass


async def _put_polygon(id: int, polygon: Polygon):
    """
    Put the named polygon into the database.

    Backend implementation method for the exposed,
    named polygon setters.
    """
    pass


async def _post_polygon(id: int, polygon: Polygon):
    """
    Post the named polygon to the database.

    Backend implementation method for the exposed,
    named polygon setters.
    """
    pass


async def _get_polygon(id: int) -> Polygon:
    """
    Return the named polygon from the database.

    Backend implementation method for the exposed, named
    polygon getters.
    """
    pass


@app.delete("/api/tsunami-polygon/{id}")
async def delete_tsunami_polygon(id: Annotated[int, Path(ge=1)]):
    """
    Delete the tsunami risk polygon from the database.

    The tsunami risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    await _delete_polygon(id)


@app.put("/api/tsunami-polygon/{id}")
async def put_tsunami_polygon(id: Annotated[int, Path(ge=1)],
                              polygon: Polygon):
    """
    Update this tsunami risk polygon in the database.

    The tsunami risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    await _put_polygon(id, polygon)


@app.post("/api/tsunami-polygon/{id}")
async def post_tsunami_polygon(id: Annotated[int, Path(ge=1)]):
    """
    Add a new tsunami risk polygon from the database.

    The tsunami risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    return await _post_polygon(id)


@app.get("/api/tsunami-polygon/{id}")
async def get_tsunami_polygon(id: Annotated[int, Path(ge=1)]):
    """
    Return the tsunami risk polygon from the database.

    The tsunami risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    return await _get_polygon(id)


@app.get("/api/tsunami-risk/{address}")
async def get_tsunami_risk(address: str) -> bool:
    """
    Return whether this address is in the current tsunami risk
    polygon.
    """
    # TODO: Change return type to boolean to avoid validation error
    pass


@app.delete("/api/seismic-polygon/{id}")
async def delete_seismic_polygon(id: Annotated[int, Path(ge=1)]):
    """
    Delete the seismic polygon from the database.

    The seismic risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    return await _delete_polygon(id)


@app.put("/api/seismic-polygon/{id}")
async def put_seismic_polygon(id: Annotated[int, Path(ge=1)],
                              polygon: Polygon):
    """
    Update this seismic polygon in the database.

    The seismic risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    return await _put_polygon(id, polygon)


@app.post("/api/seismic-polygon/{id}")
async def post_seismic_polygon(id: Annotated[int, Path(ge=1)],
                              polygon: Polygon):
    """
    Post this seismic polygon to the database.

    The seismic risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    return await _post_polygon(id, polygon)


@app.get("/api/seismic-polygon/{id}")
async def get_seismic_polygon(id: Annotated[int, Path(ge=1)]):
    """
    Return the seismic polygon from the database.

    The seismic risk polygon is a PyDantic object containing
    vertices and their relationships.
    """
    return await _get_polygon(id)


@app.get("/api/seismic-risk/{address}")
async def get_seismic_risk(address: str) -> bool:
    """
    Return whether this address is in the current seismic risk
    polygon.
    """
    # TODO: Change return type to boolean to avoid validation error
    pass


@app.delete("/api/soft-story/{address}")
async def delete_soft_story(address: str):
    """
    Delete the record that the building at an address has a soft
    story.
    """
    pass


@app.put("/api/soft-story/{address}")
async def put_soft_story(address: str,
                         soft_story: Annotated[
                             bool, Query(alias="soft-story")]):
    """
    Update whether the building at an address has a soft story
    to the database.
    """
    pass


@app.post("/api/soft-story/{address}")
async def post_soft_story(address: str,
                         soft_story: Annotated[
                         bool, Query(alias="soft-story")]):
    """
    Add that the building at an address has a soft story to the
    database.
    """
    pass


@app.get("/api/soft-story/{address}")
async def get_soft_story(address: str) -> bool:
    """
    Return whether the building at an address has a soft story.
    """
    # TODO: Change return type to boolean to avoid validation error
    pass
    # we get address
    # call to other api to check address
    # convert response to boolean


@app.delete("/api/combined-risks/{address}")
async def delete_combined_risks(address: str):
    """
    Remove the combined seismic risks of an address from
    the database.

    Check whether an address for the row exists; if so, remove
    it.
    """
    pass


@app.put("/api/combined-risks/{address}")
async def put_combined_risks(address: str, risks: dict):
    """
    Add the combined seismic risks of an address to the database.

    Check whether an address for the row exists; if so, update
    each element that differs; if not, add a new row.
    """
    pass


@app.get("/api/combined-risks/{address}")
async def get_combined_risks(address: str) -> dict:
    """
    Return the combined risks of an address as a dictionary of
    three booleans.

    Receive the address as a URL argument to one in the database.
    """


    # TODO: Return a dictionary to avoid validation error
    pass