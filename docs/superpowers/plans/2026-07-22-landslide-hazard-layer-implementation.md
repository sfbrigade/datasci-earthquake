# Landslide Hazard Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the already-modeled `LandslideZone` data online as the fourth hazard layer end-to-end: DB registration, ETL, standalone + composite API endpoints, and full frontend wiring (map layer, legend, address hazard-check).

**Architecture:** Reuse the exact pattern established by the existing three hazards (soft story, liquefaction, tsunami) at every layer — no new abstractions. Backend: register `LandslideZone` in `init_db.py`'s table-existence checks, add a `gridcode in (8,9,10)`-filtered point-lookup endpoint to the existing (but unregistered) `landslide_api.py` router, wire that router into `api/index.py`, and extend the composite `/api/hazards/lookup` endpoint with a landslide check. Frontend: landslide becomes hazard `id: 3`, added to every hazard-enumeration array/endpoint/fetch call already used by the other three, with a placeholder brown/amber color.

**Tech Stack:** FastAPI + SQLAlchemy/GeoAlchemy2 + Postgres/PostGIS (backend); Next.js/React/TypeScript + Mapbox GL (frontend); pytest (backend tests); Jest + React Testing Library (frontend tests).

**Base branch:** `feat/hazard-lookup-composite-api` (not `develop`). That branch already contains the composite `hazard_lookup_api.py` / `hazard_lookup_schemas.py` files this plan extends, and is otherwise identical to `develop` (its one point of divergence is that `develop` has one additional commit — the design-spec commit itself — which does not touch any file this plan modifies). Create the feature branch from there:

```bash
git checkout feat/hazard-lookup-composite-api
git pull
git checkout -b feat/959-landslide-hazard-layer
```

---

## Verified current state (as of writing this plan)

- `backend/api/models/landslide_zones.py` — `LandslideZone` model, complete, unchanged by this plan.
- `backend/api/schemas/landslide_schemas.py` — has `LandslideProperties`, `LandslideFeature`, `LandslideFeatureCollection`. **Missing** `InLandslideZoneView` (added in Task 2).
- `backend/api/routers/landslide_api.py` — has `GET /landslide-zones/` (gridcode 8-10 filter). **Missing** `is-in-landslide-zone` endpoint (added in Task 3) and is **not registered** in `api/index.py` (fixed in Task 4).
- `backend/database/init_db.py` — imports `LandslideZone` but excludes it from `table_classes` (fixed in Task 1).
- `backend/database/init.sql` seed data for `landslide_zones` (3 rows, identifiers 3/4/5):
  - id 3: gridcode 8, two disjoint polygons, one of which spans a huge lat range (37.7 down to 30.7) — do not rely on this row's exact shape in new tests.
  - id 4: gridcode 3 (**not** high-susceptibility — excluded by the `gridcode in (8,9,10)` filter). Two polygons: a clean rectangle lon `[-122.5,-122.3]` × lat `[37.7,37.9]`, plus a smaller redundant rectangle fully inside it.
  - id 5: gridcode 10, two polygons: a clean rectangle lon `[-122.5,-122.4]` × lat `[37.7,37.8]`, plus a smaller redundant rectangle fully inside it.
  - Verified test points (plain coordinate-range arithmetic, confirmed against the rectangles above):
    - `(-122.43, 37.72)` — inside the id-5 (gridcode 10) rectangle → should report `exists: True`.
    - `(-122.32, 37.88)` — inside the id-4 (gridcode 3) rectangle only, outside id-5's and id-3's shapes → should report `exists: False` (proves the gridcode filter, not just "any landslide row").
    - `(0.0, 0.0)` — outside every zone (same point used by the existing liquefaction/tsunami tests).
  - `GET /landslide-zones/` (gridcode 8-10 filter) will therefore return **2** features (ids 3 and 5), not 3 — id 4 is excluded.
- `backend/api/tags.py` already has `Tags.LANDSLIDE` (used by `landslide_api.py`) and, on this branch, `Tags.HAZARDS` (used by `hazard_lookup_api.py`). No changes needed.
- `backend/api/routers/hazard_lookup_api.py` (this branch only) — composite `GET /api/hazards/lookup`, currently returns `soft_story`, `liquefaction`, `tsunami`. **Missing** `landslide` (added in Task 5).
- `backend/api/schemas/hazard_lookup_schemas.py` (this branch only) — `HazardStatus`, `CompositeHazardResponse` (missing `landslide` field, added in Task 5).
- `api/index.py` (this branch) — imports/includes `liquefaction_api, tsunami_api, soft_story_api, health_api, hazard_lookup_api`. **Missing** `landslide_api` (added in Task 4).
- Frontend: no `landslide` entries exist anywhere yet in `app/api/endpoints.ts`, `app/api/services.ts`, `app/page.tsx`, `app/hooks/useHazardDataFetcher.ts`, `app/components/address-mapper.tsx`, `app/components/map.tsx`, `app/data/data.ts`, or `styles/theme.ts`.
- `card-hazard.tsx` / `mobile-card-hazard.tsx` iterate generically over `Hazards` / `PillData` / `LayerIds` (confirmed via `LayerIds[num]` indexing) — no code changes needed there.

---

### Task 1: Register `LandslideZone` in `init_db.py`

**Files:**
- Modify: `backend/database/init_db.py:68,81`
- Test: `backend/database/tests/test_init_db.py` (new file)

- [ ] **Step 1: Write the failing test**

```python
# backend/database/tests/test_init_db.py
from backend.database.init_db import table_classes
from backend.api.models.landslide_zones import LandslideZone
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty


def test_table_classes_includes_all_four_hazard_tables():
    assert set(table_classes) == {
        TsunamiZone,
        LiquefactionZone,
        SoftStoryProperty,
        LandslideZone,
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/database/tests/test_init_db.py -v`
Expected: FAIL — `assert {<class 'TsunamiZone'>, <class 'LiquefactionZone'>, <class 'SoftStoryProperty'>} == {...LandslideZone}` (missing `LandslideZone`).

- [ ] **Step 3: Update `table_classes` and remove the stale exclusion comment**

In `backend/database/init_db.py`, change:

```python
table_classes = [TsunamiZone, LiquefactionZone, SoftStoryProperty]


def check_tables_exist():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    for table in table_classes:
        if table.__tablename__ not in tables:
            return False
    return True


# LandslideZone is not being used, and isn't included in this check.
def check_tables_empty():
```

to:

