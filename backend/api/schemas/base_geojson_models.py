from pydantic import BaseModel, Field
from typing import List


# Abstract base class for geometries
class GeometryModel(BaseModel):
    type: str

    """class Config:
        orm_mode = True    """


# Base Feature Properties class
class FeatureProperties(BaseModel):
    pass

    """class Config:
        orm_mode = True"""


# Feature Model
class FeatureModel(BaseModel):
    type: str = Field(default="Feature")
    geometry: GeometryModel
    properties: FeatureProperties

    """class Config:
        orm_mode = True"""


# FeatureCollection Model
class FeatureCollectionModel(BaseModel):
    type: str = Field(default="FeatureCollection")
    features: List[FeatureModel]

    """class Config:
        orm_mode = True    """

    def to_dict(self):
        return {
            "type": self.type,
            "features": [feature.to_dict() for feature in self.features],
        }
