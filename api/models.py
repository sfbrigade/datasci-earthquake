#from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime, DateTime


MAPPED_COLUMN_STRING_LENGTH = 200


class SoftStoryProperties(DeclarativeBase):
    """
    All data of the Soft Story table from SFData.
    Contains point geometries for properties. Used for spatial comparison to determine hazard zone overlaps.
    """
    __tablename__ = "soft_story_properties"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    block: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    lot: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    parcel_number: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    property_address: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    address: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    tier: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    bos_district: Mapped[int] = mapped_column(Integer)
    point: Mapped[Geometry] = mapped_column(Geometry('POINT', srid=4326))
    sfdata_as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)
    sfdata_loaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)
    update_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<SoftStoryProperties(id={self.identifier}, property_address={self.property_address})>"


class SeismicHazardZones(DeclarativeBase):
    """
    All data of the Seismic Hazard table from SFData.
    Contains multipolygon geometries defining seismic hazard areas.
    """
    __tablename__ = "seismic_hazard_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    the_geom: Mapped[Geometry] = mapped_column(Geometry('MULTIPOLYGON', srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<SeismicHazardZones(id={self.identifier})>"


class TsunamiZones(DeclarativeBase):
    """
    All data of the Tsunami Hazard table from conservation.ca.gov.
    """
    __tablename__ = "tsunami_zones"
    
    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    evacuate: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    county: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    gis_link: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    kmz_link: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    map_link: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    label: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    shape_length: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    # This data is ingested as PolygonZ but should be stored as MultiPolygon
    geometry: Mapped[Geometry] = mapped_column(Geometry('MULTIPOLYGON', srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<TsunamiZones(id={self.identifier})>"


class LiquefactionZones(DeclarativeBase):
    """
    All data of the Liquefaction Zones table from SFData.
    Contains multipolygon geometries defining soil liquefaction zones as High (H) or 
    Very High (VH) susceptibility.
    """
    __tablename__ = "liquefaction_zones"

    identifier: Mapped[int] = mapped_column(primary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry('MULTIPOLYGON', srid=4326))
    susceptibility: Mapped[String] = mapped_column(String)
    shape_length: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    update_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<LiquefactionZones(id={self.identifier})>"
        

class LandslideZones(DeclarativeBase):

    """
    All data of the Landslide Zones table from SFData.
    Contains multipolygon geometries defining landslide zones.
    """

    __tablename__ = "landslide_zones"

    identifier: Mapped[int] = mapped_column(Integerprimary_key=True)
    the_geom: Mapped[Geometry] = mapped_column(Geometry('MULTIPOLYGON', srid=4326))
    gridcode: Mapped[int] = mapped_column(Integer)
    sum_shape: Mapped[float] = mapped_column(Float)
    shape_length: Mapped[float] = mapped_column(Float)
    shape_Le_1: Mapped[float] = mapped_column(Float)
    shape_area: Mapped[float] = mapped_column(Float)
    update_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<LandslideZones(id={self.identifier})>"


class Neighborhoods(DeclarativeBase):
    """
    Stores neighborhood boundaries as multipolygon geometries.
    """
    __tablename__ = "neighborhoods"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    neighborhood: Mapped[str] = mapped_column(String(MAPPED_COLUMN_STRING_LENGTH))
    geometry: Mapped[Geometry] = mapped_column(Geometry('MULTIPOLYGON', srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=datetime.utc_now)
  
    def __repr__(self) -> str:
        return f"<Neighborhoods(id={self.identifier}>"