```python
table_classes = [TsunamiZone, LiquefactionZone, SoftStoryProperty, LandslideZone]


def check_tables_exist():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    for table in table_classes:
        if table.__tablename__ not in tables:
            return False
    return True


def check_tables_empty():
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/database/tests/test_init_db.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/database/init_db.py backend/database/tests/test_init_db.py
git commit -m "feat: register landslide_zones table in init_db table_classes"
```

---

### Task 2: Add `InLandslideZoneView` schema

**Files:**
- Modify: `backend/api/schemas/landslide_schemas.py`

There's no standalone test for this step (it's a plain Pydantic model); it's exercised by Task 3's endpoint tests. This task just adds the model so Task 3 can import it.

- [ ] **Step 1: Add `Optional` to the typing import and append the new view model**

In `backend/api/schemas/landslide_schemas.py`, change line 5 from:

```python
from typing import List
```

to:

```python
from typing import List, Optional
```

Then append at the end of the file (after `LandslideFeatureCollection`):

```python
class InLandslideZoneView(BaseModel):
    """
    Pydantic View model for landslide zone check endpoint.

    Attributes:
        exists (bool): Whether the point is in a high-susceptibility landslide zone.
        last_updated (Optional[datetime]): Timestamp of last update if exists.
        gridcode (Optional[int]): Gridcode of the matched zone (8, 9, or 10).
    """

    exists: bool
    last_updated: Optional[datetime] = None
    gridcode: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
```

- [ ] **Step 2: Commit**

```bash
git add backend/api/schemas/landslide_schemas.py
git commit -m "feat: add InLandslideZoneView schema for landslide point lookups"
```

---

### Task 3: Add `is-in-landslide-zone` endpoint to `landslide_api.py`

**Files:**
- Modify: `backend/api/routers/landslide_api.py`
- Test: `backend/api/tests/test_landslide.py` (new file)

- [ ] **Step 1: Write the failing tests**

```python
# backend/api/tests/test_landslide.py
from backend.api.tests.test_session_config import test_engine, test_session, client
import logging
from .utils import assert_database_error_returns_500


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_get_landslide_zones(client):
    """GET /landslide-zones/ returns only gridcode 8/9/10 zones"""
    response = client.get("/landslide-zones/")
    response_dict = response.json()
    logger.info(f"Response: {response_dict}")

    assert (
        response.status_code == 200
    ), f"Expected status code 200, but got {response.status_code}"
    assert len(response_dict["features"]) == 2
    gridcodes = {f["properties"]["gridcode"] for f in response_dict["features"]}
    assert gridcodes == {8, 10}


def test_is_in_landslide_zone(client, caplog):
    """Test high-susceptibility landslide zone check with logging verification"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.43, 37.72]
    response = client.get(
        f"/landslide-zones/is-in-landslide-zone?lon={lon}&lat={lat}"
    )

    assert response.status_code == 200
    json = response.json()
    assert json["exists"]
    assert json["last_updated"] is not None
    assert json["gridcode"] == 10
    assert (
        f"Checking landslide zone for coordinates: lon={lon}, lat={lat}"
        in caplog.text
    )
    assert "Landslide zone check result" in caplog.text
    assert f"exists: {json['exists']}" in caplog.text


def test_is_in_landslide_zone_excludes_low_gridcode(client, caplog):
    """A point only inside a low-gridcode (non-hazardous) zone should not match"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.32, 37.88]
    response = client.get(
        f"/landslide-zones/is-in-landslide-zone?lon={lon}&lat={lat}"
    )

    assert response.status_code == 200
    json = response.json()
    assert not json["exists"]
    assert json["last_updated"] is None
    assert json["gridcode"] is None


def test_outside_landslide_zones(client, caplog):
    """Test outside all landslide zones with logging verification"""
    caplog.set_level(logging.INFO)

    wrong_lon, wrong_lat = [0.0, 0.0]
    response = client.get(
        f"/landslide-zones/is-in-landslide-zone?lon={wrong_lon}&lat={wrong_lat}"
    )

    assert response.status_code == 200
    json = response.json()
    assert not json["exists"]
    assert json["last_updated"] is None
    assert (
        f"Checking landslide zone for coordinates: lon={wrong_lon}, lat={wrong_lat}"
        in caplog.text
    )
    assert "exists: False" in caplog.text


def test_is_in_landslide_zone_ping(client, caplog):
    caplog.set_level(logging.INFO)

    response = client.get("/landslide-zones/is-in-landslide-zone?ping=true")

    assert response.status_code == 200
    json = response.json()
    assert json == {"exists": False, "last_updated": None, "gridcode": None}
    assert "Pinging the is-in-landslide-zone endpoint" in caplog.text


def test_is_in_landslide_zone_missing_params(client, caplog):
    caplog.set_level(logging.WARN)
    response = client.get(
        "/landslide-zones/is-in-landslide-zone", params={"lon": -122.424968}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get(
        "/landslide-zones/is-in-landslide-zone", params={"lat": 37.76293}
    )
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text

    response = client.get("/landslide-zones/is-in-landslide-zone")
    assert response.status_code == 400
    assert "Missing coordinates in non-ping request" in caplog.text


def test_is_in_landslide_zone_database_error_returns_500(client, caplog):
    assert_database_error_returns_500(
        client,
        caplog,
        "/landslide-zones/is-in-landslide-zone?lon=0&lat=0",
        "Error checking landslide status",
    )
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest backend/api/tests/test_landslide.py -v`
Expected: FAIL — `test_get_landslide_zones` fails on 404 (router unregistered — this will actually be fixed by Task 4, so re-run after Task 4 too), and all the `is-in-landslide-zone` tests fail with 404 since the route doesn't exist yet.

- [ ] **Step 3: Add the endpoint**

In `backend/api/routers/landslide_api.py`, change the imports from:

```python
"""Router to handle landslide-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from backend.database.session import get_db
from ..schemas.landslide_schemas import (
    LandslideFeature,
    LandslideFeatureCollection,
)
from backend.api.models.landslide_zones import LandslideZone
```

to:

```python
"""Router to handle landslide-related API endpoints"""

from fastapi import Depends, HTTPException, APIRouter, Query
from typing import Optional
from ..tags import Tags
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from backend.database.session import get_db
from ..schemas.landslide_schemas import (
    LandslideFeature,
    InLandslideZoneView,
    LandslideFeatureCollection,
)
from backend.api.models.landslide_zones import LandslideZone
from backend.api.exceptions import HazardCheckError
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
```

Then append this endpoint at the end of the file (after `get_landslide_zones`):

