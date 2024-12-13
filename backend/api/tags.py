"""Tags for the routers and API"""

from enum import Enum


class Tags(Enum):
    SEISMIC = "seismic"
    TSUNAMI = "tsunami"
    SOFT_STORY = "soft story"
    REINFORCED_SOFT_STORY = "reinforced soft story"
    COMBINED_RISK = "combined risk"
    POLYGONS = "polygons"
    ADDRESSES = "addresses"
    LANDSLIDE = "landslide"
    LIQUEFACTION = "liquefaction"
