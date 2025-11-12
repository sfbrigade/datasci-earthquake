#!/usr/bin/env python3
"""

This script checks that environment variables declared by the Settings class
in backend/api/config.py appear in .env.example.

Functions:
    - get_expected_env_keys_from_settings(): Imports `Settings` and returns the
    expected env variable keys. This uses Pydantic v2's `model_fields` metadata
	to list declared fields and converts them to canonical env names (uppercase).
    - parse_env_example(path): Parses a .env-style file and returns the set of keys
    present.
    - main(argv): Main entry point; compares expected keys to those in
    .env.example and reports any missing keys.

Usage:
Run locally: `python check_env_sync.py`

This script is intended to run as part of the pre-commit/CI checks to ensure
every field declared on backend.api.config.Settings appears in .env.example.
Exit codes: 0 = OK, 1 = missing variables, 2 = Settings import error.

"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Iterable, Set


REPO_ROOT = Path(__file__).resolve().parents[1]
ENV_EXAMPLE = REPO_ROOT / ".env.example"


def get_expected_env_keys_from_settings() -> Set[str]:
    # Import inside function so the module import error can be handled by caller if needed
    from backend.api.config import Settings

    # Settings.model_fields is a mapping of field_name -> FieldInfo (pydantic v2)
    # We just need the declared field names; the env variable convention is
    # uppercase of the field name (this is the project's convention).
    field_names = list(Settings.model_fields.keys())

    # Normalize to canonical env keys
    return {name.upper().replace(".", "_") for name in field_names}


def parse_env_example(path: Path) -> Set[str]:
    keys: Set[str] = set()
    text = path.read_text(encoding="utf8")
    for idx, raw in enumerate(text.splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        key, _ = line.split("=", 1)
        key = key.strip()
        if key:
            keys.add(key)
    return keys


def main() -> int:
    # 1) Get expected keys from Settings
    try:
        expected = get_expected_env_keys_from_settings()
    except (
        Exception
    ) as exc:  # pragma: no cover - import errors are environment specific
        print(f"Error importing Settings: {exc}", file=sys.stderr)
        return 2

    # 2) Parse .env.example
    example_keys = parse_env_example(ENV_EXAMPLE)

    # 3) Compare
    missing = sorted(expected - example_keys)

    if missing:
        print("Missing environment variables in .env.example:")
        for k in missing:
            print(f"  - {k}")
    else:
        print("All expected environment variables are present in .env.example.")

    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
