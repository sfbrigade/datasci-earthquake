from sqlalchemy import String, DateTime
from datetime import datetime
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.sql import func
from backend.api.models.base import Base


class ExportMetadata(Base):
    """
    Tracks the last export time for each dataset in public/data to enable efficient change detection.
    """

    __tablename__ = "export_metadata"

    dataset_name: Mapped[str] = mapped_column(String, primary_key=True)
    last_exported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self):
        return f"<ExportMetadata(dataset_name='{self.dataset_name}', last_exported_at='{self.last_exported_at}')>"
