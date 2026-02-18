
class HazardCheckError(Exception):
    """Raised when a hazard zone check fails."""
    def __init__(self, zone: str, lon: float, lat: float, original_exception: Exception = None):
        self.zone = zone
        self.lon = lon
        self.lat = lat
        self.original_exception = original_exception
