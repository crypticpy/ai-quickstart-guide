"""Department classifier wrapper. Wraps the vendored Lab 4.7 classifier."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

# Make the shared llm_client importable when running from a dev checkout.
COMMON_DIR = Path(__file__).resolve().parents[5] / "common"
if COMMON_DIR.exists() and str(COMMON_DIR) not in sys.path:
    sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402

from civic_assistant._vendored.classifier import (  # noqa: E402
    DEPARTMENTS,
    classify_structured,
)
from civic_assistant.settings import get_settings  # noqa: E402


@dataclass
class ClassifyResult:
    department: str
    confidence: float
    raw: str


_settings = get_settings()
_complete = None


def _get_complete():
    global _complete
    if _complete is None:
        _complete = get_client(provider=_settings.llm_provider, model=_settings.llm_model)
    return _complete


def classify_message(message: str, *, complete=None) -> ClassifyResult:
    """Run the structured-output classifier and return a validated result.

    The `complete` parameter is injectable for tests that want to swap in
    a fake completion function.
    """
    fn = complete or _get_complete()
    pred = classify_structured(message, fn)
    department = pred.label if pred.label in DEPARTMENTS else "general_info"
    return ClassifyResult(
        department=department,
        confidence=pred.confidence,
        raw=pred.raw,
    )