```python
@router.get("/is-in-landslide-zone", response_model=InLandslideZoneView)
def is_in_landslide_zone(
    lon: Optional[float] = Query(None),
    lat: Optional[float] = Query(None),
    ping: bool = False,
    db: Session = Depends(get_db),
):
    """
    Check if a point is in a high-susceptibility landslide zone
    (gridcode 8, 9, or 10).

    Args:
        lon (Optional[float]): Longitude of the point.
        lat (Optional[float]): Latitude of the point.
        ping (bool): Optional ping parameter, used to reduce cold starts.
        db (Session): The database session dependency.

    Returns:
        InLandslideZoneView: Whether the point is in a hazardous landslide
        zone, its last update time, and its gridcode.

    Raises:
        HTTPException: 400 if lon/lat are missing and ping is not true.
        HazardCheckError: If the database query fails.
    """
    if ping:
        logger.info("Pinging the is-in-landslide-zone endpoint")
        return InLandslideZoneView(
            exists=False, last_updated=None, gridcode=None
        )  # skip DB call

    if lon is None or lat is None:
        logger.warning("Missing coordinates in non-ping request")
        raise HTTPException(
            status_code=400,
            detail="Both 'lon' and 'lat' must be provided unless ping=true",
        )

    logger.info(f"Checking landslide zone for coordinates: lon={lon}, lat={lat}")

    try:
        point = from_shape(Point(lon, lat), srid=4326)
        zone = (
            db.query(LandslideZone)
            .filter(LandslideZone.gridcode.in_([8, 9, 10]))
            .filter(LandslideZone.geometry.ST_Intersects(point))
            .first()
        )
        exists = zone is not None
        last_updated = zone.update_timestamp if zone else None
        gridcode = zone.gridcode if zone else None

        logger.info(
            f"Landslide zone check result for coordinates: lon={lon}, lat={lat} - "
            f"exists: {exists}, "
            f"last_updated: {last_updated}, "
            f"gridcode: {gridcode}"
        )

        return InLandslideZoneView(
            exists=exists, last_updated=last_updated, gridcode=gridcode
        )

    except Exception as e:
        raise HazardCheckError(
            zone="landslide", lon=lon, lat=lat, original_exception=e
        )
```

- [ ] **Step 4: Run tests to verify they pass**

These tests also need the router registered (Task 4) to pass fully — do Task 4 immediately after this step, then run:

