"""All data of the Seismic Hazard table from SFData"""
from sqlalchemy import Integer, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry
from datetime import datetime
from .base import Base


class SeismicHazardZone(Base):
    """
    All data of the Seismic Hazard table from SFData
    
    Contains multipolygon geometries defining seismic hazard areas
    """
    __tablename__ = "seismic_hazard_zones"

    identifier: Mapped[int] = mapped_column(Integer, primary_key=True)
    geometry: Mapped[Geometry] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    update_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<SeismicHazardZone(id={self.identifier})>"
