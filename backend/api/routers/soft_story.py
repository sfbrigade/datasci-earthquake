from fastapi import APIRouter, Query
from typing import Annotated
from ..tags import Tags


router = APIRouter(
    prefix="/api/soft-story",
    tags=[Tags.SOFT_STORY],
)


@router.delete("/{address}")
async def delete_soft_story(address: str):
    """
    Delete the record that the building at an address has a soft
    story.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.put("/{address}")
async def put_soft_story(
    address: str, soft_story: Annotated[bool, Query(alias="soft-story")]
):
    """
    Update whether the building at an address has a soft story
    to the database.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.post("/{address}")
async def post_soft_story(
    address: str, soft_story: Annotated[bool, Query(alias="soft-story")]
):
    """
    Add that the building at an address has a soft story to the
    database.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.get("/{address}")
async def get_soft_story(address: str):
    """
    Return whether the building at an address has a soft story.
    """
    # TODO: Change return type to boolean to avoid validation error
    return {"message": "This endpoint is not yet implemented"}
