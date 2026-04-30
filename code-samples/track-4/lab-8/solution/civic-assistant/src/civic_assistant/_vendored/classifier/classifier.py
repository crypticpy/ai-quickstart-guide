"""Vendored classifier from Lab 4.7 (which itself wraps Lab 4.2).

Same shape: a structured-output classifier that returns a Prediction with
.label and .raw, plus a confidence float when the model emits one.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass


DEPARTMENTS = [
    "public_works",
    "animal_services",
    "code_enforcement",
    "sanitation",
    "utilities_billing",
    "permits_and_licensing",
    "human_services",
    "general_info",
]


@dataclass
class Prediction:
    label: str
    confidence: float
    raw: str


STRUCTURED_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with a single JSON object and nothing else, in this exact shape:\n"
    '{"department": "<one of the labels>", "confidence": <float between 0 and 1>}\n'
    "Allowed labels:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)


def classify_structured(message: str, complete) -> Prediction:
    raw = complete(
        system=STRUCTURED_SYSTEM,
        user=f"Message:\n{message}",
        max_tokens=80,
        temperature=0.0,
    )
    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        payload = json.loads(match.group(0)) if match else {}
        dept = str(payload.get("department", "")).strip().lower()
        confidence = float(payload.get("confidence", 0.0))
        if dept in DEPARTMENTS:
            return Prediction(label=dept, confidence=confidence, raw=raw)
    except (json.JSONDecodeError, AttributeError, ValueError):
        pass
    return Prediction(label="general_info", confidence=0.0, raw=raw)
