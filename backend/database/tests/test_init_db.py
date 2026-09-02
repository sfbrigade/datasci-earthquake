from backend.api.models.landslide_zones import LandslideZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.tsunami import TsunamiZone
from backend.database.init_db import table_classes


def test_table_classes_includes_all_four_hazard_tables():
    assert set(table_classes) == {
        TsunamiZone,
        LiquefactionZone,
        SoftStoryProperty,
        LandslideZone,
    }
