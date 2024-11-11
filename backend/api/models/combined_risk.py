from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CombinedRisk(Base):
    __tablename__ = "combined_risk"

    id = Column(Integer, primary_key=True, autoincrement=True)
    address = Column(String(50), nullable=False, unique=True)
    soft_story_risk = Column(Boolean, nullable=False, default=False)
    seismic_hazard_risk = Column(Boolean, nullable=False, default=False)
    landslide_risk = Column(Boolean, nullable=False, default=False)
    liquefaction_risk = Column(Boolean, nullable=False, default=False)

    def __repr__(self):
        return (
            f"<CombinedRisk(id={self.id}, address='{self.address}', "
            f"soft_story_risk={self.soft_story_risk}, "
            f"seismic_hazard_risk={self.seismic_hazard_risk}, "
            f"landslide_risk={self.landslide_risk}, "
            f"liquefaction_risk={self.liquefaction_risk})>"
        )
