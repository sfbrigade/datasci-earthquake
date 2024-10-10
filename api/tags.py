"""Tags for the routers and API."""
from enum import Enum


class Tags(Enum):
    SEISMIC = "seismic"
    TSUNAMI = "tsunami"
    SOFT_STORY = "soft story"
    COMBINED_RISK = "combined risk"
    POLYGONS = "polygons"
