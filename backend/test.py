from backend.api.models.addresses import Address
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.landslide_zones import LandslideZone
from backend.api.models.seismic_hazard_zones import SeismicHazardZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty

from backend.api.models.base import Base

if __name__ == "__main__":
    print("tables")
    for table in Base.metadata.tables:
        print("tables")
        print("table", table)
