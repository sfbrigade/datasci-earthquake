from fastapi import APIRouter, Query
from typing import Annotated
from ..tags import Tags


router = APIRouter(
    prefix="/api/reinforced-soft-story",
    tags=[Tags.REINFORCED_SOFT_STORY],
)


@router.delete("/{address}")
async def delete_reinforced(address: str):
    """
    Delete the record that the building at an address, having a soft
    story, has been reinforced.

    Check a small group of reinforced soft stories and raise an
    exception if the building lacks an original soft story.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.put("/{address}")
async def put_reinforced(
    address: str, soft_story: Annotated[bool, Query(alias="soft-story")]
):
    """
    Update whether the building at an address, having a soft story,
    has been reinforced.

    Check a small group of reinforced soft stories and raise an
    exception if the building lacks an original soft story.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.post("/{address}")
async def post_reinforced(
    address: str, soft_story: Annotated[bool, Query(alias="soft-story")]
):
    """
    Add that the building at an address, having a soft story, has
    been reinforced.

    Check a small table of reinforced soft stories and raise an
    exception if the building lacks an original soft story.
    """
    return {"message": "This endpoint is not yet implemented"}


@router.get("/{address}")
async def get_reinforced(address: str):
    """
    Return whether the building at an address, having a soft story,
    has been reinforced.

    Check a small table of reinforced soft stories and raise an
    exception if the building lacks an original soft story.
    """
    # TODO: Change return type to boolean to avoid validation error
    return {"message": "This endpoint is not yet implemented"}
