from __future__ import annotations
from typing import Optional
import uuid


class HazardCheckError(Exception):
    """Raised when a hazard zone check fails."""

    def __init__(
        self,
        zone: str,
        lon: float,
        lat: float,
        original_exception: Optional[Exception] = None,
    ):
        self.zone = zone
        self.lon = lon
        self.lat = lat
        self.original_exception = original_exception
        self.error_id = str(uuid.uuid4())
        super().__init__(
            f"HazardCheckError [{self.error_id}] in {zone} for lon={lon}, lat={lat}"
        )

    def __str__(self) -> str:
        return f"HazardCheckError(id={self.error_id}, zone={self.zone}, lon={self.lon}, lat={self.lat}, original_exception={self.original_exception})"
