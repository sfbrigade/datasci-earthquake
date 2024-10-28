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
    pass


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
    pass


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
    pass


@router.get("/{address}")
async def get_reinforced(address: str) -> bool:
    """
    Return whether the building at an address, having a soft story,
    has been reinforced.

    Check a small table of reinforced soft stories and raise an
    exception if the building lacks an original soft story.
    """
    # TODO: Change return type to boolean to avoid validation error
    pass