Run: `pytest backend/api/tests/test_landslide.py -v`
Expected: PASS (all 7 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/api/routers/landslide_api.py backend/api/tests/test_landslide.py
git commit -m "feat: add is-in-landslide-zone point lookup endpoint"
```

---

### Task 4: Register `landslide_api` router in `api/index.py`

**Files:**
- Modify: `api/index.py`

- [ ] **Step 1: Add the import and router registration**

In `api/index.py`, change:

```python
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
    hazard_lookup_api,
)
```

to:

```python
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
    hazard_lookup_api,
    landslide_api,
)
```

And change:

```python
app.include_router(liquefaction_api.router)
app.include_router(tsunami_api.router)
app.include_router(soft_story_api.router)
app.include_router(health_api.router)
app.include_router(hazard_lookup_api.router)
```

to:

```python
app.include_router(liquefaction_api.router)
app.include_router(tsunami_api.router)
app.include_router(soft_story_api.router)
app.include_router(health_api.router)
app.include_router(hazard_lookup_api.router)
app.include_router(landslide_api.router)
```

- [ ] **Step 2: Run the full Task 3 test file to confirm the endpoint is now reachable**

Run: `pytest backend/api/tests/test_landslide.py -v`
Expected: PASS (all 7 tests, including `test_get_landslide_zones` which previously 404'd)

- [ ] **Step 3: Run the full backend test suite to check for regressions**

Run: `pytest backend/ -v`
Expected: PASS (no other test should be affected by adding a router)

- [ ] **Step 4: Commit**

```bash
git add api/index.py
git commit -m "feat: register landslide_api router in the FastAPI app"
```

---

### Task 5: Extend the composite `/api/hazards/lookup` endpoint with landslide

**Files:**
- Modify: `backend/api/routers/hazard_lookup_api.py`
- Modify: `backend/api/schemas/hazard_lookup_schemas.py`
- Modify: `backend/api/tests/test_hazard_lookup.py`

- [ ] **Step 1: Write the failing tests**

Add these tests to `backend/api/tests/test_hazard_lookup.py` (after the existing tests):

```python
def test_lookup_hazards_includes_landslide_high_susceptibility(client, caplog):
    """A point in a high-susceptibility (gridcode 10) landslide zone reports landslide.exists=True"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.43, 37.72]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["landslide"]["exists"] is True
    assert body["landslide"]["last_updated"] is not None


def test_lookup_hazards_landslide_excludes_low_gridcode(client, caplog):
    """A point only inside a low-gridcode (non-hazardous) landslide zone reports landslide.exists=False"""
    caplog.set_level(logging.INFO)

    lon, lat = [-122.32, 37.88]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()

    assert body["landslide"]["exists"] is False
    assert body["landslide"]["last_updated"] is None


def test_lookup_hazards_none_present_includes_landslide(client, caplog):
    """Regression check: outside every hazard, landslide is also false"""
    caplog.set_level(logging.INFO)

    lon, lat = [0.0, 0.0]
    response = client.get(f"api/hazards/lookup?lon={lon}&lat={lat}")

    assert response.status_code == 200
    body = response.json()
    assert body["landslide"] == {"exists": False, "last_updated": None}


def test_lookup_hazards_ping_includes_landslide(client, caplog):
    caplog.set_level(logging.INFO)

    response = client.get("api/hazards/lookup?ping=true")

    assert response.status_code == 200
    body = response.json()
    assert body["landslide"] == {"exists": False, "last_updated": None}
```

Also update the existing `test_lookup_hazards_none_present` and `test_lookup_hazards_ping` assertions to include `landslide` in the exact dict comparisons, since those endpoints will now return a `landslide` key that isn't in the current expected dicts — otherwise they'll fail on an unexpected extra key... Pydantic response models don't fail on this (the response will just include the new field), but since those two tests use direct dict equality (`body["soft_story"] == {...}` style per-key checks rather than whole-body equality), no change is required there. Confirm by reading the current file before editing — only add the four new tests above.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest backend/api/tests/test_hazard_lookup.py -v`
Expected: FAIL on the four new tests — `KeyError: 'landslide'` (field doesn't exist on `CompositeHazardResponse` yet).

- [ ] **Step 3: Add the `landslide` field to the schema**

In `backend/api/schemas/hazard_lookup_schemas.py`, change:

```python
class CompositeHazardResponse(BaseModel):
    """
    Pydantic model for the composite hazard lookup response, combining the
    status of all supported hazard types for a single location.

    Attributes:
        soft_story (HazardStatus): Soft story hazard status.
        liquefaction (HazardStatus): Liquefaction hazard status.
        tsunami (HazardStatus): Tsunami hazard status.
    """

    soft_story: HazardStatus
    liquefaction: HazardStatus
    tsunami: HazardStatus
```

to:

```python
class CompositeHazardResponse(BaseModel):
    """
    Pydantic model for the composite hazard lookup response, combining the
    status of all supported hazard types for a single location.

    Attributes:
        soft_story (HazardStatus): Soft story hazard status.
        liquefaction (HazardStatus): Liquefaction hazard status.
        tsunami (HazardStatus): Tsunami hazard status.
        landslide (HazardStatus): Landslide hazard status.
    """

    soft_story: HazardStatus
    liquefaction: HazardStatus
    tsunami: HazardStatus
    landslide: HazardStatus
```

- [ ] **Step 4: Add the `_check_landslide` helper and wire it into `lookup_hazards`**

In `backend/api/routers/hazard_lookup_api.py`, change the imports from:

```python
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.tsunami import TsunamiZone
```

to:

```python
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.tsunami import TsunamiZone
from backend.api.models.landslide_zones import LandslideZone
```

Add this helper after `_check_tsunami`:

```python
def _check_landslide(db: Session, point: WKBElement) -> HazardStatus:
    """Check whether a point is in a high-susceptibility (gridcode 8, 9, or 10) landslide zone."""
    zone = (
        db.query(LandslideZone)
        .filter(LandslideZone.gridcode.in_([8, 9, 10]))
        .filter(LandslideZone.geometry.ST_Intersects(point))
        .first()
    )
    return HazardStatus(
        exists=zone is not None,
        last_updated=zone.update_timestamp if zone else None,
    )
```

Change the `ping=true` dummy response from:

```python
    if ping:
        logger.info("Pinging the hazards lookup endpoint")
        return CompositeHazardResponse(
            soft_story=EMPTY_HAZARD_STATUS,
            liquefaction=EMPTY_HAZARD_STATUS,
            tsunami=EMPTY_HAZARD_STATUS,
        )
```

to:

```python
    if ping:
        logger.info("Pinging the hazards lookup endpoint")
        return CompositeHazardResponse(
            soft_story=EMPTY_HAZARD_STATUS,
            liquefaction=EMPTY_HAZARD_STATUS,
            tsunami=EMPTY_HAZARD_STATUS,
            landslide=EMPTY_HAZARD_STATUS,
        )
```

Change the real response block from:

```python
        soft_story_status = _check_soft_story(db, point)
        liquefaction_status = _check_liquefaction(db, point)
        tsunami_status = _check_tsunami(db, point)

        logger.info(
            f"Composite hazard check result for coordinates: lon={lon}, lat={lat} - "
            f"soft_story exists: {soft_story_status.exists}, "
            f"liquefaction exists: {liquefaction_status.exists}, "
            f"tsunami exists: {tsunami_status.exists}"
        )

        return CompositeHazardResponse(
            soft_story=soft_story_status,
            liquefaction=liquefaction_status,
            tsunami=tsunami_status,
        )
```

to:

```python
        soft_story_status = _check_soft_story(db, point)
        liquefaction_status = _check_liquefaction(db, point)
        tsunami_status = _check_tsunami(db, point)
        landslide_status = _check_landslide(db, point)

        logger.info(
            f"Composite hazard check result for coordinates: lon={lon}, lat={lat} - "
            f"soft_story exists: {soft_story_status.exists}, "
            f"liquefaction exists: {liquefaction_status.exists}, "
            f"tsunami exists: {tsunami_status.exists}, "
            f"landslide exists: {landslide_status.exists}"
        )

        return CompositeHazardResponse(
            soft_story=soft_story_status,
            liquefaction=liquefaction_status,
            tsunami=tsunami_status,
            landslide=landslide_status,
        )
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pytest backend/api/tests/test_hazard_lookup.py -v`
Expected: PASS (all tests, including the four new ones)

- [ ] **Step 6: Run the full backend test suite**

Run: `pytest backend/ -v`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/api/routers/hazard_lookup_api.py backend/api/schemas/hazard_lookup_schemas.py backend/api/tests/test_hazard_lookup.py
git commit -m "feat: add landslide to the composite hazard lookup endpoint"
```

---

### Task 6: ETL unit test for `LandslideDataHandler.parse_data`

**Files:**
- Test: `backend/etl/tests/test_landslide_data_handler.py` (new file)

`LandslideDataHandler` has no Mapbox dependency (unlike soft story), so this test is simpler than `test_soft_story_properties_data_handler.py`: instantiate the handler directly and call `parse_data()` on a small in-memory GeoJSON fixture.

- [ ] **Step 1: Write the failing test**

```python
# backend/etl/tests/test_landslide_data_handler.py
import pytest
from backend.etl.landslide_data_handler import LandslideDataHandler
from backend.api.models.landslide_zones import LandslideZone


@pytest.fixture
def handler():
    return LandslideDataHandler(url="dummy_url", table=LandslideZone)


SAMPLE_GEOJSON = {
    "features": [
        {
            "type": "Feature",
            "properties": {
                "objectid": "42",
                "gridcode": "8",
                "sum_shape_": 1234.5,
                "shape_leng": 25.8,
                "shape_le_1": 12.0,
                "shape_area": 999.9,
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [-122.5, 37.7],
                            [-122.5, 37.8],
                            [-122.4, 37.8],
                            [-122.4, 37.7],
                            [-122.5, 37.7],
                        ]
                    ]
                ],
            },
        }
    ]
}


def test_parse_data_maps_fields(handler):
    parsed_data, geojson = handler.parse_data(SAMPLE_GEOJSON)

    assert len(parsed_data) == 1
    record = parsed_data[0]

    assert record["identifier"] == 42
    assert record["gridcode"] == 8
    assert record["sum_shape"] == 1234.5
    assert record["shape_length"] == 25.8
    assert record["shape_length_1"] == 12.0
    assert record["shape_area"] == 999.9
    # geometry is converted to a GeoAlchemy WKBElement, not the raw dict
    assert record["geometry"] is not None


def test_parse_data_returns_geojson_feature_collection(handler):
    _, geojson = handler.parse_data(SAMPLE_GEOJSON)

    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 1
    assert geojson["features"][0]["geometry"] == SAMPLE_GEOJSON["features"][0]["geometry"]


def test_parse_data_multiple_features(handler):
    two_feature_geojson = {
        "features": SAMPLE_GEOJSON["features"] * 2,
    }
    # give the second feature a distinct id so it isn't a duplicate
    two_feature_geojson["features"][1] = {
        **two_feature_geojson["features"][1],
        "properties": {
            **two_feature_geojson["features"][1]["properties"],
            "objectid": "43",
            "gridcode": "3",
        },
    }

    parsed_data, geojson = handler.parse_data(two_feature_geojson)

    assert len(parsed_data) == 2
    assert {r["identifier"] for r in parsed_data} == {42, 43}
    assert {r["gridcode"] for r in parsed_data} == {8, 3}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/etl/tests/test_landslide_data_handler.py -v`
Expected: This should actually mostly PASS immediately since `LandslideDataHandler.parse_data` already exists and is fully implemented — this task is a pure regression-test addition, not a TDD-driven code change. Run it to confirm; if any assertion fails, it means the field-mapping assumptions in this plan (Task written from reading `backend/etl/landslide_data_handler.py`) don't match reality, and the test (not the handler) should be corrected to match actual behavior.

- [ ] **Step 3: No implementation change expected**

If Step 2 passed outright, skip to Step 4. If something failed, inspect the actual `parse_data` output via `python -c` or a debugger and adjust the test's expectations (not the handler) unless the mismatch reveals an actual bug, in which case flag it separately rather than silently patching within this task.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/etl/tests/test_landslide_data_handler.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/etl/tests/test_landslide_data_handler.py
git commit -m "test: add unit tests for LandslideDataHandler.parse_data"
```

---

### Task 7: Manual ETL smoke test against the live DataSF endpoint

This is a manual verification step, not an automated test — it exists to catch schema drift in the live `bna4-itif.geojson` Socrata dataset before merging (per the design spec's testing section).

- [ ] **Step 1: Run the handler against the live endpoint in a dev environment**

```bash
docker exec -it datasci-earthquake-backend-1 python backend/etl/landslide_data_handler.py
```

Expected: no exceptions; a `LandslideZone.geojson` file appears under the configured `public/data/` (or CDN-configured) path, and rows are inserted into the local `landslide_zones` table without errors.

- [ ] **Step 2: Spot-check the DB**

```bash
docker exec -it datasci-earthquake-db-1 psql -U <user> -d <db> -c "select count(*), gridcode from landslide_zones group by gridcode order by gridcode;"
```

Expected: nonzero counts across a range of gridcodes including 8, 9, 10; confirms `objectid`/`gridcode`/`sum_shape_`/`shape_leng`/`shape_le_1`/`shape_area` field mapping in `parse_data()` still lines up with the live Socrata schema. If any field comes back `NULL` unexpectedly, DataSF has renamed/dropped a column — fix `backend/etl/landslide_data_handler.py`'s `parse_data()` mapping before proceeding, and re-run Task 6's tests.

No commit — this is a verification step only.

---

### Task 8: Add landslide theme color token

**Files:**
- Modify: `styles/theme.ts:191`

- [ ] **Step 1: Add the placeholder color token**

In `styles/theme.ts`, change:

```typescript
    blueBackground: { value: "#2C5282" }, // blue/700
    tsunamiBlue: { value: "#63B3ED" }, // blue/300
```

to:

```typescript
    blueBackground: { value: "#2C5282" }, // blue/700
    tsunamiBlue: { value: "#63B3ED" }, // blue/300
    landslideBrown: { value: "#B7791F" }, // brown/700 (placeholder, pending design review)
```

- [ ] **Step 2: Commit**

```bash
git add styles/theme.ts
git commit -m "feat: add placeholder landslide theme color token"
```

---

### Task 9: Add landslide endpoints and fetch service

**Files:**
- Modify: `app/api/endpoints.ts`
- Modify: `app/api/services.ts`

- [ ] **Step 1: Add endpoint constants**

In `app/api/endpoints.ts`, change:

```typescript
export const API_ENDPOINTS = {
  softStories: `${API_URL}/soft-stories`,
  tsunami: `${API_URL}/tsunami-zones`,
  liquefaction: `${API_URL}/liquefaction-zones`,
  isSoftStory: `${API_URL}/soft-stories/is-soft-story`,
  isInTsunamiZone: `${API_URL}/tsunami-zones/is-in-tsunami-zone`,
  isInLiquefactionZone: `${API_URL}/liquefaction-zones/is-in-liquefaction-zone`,
};

export const CDN_ENDPOINTS = {
  softStories: `${CDN_URL}/SoftStoryProperty.geojson`,
  tsunami: `${CDN_URL}/TsunamiZone.geojson`,
  liquefaction: `${CDN_URL}/LiquefactionZone.geojson`,
};
```

to:

```typescript
export const API_ENDPOINTS = {
  softStories: `${API_URL}/soft-stories`,
  tsunami: `${API_URL}/tsunami-zones`,
  liquefaction: `${API_URL}/liquefaction-zones`,
  landslide: `${API_URL}/landslide-zones`,
  isSoftStory: `${API_URL}/soft-stories/is-soft-story`,
  isInTsunamiZone: `${API_URL}/tsunami-zones/is-in-tsunami-zone`,
  isInLiquefactionZone: `${API_URL}/liquefaction-zones/is-in-liquefaction-zone`,
  isInLandslideZone: `${API_URL}/landslide-zones/is-in-landslide-zone`,
};

export const CDN_ENDPOINTS = {
  softStories: `${CDN_URL}/SoftStoryProperty.geojson`,
  tsunami: `${CDN_URL}/TsunamiZone.geojson`,
  liquefaction: `${CDN_URL}/LiquefactionZone.geojson`,
  landslide: `${CDN_URL}/LandslideZone.geojson`,
};
```

- [ ] **Step 2: Add the fetch service**

In `app/api/services.ts`, change:

```typescript
export const fetchLiquefaction = async () =>
  fetchData(CDN_ENDPOINTS.liquefaction, API_ENDPOINTS.liquefaction);
```

to:

```typescript
export const fetchLiquefaction = async () =>
  fetchData(CDN_ENDPOINTS.liquefaction, API_ENDPOINTS.liquefaction);

export const fetchLandslide = async () =>
  fetchData(CDN_ENDPOINTS.landslide, API_ENDPOINTS.landslide);
```

- [ ] **Step 3: Commit**

```bash
git add app/api/endpoints.ts app/api/services.ts
git commit -m "feat: add landslide API endpoints and fetch service"
```

---

### Task 10: Fetch landslide data in `page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import**

Change:

```tsx
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";
```

to:

```tsx
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
  fetchLandslide,
} from "./api/services";
```

- [ ] **Step 2: Add the default value and include it in the `Promise.all`**

Change:

```tsx
  let liquefactionData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };

  try {
    [softStoryData, tsunamiData, liquefactionData] = await Promise.all([
      fetchSoftStories(),
      fetchTsunami(),
      fetchLiquefaction(),
    ]);
  } catch (error: any) {
    console.error("Error: ", error);
  }
```

to:

```tsx
  let liquefactionData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };
  let landslideData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };

  try {
    [softStoryData, tsunamiData, liquefactionData, landslideData] =
      await Promise.all([
        fetchSoftStories(),
        fetchTsunami(),
        fetchLiquefaction(),
        fetchLandslide(),
      ]);
  } catch (error: any) {
    console.error("Error: ", error);
  }
```

- [ ] **Step 3: Pass the prop down**

Change:

```tsx
        <AddressMapper
          softStoryData={softStoryData}
          tsunamiData={tsunamiData}
          liquefactionData={liquefactionData}
        />
```

to:

```tsx
        <AddressMapper
          softStoryData={softStoryData}
          tsunamiData={tsunamiData}
          liquefactionData={liquefactionData}
          landslideData={landslideData}
        />
```

- [ ] **Step 4: Commit**

(Combine with Task 11's commit since `AddressMapperProps` must accept the new prop before this compiles — see Task 11.)

---

### Task 11: Add `landslideData` prop through `useHazardDataFetcher` and `AddressMapper`

**Files:**
- Modify: `app/hooks/useHazardDataFetcher.ts`
- Modify: `app/components/address-mapper.tsx`
- Test: `app/components/__tests__/address-mapper.test.tsx`

- [ ] **Step 1: Write the failing test**

In `app/components/__tests__/address-mapper.test.tsx`, change:

```tsx
const mockProps = {
  softStoryData: mockFeatureCollection,
  tsunamiData: mockFeatureCollection,
  liquefactionData: mockFeatureCollection,
};
```

to:

```tsx
const mockProps = {
  softStoryData: mockFeatureCollection,
  tsunamiData: mockFeatureCollection,
  liquefactionData: mockFeatureCollection,
  landslideData: mockFeatureCollection,
};
```

And update both mock hazard-data objects used in the existing tests, e.g. change:

```tsx
    const mockData = { softStory: "data", tsunami: null, liquefaction: "data" };
```

(both occurrences, one per test) to:

```tsx
    const mockData = {
      softStory: "data",
      tsunami: null,
      liquefaction: "data",
      landslide: "data",
    };
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest app/components/__tests__/address-mapper.test.tsx`
Expected: FAIL — TypeScript will not fail a Jest run by default, but the "should fetch data when loaded with URL parameters" test's `toHaveTextContent(JSON.stringify(mockData))` assertion will fail since `AddressMapper`/`useHazardDataFetcher` don't yet pass `landslide` through, so the rendered `mobile-report-hazards` mock's `addressHazardData` prop won't include it — actually, since `addressHazardData` is just whatever `fetchHazardData` (mocked) resolves to, and the mock is directly injected via `fetchHazardDataMock.mockResolvedValue(mockData)`, this particular assertion will actually still pass regardless of production code changes (it doesn't exercise the real `useHazardDataFetcher`). The real regression coverage for `useHazardDataFetcher` itself is Step 3 below — add it as a new dedicated unit test rather than relying on the mocked integration test.

Create `app/hooks/__tests__/useHazardDataFetcher.test.ts`:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useHazardDataFetcher } from "../useHazardDataFetcher";

jest.mock("@/components/ui/toaster", () => ({
  toaster: { create: jest.fn(), isVisible: jest.fn(() => false) },
}));

const originalFetch = global.fetch;

describe("useHazardDataFetcher", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("includes landslide in the fetched hazard data", async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      const isLandslide = url.includes("is-in-landslide-zone");
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            isLandslide
              ? { exists: true, last_updated: null, gridcode: 10 }
              : { exists: false, last_updated: null }
          ),
      });
    }) as jest.Mock;

    const setSearchComplete = jest.fn();
    const setHazardDataLoading = jest.fn();
    const { result } = renderHook(() =>
      useHazardDataFetcher({ setSearchComplete, setHazardDataLoading })
    );

    let data: any;
    await act(async () => {
      data = await result.current.fetchHazardData([-122.43, 37.72]);
    });

    expect(data.landslide).toEqual({
      exists: true,
      last_updated: null,
      gridcode: 10,
    });
  });
});
```

Run: `npx jest app/hooks/__tests__/useHazardDataFetcher.test.ts`
Expected: FAIL — `data.landslide` is `undefined` since `useHazardDataFetcher` doesn't fetch it yet.

- [ ] **Step 3: Wire landslide into `useHazardDataFetcher.ts`**

Change:

```typescript
        const [softStory, tsunamiZone, liquefactionZone] =
          await Promise.allSettled([
            safeJsonFetch(buildUrl(API_ENDPOINTS.isSoftStory)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInTsunamiZone)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInLiquefactionZone)),
          ]);

        setSearchComplete(true);

        const failed = [
          { name: "Soft Story", result: softStory },
          { name: "Tsunami", result: tsunamiZone },
          { name: "Liquefaction", result: liquefactionZone },
        ].filter(({ result }) => result.status === "rejected");
```

to:

```typescript
        const [softStory, tsunamiZone, liquefactionZone, landslideZone] =
          await Promise.allSettled([
            safeJsonFetch(buildUrl(API_ENDPOINTS.isSoftStory)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInTsunamiZone)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInLiquefactionZone)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInLandslideZone)),
          ]);

        setSearchComplete(true);

        const failed = [
          { name: "Soft Story", result: softStory },
          { name: "Tsunami", result: tsunamiZone },
          { name: "Liquefaction", result: liquefactionZone },
          { name: "Landslide", result: landslideZone },
        ].filter(({ result }) => result.status === "rejected");
```

And change:

```typescript
        return {
          softStory: softStory.status === "fulfilled" ? softStory.value : null,
          tsunami:
            tsunamiZone.status === "fulfilled" ? tsunamiZone.value : null,
          liquefaction:
            liquefactionZone.status === "fulfilled"
              ? liquefactionZone.value
              : null,
        };
```

to:

```typescript
        return {
          softStory: softStory.status === "fulfilled" ? softStory.value : null,
          tsunami:
            tsunamiZone.status === "fulfilled" ? tsunamiZone.value : null,
          liquefaction:
            liquefactionZone.status === "fulfilled"
              ? liquefactionZone.value
              : null,
          landslide:
            landslideZone.status === "fulfilled" ? landslideZone.value : null,
        };
```

- [ ] **Step 4: Run the new hook test to verify it passes**

Run: `npx jest app/hooks/__tests__/useHazardDataFetcher.test.ts`
Expected: PASS

- [ ] **Step 5: Add `landslideData` to `AddressMapperProps` and wire it through**

In `app/components/address-mapper.tsx`, change:

```tsx
const toggledStatesDefaults = [true, true, true];
```

to:

```tsx
const toggledStatesDefaults = [true, true, true, true];
```

Change:

```tsx
interface AddressMapperProps {
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
}
```

to:

```tsx
interface AddressMapperProps {
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
  landslideData: FeatureCollection<Geometry>;
}
```

Change:

```tsx
const AddressMapper: React.FC<AddressMapperProps> = ({
  softStoryData,
  tsunamiData,
  liquefactionData,
}) => {
```

to:

```tsx
const AddressMapper: React.FC<AddressMapperProps> = ({
  softStoryData,
  tsunamiData,
  liquefactionData,
  landslideData,
}) => {
```

Change the error-toast fallback object:

```tsx
        setAddressHazardData({
          softStory: null,
          tsunami: null,
          liquefaction: null,
        });
```

to:

```tsx
        setAddressHazardData({
          softStory: null,
          tsunami: null,
          liquefaction: null,
          landslide: null,
        });
```

Change the `sources` list and its `useEffect` dependency array:

```tsx
    const sources = [
      { name: "Soft Story Buildings", data: softStoryData },
      { name: "Tsunami Zones", data: tsunamiData },
      { name: "Liquefaction Zones", data: liquefactionData },
    ];
```

to:

```tsx
    const sources = [
      { name: "Soft Story Buildings", data: softStoryData },
      { name: "Tsunami Zones", data: tsunamiData },
      { name: "Liquefaction Zones", data: liquefactionData },
      { name: "Landslide Zones", data: landslideData },
    ];
```

and:

```tsx
  }, [softStoryData, tsunamiData, liquefactionData]);
```

to:

```tsx
  }, [softStoryData, tsunamiData, liquefactionData, landslideData]);
```

Finally, pass the prop to `<Map>`:

```tsx
          <Map
            lon={lon}
            lat={lat}
            address={initialAddress}
            softStoryData={softStoryData}
            tsunamiData={tsunamiData}
            liquefactionData={liquefactionData}
            layerToggleObj={layerToggleObj}
          />
```

to:

```tsx
          <Map
            lon={lon}
            lat={lat}
            address={initialAddress}
            softStoryData={softStoryData}
            tsunamiData={tsunamiData}
            liquefactionData={liquefactionData}
            landslideData={landslideData}
            layerToggleObj={layerToggleObj}
          />
```

- [ ] **Step 6: Run the address-mapper test to verify it passes**

Run: `npx jest app/components/__tests__/address-mapper.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit (includes Task 10's page.tsx change, since they don't compile independently)**

```bash
git add app/page.tsx app/hooks/useHazardDataFetcher.ts app/hooks/__tests__/useHazardDataFetcher.test.ts app/components/address-mapper.tsx app/components/__tests__/address-mapper.test.tsx
git commit -m "feat: plumb landslide hazard data through page, fetcher, and AddressMapper"
```

---

### Task 12: Add the landslide map layer

**Files:**
- Modify: `app/components/map.tsx`

- [ ] **Step 1: Add `landslideData` to `MapProps` and the component signature**

Change:

```tsx
interface MapProps {
  lon: number;
  lat: number;
  address: string | null;
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
  layerToggleObj: LayerToggleObjProps;
}
```

to:

```tsx
interface MapProps {
  lon: number;
  lat: number;
  address: string | null;
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
  landslideData: FeatureCollection<Geometry>;
  layerToggleObj: LayerToggleObjProps;
}
```

Change:

```tsx
const Map: React.FC<MapProps> = ({
  lon,
  lat,
  address,
  softStoryData,
  tsunamiData,
  liquefactionData,
  layerToggleObj,
}: MapProps) => {
```

to:

```tsx
const Map: React.FC<MapProps> = ({
  lon,
  lat,
  address,
  softStoryData,
  tsunamiData,
  liquefactionData,
  landslideData,
  layerToggleObj,
}: MapProps) => {
```

- [ ] **Step 2: Add the source and layer**

Change:

```tsx
        map.addSource("seismic", { type: "geojson", data: liquefactionData });

        map.addSource("tsunami", { type: "geojson", data: tsunamiData });

        map.addSource("soft-stories", { type: "geojson", data: softStoryData });
```

to:

```tsx
        map.addSource("seismic", { type: "geojson", data: liquefactionData });

        map.addSource("tsunami", { type: "geojson", data: tsunamiData });

        map.addSource("soft-stories", { type: "geojson", data: softStoryData });

        map.addSource("landslide", { type: "geojson", data: landslideData });
```

Change:

```tsx
        map.addLayer({
          id: "softStoriesLayer",
          source: "soft-stories",
          type: "circle",
          slot: "middle",
          paint: {
            "circle-radius": 4.5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF",
            "circle-color": "#A0AEC0", // gray/400
          },
        });

        map.on("error", (e) => {
```

to:

```tsx
        map.addLayer({
          id: "softStoriesLayer",
          source: "soft-stories",
          type: "circle",
          slot: "middle",
          paint: {
            "circle-radius": 4.5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF",
            "circle-color": "#A0AEC0", // gray/400
          },
        });

        map.addLayer({
          id: "landslideLayer",
          source: "landslide",
          type: "fill",
          slot: "middle",
          paint: {
            "fill-color": "#B7791F", // brown/700 (placeholder, pending design review)
            "fill-opacity": 0.4,
          },
        });

        map.on("error", (e) => {
```

- [ ] **Step 3: Add `landslideData` to the `useEffect` dependency array**

Change:

```tsx
  }, [lon, lat, address, liquefactionData, softStoryData, tsunamiData]);
```

to:

```tsx
  }, [
    lon,
    lat,
    address,
    liquefactionData,
    softStoryData,
    tsunamiData,
    landslideData,
  ]);
```

- [ ] **Step 4: Manually verify in the browser**

There is no existing automated test for `map.tsx` (Mapbox GL requires a real browser/WebGL context). Run the dev server and confirm the new layer renders:

```bash
npm run dev
```

Navigate to the app, search an address, and confirm no console errors reference `landslide` or `landslideLayer`; toggle the (currently unlabeled, since Task 13 adds the legend entry) fourth hazard once Task 13 is done, and confirm the layer's visibility toggles.

- [ ] **Step 5: Commit**

```bash
git add app/components/map.tsx
git commit -m "feat: add landslide map layer"
```

---

### Task 13: Add landslide entries to `data.ts`

**Files:**
- Modify: `app/data/data.ts`

- [ ] **Step 1: Add the `Hazards` entry**

Change:

```typescript
  {
    id: 2,
    name: "tsunami",
    title: "Tsunami zones",
    description:
      "These coastal areas are at risk of flooding and authorities may recommend evacuation in the event of a tsunami.",
    info: [
      "Buildings in tsunami zones could experience flooding from waves generated by a large earthquake.",
      "Typically, buildings located inland from the coast are less at risk in the event of a tsunami.",
      "Building an emergency kit and planning an evacuation route can help coastal residents be prepared for a tsunami.",
    ],
    link: {
      label: "Tsunami dataset",
      url: "https://www.conservation.ca.gov/cgs/tsunami/maps",
    },
    icon: "square",
    iconColor: "tsunamiBlue",
  },
];
```

to:

```typescript
  {
    id: 2,
    name: "tsunami",
    title: "Tsunami zones",
    description:
      "These coastal areas are at risk of flooding and authorities may recommend evacuation in the event of a tsunami.",
    info: [
      "Buildings in tsunami zones could experience flooding from waves generated by a large earthquake.",
      "Typically, buildings located inland from the coast are less at risk in the event of a tsunami.",
      "Building an emergency kit and planning an evacuation route can help coastal residents be prepared for a tsunami.",
    ],
    link: {
      label: "Tsunami dataset",
      url: "https://www.conservation.ca.gov/cgs/tsunami/maps",
    },
    icon: "square",
    iconColor: "tsunamiBlue",
  },
  {
    id: 3,
    name: "landslide",
    title: "Landslide zones",
    description:
      "These hillside areas are more susceptible to landslides, which can be triggered or worsened by earthquake shaking.",
    info: [
      "Landslide susceptibility zones identify areas where steep or unstable terrain is more likely to slide during heavy rain or strong shaking.",
      "Zones are ranked from low to high susceptibility; this layer highlights only high-susceptibility areas.",
      "Buildings in these zones may face a higher risk of foundation damage or debris impact during a major earthquake.",
    ],
    link: {
      label: "Landslide dataset",
      url: "https://data.sfgov.org/Public-Safety/Landslide-Susceptibility-Hazard-Zones/bna4-itif/about_data",
    },
    icon: "square",
    iconColor: "landslideBrown",
  },
];
```

- [ ] **Step 2: Add the `mockAddressHazardData` fixture entry**

Change:

```typescript
export const mockAddressHazardData = [
  { exists: false, last_updated: null },
  { exists: true, last_updated: null },
  { exists: false, last_updated: null },
];
```

to:

```typescript
export const mockAddressHazardData = [
  { exists: false, last_updated: null },
  { exists: true, last_updated: null },
  { exists: false, last_updated: null },
  { exists: false, last_updated: null },
];
```

- [ ] **Step 3: Add the `DataInfoLinks` entry**

Change:

```typescript
  {
    id: 3,
    name: "tsunami",
    label: "Tsunami Dataset",
    url: "https://www.conservation.ca.gov/cgs/tsunami/maps",
  },
];
```

to:

```typescript
  {
    id: 3,
    name: "tsunami",
    label: "Tsunami Dataset",
    url: "https://www.conservation.ca.gov/cgs/tsunami/maps",
  },
  {
    id: 4,
    name: "landslide",
    label: "Landslide Dataset",
    url: "https://data.sfgov.org/Public-Safety/Landslide-Susceptibility-Hazard-Zones/bna4-itif/about_data",
  },
];
```

- [ ] **Step 4: Add the `PillData` entry**

Change:

```typescript
  {
    name: "tsunami",
    trueData: "In Zone",
    falseData: "Not in Zone",
    noData: "No Data",
  },
];
```

to:

```typescript
  {
    name: "tsunami",
    trueData: "In Zone",
    falseData: "Not in Zone",
    noData: "No Data",
  },
  {
    name: "landslide",
    trueData: "Susceptible",
    falseData: "Not in Zone",
    noData: "No Data",
  },
];
```

- [ ] **Step 5: Add `landslideLayer` to `LayerIds`**

Change:

```typescript
export const LayerIds = ["softStoriesLayer", "seismicLayer", "tsunamiLayer"];
```

to:

```typescript
export const LayerIds = [
  "softStoriesLayer",
  "seismicLayer",
  "tsunamiLayer",
  "landslideLayer",
];
```

- [ ] **Step 6: Run the frontend test suite to check for regressions**

Run: `npx jest`
Expected: PASS. `card-hazard.test.tsx` iterates generically over `Hazards`/`PillData`/`LayerIds` (confirmed in exploration — no hardcoded counts found referencing exactly 3 hazards); if it does hardcode a count of 3, update that test's expected count to 4 rather than changing production code.

- [ ] **Step 7: Commit**

```bash
git add app/data/data.ts
git commit -m "feat: add landslide entries to Hazards, PillData, DataInfoLinks, and LayerIds"
```

---

### Task 14: Manual end-to-end verification

- [ ] **Step 1: Run ETL once to populate `landslide_zones` and export the CDN GeoJSON** (already done in Task 7's live smoke test, or run again locally against seed data / DataSF).

- [ ] **Step 2: Start the full stack**

```bash
docker compose up
```

- [ ] **Step 3: In the browser**

- Confirm the legend shows a fourth "Landslide zones" entry with the placeholder brown swatch.
- Toggle it off/on and confirm the map layer visibility follows.
- Search an address inside a known high-susceptibility landslide zone (e.g., coordinates near `-122.43, 37.72` if using seed data) and confirm the address report card shows a landslide "Susceptible" pill.
- Search an address outside all zones and confirm "Not in Zone".
- Confirm no console errors and no failed network requests to the new endpoints.

- [ ] **Step 4: Run the full backend and frontend test suites one more time**

```bash
pytest backend/ -v
npx jest
```

Expected: PASS

No commit — this is a verification pass. If everything passes, the branch is ready for the `superpowers:requesting-code-review` skill and then a PR against `feat/hazard-lookup-composite-api` (not `develop`, since that's the base this work was built on — merge order should land the composite endpoint first, then this).

---

## Open questions (carried over from the design spec, still unresolved)

- Final legend color and any icon treatment — pending designer input. `landslideBrown` (`#B7791F`) is a placeholder token in `styles/theme.ts`, trivial to swap.
- Whether `useHazardDataFetcher` should eventually migrate all four hazards to the composite `/api/hazards/lookup` endpoint — explicitly out of scope per the design spec's non-goals.
