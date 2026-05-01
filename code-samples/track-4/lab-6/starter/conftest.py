"""Pytest fixtures for Lab 4.6.

The cassette fixture lets tests run against recorded model responses on
CI without burning real API budget. On first run with `RECORD_CASSETTES=1`,
new (system, user) pairs are sent to the live model and saved to
`cassettes/<test_name>.json`. On every later run, cached replies are
returned without a network call.

Set `LIVE=1` to bypass the cassette and always hit the API.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Callable

import pytest

# Make the vendored classifier importable from the test files.
LAB_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(LAB_DIR))

# Make the shared llm_client importable.
COMMON_DIR = LAB_DIR.parents[1] / "common"
sys.path.insert(0, str(COMMON_DIR))

CASSETTE_DIR = LAB_DIR / "cassettes"
CASSETTE_DIR.mkdir(exist_ok=True)


def _cassette_path(name: str) -> Path:
    return CASSETTE_DIR / f"{name}.json"


def _key(system: str, user: str, model: str) -> str:
    h = hashlib.sha256()
    h.update(model.encode())
    h.update(b"\x00")
    h.update(system.encode())
    h.update(b"\x00")
    h.update(user.encode())
    return h.hexdigest()[:16]


@pytest.fixture(scope="session")
def cassette_complete() -> Callable[..., str]:
    """Return a `complete` function backed by an on-disk cassette.

    Behavior:
      * `LIVE=1`            -> always call the real API, do not write cassettes.
      * `RECORD_CASSETTES=1`-> on cache miss, call the API and write to disk.
      * default             -> on cache miss, raise so CI fails loudly instead
                              of silently making a paid API call.
    """
    cassette_file = _cassette_path("default")
    cache: dict[str, str] = {}
    if cassette_file.exists():
        cache = json.loads(cassette_file.read_text())

    live = os.environ.get("LIVE") == "1"
    record = os.environ.get("RECORD_CASSETTES") == "1"

    real_complete = None
    if live or record:
        from llm_client import get_client

        real_complete = get_client(provider="anthropic")

    def complete(system: str, user: str, **kwargs) -> str:
        model = os.environ.get("ANTHROPIC_MODEL_ID", "provider-model-slug")
        key = _key(system, user, model)
        if not live and key in cache:
            return cache[key]
        if real_complete is None:
            raise RuntimeError(
                "Cassette miss and neither LIVE=1 nor RECORD_CASSETTES=1 is set. "
                "Run with RECORD_CASSETTES=1 to populate, or LIVE=1 to bypass."
            )
        text = real_complete(system, user, **kwargs)
        if record and not live:
            cache[key] = text
            cassette_file.write_text(json.dumps(cache, indent=2, sort_keys=True))
        return text

    return complete


@pytest.fixture(scope="session")
def golden_cases() -> list[dict]:
    rows: list[dict] = []
    path = LAB_DIR / "tests" / "golden.jsonl"
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        if "_comment" in row:
            continue
        rows.append(row)
    return rows
