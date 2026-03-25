import json
import os
import sys
from typing import Any
import urllib.error
import urllib.parse
import urllib.request


def _get_json(url: str):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=20) as resp:
        body = resp.read().decode("utf-8")
        return resp.status, json.loads(body) if body else None


def _get_status(url: str):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.status


def _assert(cond: bool, msg: str):
    if not cond:
        raise AssertionError(msg)


def _assert_feature_collection(name: str, data: dict[str, Any], min_count: int) -> None:
    features = data.get("features")
    if not isinstance(features, list):
        raise AssertionError(f"{name}: 'features' must be a list")

    _assert(
        len(features) >= min_count,
        f"{name}: expected at least {min_count} features, got {len(features)}",
    )


def main():
    base = os.environ.get("SMOKE_BASE_URL", "").rstrip("/")
    if not base:
        raise RuntimeError(
            "SMOKE_BASE_URL is required, e.g. https://your-api.up.railway.app"
        )

    min_soft = int(os.environ.get("MIN_SOFT_STORIES_COUNT", "1"))
    min_tsunami = int(os.environ.get("MIN_TSUNAMI_COUNT", "1"))
    min_liq = int(os.environ.get("MIN_LIQUEFACTION_COUNT", "1"))

    # 1) Health
    status = _get_status(f"{base}/api/health")
    _assert(status == 200, f"/api/health expected 200, got {status}")

    # 2) Collection endpoints
    status, data = _get_json(f"{base}/api/soft-stories")
    _assert(status == 200, f"/api/soft-stories expected 200, got {status}")
    _assert_feature_collection("soft-stories", data, min_soft)

    status, data = _get_json(f"{base}/api/tsunami-zones")
    _assert(status == 200, f"/api/tsunami-zones expected 200, got {status}")
    _assert_feature_collection("tsunami-zones", data, min_tsunami)

    status, data = _get_json(f"{base}/api/liquefaction-zones")
    _assert(status == 200, f"/api/liquefaction-zones expected 200, got {status}")
    _assert_feature_collection("liquefaction-zones", data, min_liq)

    # 3) Ping checks (same intent as current tests)
    status, data = _get_json(f"{base}/api/soft-stories/is-soft-story?ping=true")
    _assert(status == 200, "soft-story ping failed")
    _assert(data.get("exists") is False, "soft-story ping expected exists=false")

    status, data = _get_json(f"{base}/api/tsunami-zones/is-in-tsunami-zone?ping=true")
    _assert(status == 200, "tsunami ping failed")
    _assert(data.get("exists") is False, "tsunami ping expected exists=false")

    status, data = _get_json(
        f"{base}/api/liquefaction-zones/is-in-liquefaction-zone?ping=true"
    )
    _assert(status == 200, "liquefaction ping failed")
    _assert(data.get("exists") is False, "liquefaction ping expected exists=false")

    # 4) Missing params should 400
    for path in [
        "/api/soft-stories/is-soft-story",
        "/api/tsunami-zones/is-in-tsunami-zone",
        "/api/liquefaction-zones/is-in-liquefaction-zone",
    ]:
        try:
            _get_json(f"{base}{path}")
            raise AssertionError(f"{path} expected 400 but returned success")
        except urllib.error.HTTPError as e:
            _assert(e.code == 400, f"{path} expected 400, got {e.code}")

    print("✅ Deployed API smoke test passed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Smoke test failed: {e}")
        sys.exit(1)
